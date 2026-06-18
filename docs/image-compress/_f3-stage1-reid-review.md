# F3 Stage1 評価レポート（Reid / 規範・品質の独立評価）

> 評価者: Reid（制作部 / コードレビュー・規範照合・品質判定）
> 立場: 生成に一切関与していないクリーンな評価者（evaluation-gate.md 準拠）
> 評価対象: Cody 実装の F3 Stage1（基盤＋WebP経路）
> 評価日: 2026-06-17
> 拠り所: 01_spec.md / _f2-mane-review.md（M-1 / S-2）/ coding-rule.md / design-concept.md §2-2

---

## 判定

**条件付き合格**

Stage1 の主目的（基盤＋WebP経路＋Worker内WASMパス解決）は良く設計されており、規範準拠・A11y・パフォーマンス設計はいずれも高水準。Must M-1（Worker内WASMパス解決）は「emscripten に locate させず `?url` で確定 URL を fetch→compile→`init(module)`」という方式で**正しく解決されている**ことをコードと `node_modules/@jsquash/webp` の実装・`dist/` の build 成果物の両面から確認した。

ただし**1件、Must 級の潜在的correctnessバグ**を発見した（SIMD/非SIMD モジュール不整合）。Cody の e2e は SIMD 対応 Chrome のみで通っており、非SIMD 環境で WebP エンコードが失敗しうる経路が残っている。これは「20〜30枚で固まらないか」とは別軸の堅牢性問題で、合格前に潰すべき。差し戻し（再設計）ではなく、`wasm-webp.js` の数行修正で解消できるレベルのため条件付き合格とする。

---

## 1. Must M-1（Worker内WASMパス解決）の独立検証 — クリア（ただし下記 M-A の注意あり）

Cody の主張を鵜呑みにせず、実装と依存パッケージを読んで判定した。

- `wasm-webp.js`: `import webpWasmUrl from "@jsquash/webp/codec/enc/webp_enc_simd.wasm?url"` → Vite が base(/tools/)＋fingerprint 付き最終 URL に解決。これを `fetch`→`WebAssembly.compile`→`init(module)` に渡す。**emscripten の `import.meta.url` 起点 locateFile に依存しない**ため Worker 内でも base 配下で安定する。設計判断は妥当。
- `node_modules/@jsquash/webp/encode.js` の `init(module)` は「引数が `WebAssembly.Module` ならそれを `initEmscriptenModule` に渡す」設計（`arguments.length===1 && module instanceof WebAssembly.Module` 分岐）であることを確認。Cody の主張は正確。
- `node_modules/@jsquash/webp/utils.js` の `initEmscriptenModule` は `wasmModule` がある時 `instantiateWasm` で `new WebAssembly.Instance(wasmModule, imports)` を使う＝**渡した compiled Module をそのまま instantiate する**ことを確認。
- `worker-client.js`: `new Worker(new URL("./encode.worker.js", import.meta.url), { type: "module" })`＝Vite 公式の Worker 解決手段でメイン側も base 付き URL に解決。
- `vite.config.js`: `worker: { format: "es" }` 追加は妥当。Worker が `@jsquash/webp` を動的 import（コード分割）するため iife では build 失敗する、という理由も正しい。
- build 成果物確認: `dist/assets/encode.worker-*.js` が存在し、`webp_enc_simd-*.wasm`（345KB）＋`webp_enc-*.wasm`（281KB）の両方が `dist/assets/` に出力されている。

→ **メインスレッド／Worker 双方の `.wasm` パス解決は base(/tools/) 配下で成立**。Must M-1 はクリア。

---

## 2. 指摘一覧（Must / Should / Nice）

### Must（合格前に必須）

**M-A: SIMD 固定 URL と `init()` 内部の SIMD 検出が不整合（非SIMD環境で WebP エンコード失敗）**
- ファイル: `dev/src/assets/js/image-compress/wasm-webp.js` L25 ＋ `encode.worker.js` L13/L19
- 問題: `wasm-webp.js` は `webp_enc_simd.wasm`（SIMD 版）のみを `?url`→compile して `init(module)` に渡す。しかし `@jsquash/webp/encode.js` の `init()` は内部で `await simd()`（wasm-feature-detect）を再実行し、**SIMD 非対応環境では `webp_enc.js`（非SIMD 版ファクトリ）を import** する。その非SIMD ファクトリに対して **SIMD 版でコンパイルした `WebAssembly.Module`** を `instantiateWasm` で食わせるため、import シグネチャ不整合で `WebAssembly.Instance` 生成が失敗する（＝そのブラウザでは全 WebP エンコードがエラー → 1枚失敗継続で全件 error 表示になる）。`dist/` に非SIMD wasm も出力されている事実が、ライブラリが非SIMD 経路を持つことの裏付け。
- なぜ表面化していないか: Cody の e2e は SIMD 対応ローカル Chrome のみ。SIMD は現代ブラウザでほぼ有効なため平時は通るが、古い端末・一部設定・将来の検証環境で落ちる。「画像を潰さない／壊れたと誤認させない」という本ツールの非機能の生命線に対し、環境依存で全滅する経路を残すのは Must。
- 修正方針（いずれか）:
  - (a) `simd()` をこちら側でも判定し、`webp_enc_simd.wasm?url` / `webp_enc.wasm?url` を**分岐して**取得・compile し、`init()` には**同じ系統の module を渡す**（`init()` 内部の `simd()` 判定と一致させる）。両 `?url` を静的 import しておけば Vite が両方を asset 化する（build 上は既に両方出ている）。
  - (b) より堅牢には、`init()` の SIMD 自動分岐に乗らず、`@jsquash/webp/codec/enc/webp_enc.js`（または simd 版）の factory を**自前で固定 import** し、対応する wasm を確定 URL から渡して `initEmscriptenModule` 相当を自前で組む（フォーマット追加時の制御も明確になる）。
  - 最低限 (a) を実施し、F4 で SIMD 無効環境（または `wasm-feature-detect` を強制 false にしたフラグ）での動作を1度確認すること。

### Should（推奨）

**S-1: `classifyFile` の受入判定が spec の accept より緩い（GIF/AVIF を通すが Stage1 はエンコード未対応）**
- ファイル: `dev/src/assets/js/image-compress/main.js` L27（`okExt` に `"gif","avif"` を含む）＋ `presets.js` L111（`acceptExtra`）
- 問題: HTML の `<input accept>` は `png,jpeg,webp` に正しく絞っている（spec §6-1 必須形式と一致）が、D&D 経由では `classifyFile` が gif/avif も accepted にする。Stage1 のエンコード経路は WebP/keep のみで、GIF/AVIF 入力は `createImageBitmap` でデコード自体は通っても「任意受入・優先度低」(spec §6-1)の扱いが曖昧。アニメ GIF は spec で明確に非対応だが、静止画 GIF と区別せず通る。
- 修正方針: spec §6-1 は GIF/AVIF を「任意（受けてもよい・優先度低）」としているので**仕様違反ではない**が、(1) アニメ GIF は1フレーム目だけ静止画化される旨をどこかに明記するか、(2) Stage1 では `acceptExtra` を空にして png/jpeg/webp に揃え accept 属性と一致させる、のいずれかで挙動を明確化することを推奨。少なくとも「受入したが想定外フォーマット」の場合の通知があると親切。

**S-2: keep（元形式維持）が常に JPEG 化＝拡張子追従(D10)と組み合わせると PNG/WebP 入力でも `.jpg` 出力になる**
- ファイル: `image-ops.js` `encodeKeepJpeg`（L54〜）＋ `main.js` `encodeItem` L357-360（`ext:"jpg"` 固定）
- 問題: 「元形式を維持」というラベル(UI: `renderDetailControls` L241「元形式を維持（JPEG最適化）」)に対し、実装は入力が PNG/WebP でも JPEG へ変換し白背景で平坦化する。D7 は確かに「JPEG 穏やか最適化が主眼」だが、UI 文言「元形式を維持」と実挙動（常に JPEG 化）に乖離がある。透過 PNG を keep で出すと白背景が焼かれる＝意図しない劣化になりうる。Cody のノート §6 でも「要確認」として自覚されている。
- 修正方針: Stage1 ではラベルを「JPEG で穏やか最適化」等、実挙動に合わせた文言にするのが安全（「元形式を維持」だと PNG→PNG を期待させる）。本来の「元形式維持」（PNG入力はPNGのまま最適化）は oxipng が入る Stage3 で実現する設計のはずなので、文言を Stage 進行に追従させる。★黒田さん確認推奨（UX 文言）。

**S-3: `<output>` 要素を `for` で紐付けていない（quality 表示の関連付けが弱い）**
- ファイル: `_c-ic-card.scss` 経由の `renderDetailControls` L258（`<output data-ic-quality-out>`）
- 問題: range の現在値を表示する `<output>` に `for="ic-q-${id}"` が無い。機能上は動くが、`<output>` は `for` で関連入力を示せる要素であり、A11y 的には付与が望ましい。
- 修正方針: `<output for="ic-q-${item.id}" data-ic-quality-out>` を付与。Nice 寄りだが A11y 観点で Should に置く。

### Nice（任意）

**N-1: `renderItem` で毎回 `URL.createObjectURL(item.file)` を作るが before サムネ URL を revoke していない**
- ファイル: `main.js` `renderItem` L171（`thumbUrl`）／`item._thumbUrl` に保持はするが revoke 箇所なし
- 問題: 種別変更・フォーマット変更のたびに `renderItem` が再実行され、before サムネ用 Object URL が作られるが、古い `item._thumbUrl` を revoke していない（after サムネ側 `ensureAfterThumb` は revoke 済みで対比的）。1枚を何度も種別変更すると Object URL がリークする。大量枚数＋頻繁な操作で塵が積もる。
- 修正方針: `renderItem` 冒頭で `if (item._thumbUrl) URL.revokeObjectURL(item._thumbUrl)` を入れる。after サムネと同じ作法に揃える。メモリ解放（spec §3-b の生命線）の観点で拾った。

**N-2: `escapeHtml` は実装されているが、ファイル名以外の動的差し込みは preset 由来の固定文字列で安全。問題なし（確認のみ）。**

**N-3: 進捗バーの `style.inlineSize` 直書きは妥当な例外**
- `main.js` `showProgress` L461 の `style.inlineSize` 動的更新は、進捗％という動的値のため SCSS で表現不可＝インライン style 禁止の正当な例外。規範違反ではない（Cody ノート §5 の自己申告どおり）。確認のみ。

**N-4: GIF/アニメ判定なし（S-1 と関連）。Stage 後送りで可。**

---

## 3. 規範準拠（coding-rule.md 照合）— 良好

- **FLOCSS 命名**: `c-ic` / `c-ic-btn` / `c-ic-card` / `c-ic-dropzone` 等、BEM（`__elem` / `--mod`）・kebab-case・1ファイル=1Block を遵守。`c-` 接頭辞（再利用部品＝操作面コンポーネント）の選択も妥当。`js-` ではなく `data-ic-*` 属性で JS フックを取得しており、CSS と JS の責務分離は守られている（`.js-` プレフィックスの代替として `data-*` 採用は許容範囲）。
- **論理プロパティ**: `padding-block`/`padding-inline`/`margin-block-start`/`inline-size`/`block-size`/`border-block-start` を徹底。物理プロパティの個別指定は見当たらない。横断ルール(3)準拠。
- **SCSS 構成**: `components/` 配下に置き glob 自動取り込み（`@use "components/**"`）に乗る独立ファイル群＝第4章準拠。`@use "../global" as *` も既存作法どおり。
- **デザイントークン**: design-concept §2-2 の差分トークン `--dropzone-*` / `--field-*` / `--tool-panel-*` を正しく使用。使用トークン（`--dropzone-bg-active` / `--field-border-focus` / `--color-accent-fixed-hover` / `--font-family-mono` 等）はすべて `_variables.scss` 等に定義済みであることを grep で確認（未定義トークン参照ゼロ）。独自色の新規追加なし。
- **インライン style**: 進捗バー幅のみ（N-3＝正当な例外）。静的スタイルは全て SCSS。違反なし。
- **`u-visually-hidden`**: グローバル汚染を避けコンポーネント内スコープ（`.c-ic .u-visually-hidden`）で定義。妥当。
- 軽微: `_c-ic-card.scss` L144 `rgb(42 157 110 / 12%)` のみ生の色値直書き（success の薄背景）。トークン化されていないが、12% 透過の一時色で許容範囲。Nice 未満。

## 4. アクセシビリティ — 良好

- ドロップゾーン: `role="button"`＋`tabindex="0"`＋Enter/Space で file ダイアログ、`<input type=file>` 併設、`aria-label` 付与、`:focus-visible` で outline。spec §4-1 の A11y 必須要件を満たす。
- ラベル紐付け: 種別/フォーマット/quality/maxEdge いずれも `<label for>` で紐付け。アイコンのみのラベルには `<span class="u-visually-hidden">種別</span>` で代替テキスト併記。
- 進捗: `role="progressbar"`＋`aria-valuemin/max/now`、進捗テキストと通知に `aria-live="polite"`。サイズ表示も `aria-live`。
- アイコン: すべて `aria-hidden="true"` ＋ `focusable="false"`、意味は隣接ラベルが担う。icons.js の方針どおり。
- 改善余地: S-3（`<output for>`）のみ。

## 5. レスポンシブ — 概ね良好（明示的 768px 分岐は持たないが破綻しにくい設計）

- `_c-ic*.scss` 内に `mq()`/`@media` は無く、`flex-wrap`／`flex: 1 1 12rem`／`min-inline-size: 0`／`object-fit: cover` で**自然な折返し**に委ねる設計。1行カードは `c-ic-card__main` が `flex-wrap` でモバイルでサムネ→本文→アクションが縦積みになり破綻しにくい。
- フィールドは `--field-min-size`(16px)＋`min-height: var(--touch-target-min)` でタッチ操作面・iOS ズーム回避を確保。ボタンも `min-height: touch-target-min`。
- 懸念: ドロップゾーン・展開 UI は内容が少なくモバイルでも問題なさそうだが、**実機（768px 未満）でのカード折返しと After サムネ並置時の横幅**は F4 で目視確認が望ましい（コード上の破綻は見当たらない）。`@include hover` でタッチ環境の hover 誤発火も抑止済み。

## 6. パフォーマンス／堅牢性（最重要）— 良好（M-A を除く）

- **逐次処理**: `runCompression` が `for` ＋ `await encodeItem` で1枚ずつ直列化。Worker は1つを共有。並列 WASM 暴走なし。spec §3-b 準拠。
- **Transferable**: `worker-client.js` が `postMessage({...},[rgba])`、Worker 側も結果 `buffer` を `[resultBuffer]` で返却。双方向 Transferable でコピーコスト回避。
- **1枚失敗継続**: `encodeItem` を try/catch で囲み、当該1枚を `paintError` して次へ。Worker 致命エラー時も pending を全 reject して main 側 try/catch で継続。spec §3-b 準拠。
- **メモリ解放**: `prepareRgba`/`encodeKeepJpeg`/`readImageMeta` で `bitmap.close()` を実行。after サムネ Object URL は revoke 済み。DL 用 URL も `setTimeout(...,1000)` で revoke。→ 概ね良好。**ただし before サムネ URL の revoke 漏れ（N-1）**は残る。
- **ガード**: D8（枚数 30／1枚 25MB）を `LIMITS` で定数化し `addFiles`/`classifyFile` で警告・スキップ。超過1枚だけスキップ＋全体継続。spec §6-1/D8 準拠。
- **ZIP**: 既圧縮済みのため `zipSync(entries,{level:0})` で無圧縮高速化＝合理的。`makeUniqueName` で同名衝突回避（D10 ZIP 内規則）。

## 7. 仕様整合（6種別パラメータ・D系）— 正確

- **6種別**: presets.js の format/quality/maxEdge が 01_spec §1 と完全一致（①WebP55/1920 ②WebP85/2560・manualOnly ③WebP72/1600 ④WebP80/1600 ⑤可逆/null ⑥可逆/null）。①②③④の AVIF 値は Stage2 送りで正しくコメント化。
- **D1**（HEIC案内）: `classifyFile` で heic/heif を弾き、当該1枚だけ案内メッセージ＋全体継続。✅
- **D3**（EXIF削除＋Orientation正立）: `createImageBitmap(file,{imageOrientation:"from-image"})` で正立焼き込み、Canvas 再描画でメタ落ち。非対応環境はフォールバック。✅
- **D7**（keep-JPEG q≈82）: `convertToBlob({type:"image/jpeg",quality:0.82})`。✅（ただし「元形式維持」文言は S-2）
- **D8**（枚数・サイズガード）: ✅（上記6）。
- **D10**（拡張子追従）: `swapExtension` で `photo.png`→`photo.webp`。✅
- **⑤⑥（＋④PNG経路）の WebP暫定→Stage3 oxipng 差し替え TODO**: presets.js 各 `stage3Todo` に明記。✅
- **②手動昇格導線（S-2/Should）**: 一括エリアの `c-ic-bulk__hint` ＋ ③割当カードの `c-ic-card__promote` ヒントで実装済み。✅ F2 の Should S-2 を満たす。
- **STAGE1_UNSUPPORTED_FORMATS**（AVIF/PNG可逆）: プルダウンに `disabled` で見せ、選択されたら WebP 降格＋通知の経路を実装済み。Stage2-3 で本実装に置換しやすい。✅

## 8. 構造の拡張性 — 良好

- フォーマット識別子を `FORMAT` 定数に集約、`encodeItem` が format で分岐＝AVIF/PNG可逆を分岐追加しやすい。
- WASM 初期化を `wasm-webp.js` に隔離し、Worker は `ensureWebpReady()` 経由。oxipng/imagequant/avif 用の同型モジュール（`wasm-avif.js` 等）を並列に足せる構造。
- presets の差し替え（`stage3Todo` の oxipng 化）も presets.js 1か所で完結。
- 自動推測トグルは UI（disabled）のみ設置済みで Stage4 でロジックを載せやすい。readImageMeta が既にメタ取得の足場を用意。
- ただし M-A の解消時に「SIMD/非SIMD の module 取得」を汎用化しておくと、AVIF/oxipng 追加時に同じ轍を踏まない（構造的助言）。

---

## 自己検証

1. **Must M-1 の解決可否はコードを読んで判断したか** → 済。`wasm-webp.js`/`encode.worker.js`/`worker-client.js`/`vite.config.js` に加え `node_modules/@jsquash/webp/{encode.js,utils.js}` の `init`/`initEmscriptenModule` 実装と `dist/` の build 成果物（worker chunk・両 wasm 出力）まで確認。主張は正確だが、その検証過程で M-A（SIMD/非SIMD 不整合）を新たに発見した。
2. **大量画像で固まらない設計か（逐次・メモリ解放）を具体的コード箇所で確認したか** → 済。逐次（main.js `runCompression`）・Transferable（worker-client/worker 双方）・bitmap.close（image-ops）・Object URL revoke（after/DL は済・before は N-1 で漏れ）を行単位で確認。
3. **指摘は再現可能な粒度（パス＋箇所＋修正方針）か** → 済。全指摘にファイルパス・該当行・修正方針を付与。

- 検証済み: Must M-1（Worker内WASMパス解決）— ライブラリ実装・build 成果物まで遡及して成立を確認。
- 検証済み: 規範準拠（FLOCSS/論理プロパティ/トークン/インラインstyle）— 違反なし（未定義トークン参照ゼロを grep 確認）。
- 検証済み: パフォーマンス/堅牢性 — 逐次・Transferable・失敗継続・ガードは良好。メモリ解放は before サムネ revoke 漏れ（N-1）のみ。
- 検証済み: 仕様整合（6種別・D1/D3/D7/D8/D10・S-2導線・Stage3 TODO）— 正確。
- 新規発見: M-A（SIMD/非SIMD モジュール不整合）— 合格前に要修正（Must）。
