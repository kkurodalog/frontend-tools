# F3 Stage1 実装ノート（Cody / WebP 経路で動く本体）

担当: Cody（制作部）/ 2026-06-17 / 対象: `dev/src/image-compress/` ＋ `dev/src/assets/js/image-compress/` ＋ `dev/src/assets/styles/components/_c-ic*.scss`

## 1. ★Must M-1: Worker 内 WASM パス解決（最優先・検証結果）

### 採用した解決方法
emscripten グルー（`@jsquash/webp` の `webp_enc.js`）は既定で **`import.meta.url` 起点の `scriptDirectory`** から `.wasm` を locateFile する。これは Worker 内では「Worker スクリプト URL 起点」で解決され、`base:"/tools/"` 配下で不安定になりうる（メインスレッドの asset 解決とは別物）。

そこで **emscripten に locate させず、こちらで `.wasm` URL を確定して渡す方式**を採用:

1. `wasm-webp.js` で `import webpWasmUrl from "@jsquash/webp/codec/enc/webp_enc_simd.wasm?url"` — Vite が **base(/tools/) ＋ fingerprint 付きの最終 URL 文字列**に解決する。
2. その URL を `fetch` → `WebAssembly.compile` し、コンパイル済み `WebAssembly.Module` を `init(module)` に渡す（`@jsquash/webp` は引数が `WebAssembly.Module` ならそれを使う設計 = `utils.initEmscriptenModule` で確認済み）。
3. Worker 生成は `new Worker(new URL("./encode.worker.js", import.meta.url), { type: "module" })`（Vite 公式の Worker 解決手段。base を含む最終 URL に解決）。

### vite.config.js の変更（必須・理由明記）
`worker: { format: "es" }` を追加。Worker が `@jsquash/webp` を dynamic import（WASM 遅延ロード＝コード分割）するため、既定の iife では `UMD and IIFE output formats are not supported for code-splitting builds` でビルド失敗する。ES 形式で解決。

### 検証結果（build 時の静的確認）
- `dist/assets/encode.worker-*.js` 内の wasm 参照 = `"/tools/assets/webp_enc_simd-CFvKQ_80.wasm"`（base 付与済み・絶対）。
- メイン側の Worker URL = `new URL("/tools/assets/encode.worker-*.js", import.meta.url)`（base 付与済み）。

### 検証結果（runtime e2e・puppeteer-core ＋ ローカル Chrome / 一時スクリプトで実施後に削除）
| 環境 | URL | 結果 |
|---|---|---|
| `yarn build` → `yarn preview` | `http://localhost:4173/tools/image-compress/` | ✅ 20KB PNG → 1KB WebP / console error 0 |
| `yarn dev` | `http://localhost:5181/tools/image-compress/` | ✅ 20KB PNG → 1KB WebP / console error 0 |
| 複数枚フルフロー（preview） | 3枚（keep-JPEG 1 ＋ 可逆WebP 2）→ 一括⑥ ＋ 個別keep ＋ ZIP | ✅ After 3件表示 / err 0 / ZIP `compressed-images.zip` / console error 0 |

→ **dev / build(preview) 双方で Worker 内 WASM 解決が成立**。Must M-1 クリア。

## 2. 実装ファイル一覧

### JS（`dev/src/assets/js/`）
- `image-compress.js` — ページ専用エントリー（image-compress の HTML からのみ `<script type=module>` で読む。共通 script.js には載せない）。
- `image-compress/main.js` — UI 構築・状態管理・逐次エンコード・進捗・Before/After・DL/ZIP。
- `image-compress/presets.js` — 6種別⇄パラメータ確定表（§1）を実装定数化。LIMITS（D8）も集約。**実機調整はこのファイル1か所**。
- `image-compress/image-ops.js` — Canvas/createImageBitmap でデコード・Orientation正立焼き込み（D3）・リサイズ・RGBA抽出・keep-JPEG（D7）。
- `image-compress/encode.worker.js` — WebP エンコード Worker（Transferable で受け渡し・1メッセージ1枚）。
- `image-compress/worker-client.js` — Worker のメイン側ラッパー（id 対応・error 継続）。
- `image-compress/wasm-webp.js` — ★Must M-1 の核。wasm URL を `?url` で解決→fetch→compile→init。
- `image-compress/icons.js` — インラインSVGアイコン（Lucide ライク・§7 言語不問・外部依存ゼロ）。
- `image-compress/util.js` — formatBytes / reductionPercent / 拡張子追従（D10）/ ZIP名ユニーク化。

### SCSS（`dev/src/assets/styles/components/`・glob 自動取り込み）
- `_c-ic.scss` — 本体枠・ドロップゾーン・一括選択・通知・フィールド共通・進捗・visually-hidden（コンポーネント内スコープ）。
- `_c-ic-btn.scss` — ボタン（primary/outline/ghost/dl）。本体トーン準拠。
- `_c-ic-card.scss` — 1行カード（before サムネ・種別ラジオ〔トグル開閉〕・容量/削減率の数値表示）。

### HTML / データ
- `src/image-compress/index.html` — プレースホルダを本体UIに置換。
- `src/data/meta.json` — image-compress の title/description から「準備中」を除去。

## 3. 6種別⇄パラメータの落とし込み（§1 確定表）
| # | 種別 | Stage1 format | quality | maxEdge | 備考 |
|---|---|---|---|---|---|
| ① bg | WebP | 55 | 1920 | |
| ② photo-key | WebP | 85 | 2560 | manualOnly（自動推測対象外フラグ） |
| ③ photo | WebP | 72 | 1600 | 既定の一括初期値 |
| ④ illust | WebP | 80 | 1600 | PNG減色は Stage3 TODO |
| ⑤ icon | WebP可逆 | 可逆 | null(リサイズなし) | SVG助言バナー表示・oxipng は Stage3 TODO |
| ⑥ screenshot | WebP可逆 | 可逆 | null | oxipng は Stage3 TODO |

## 4. Stage2 以降へ送る項目（差し替え TODO）
- **⑤⑥（＋④PNG経路）は本来 PNG 可逆（oxipng）**。Stage1 は **WebP 可逆（lossless）で暫定**。`presets.js` の各 preset `stage3Todo` にメモ済み。Stage3 で oxipng に差し替える。
- **AVIF**（Stage2）/ **PNG可逆・imagequant減色**（Stage3）はフォーマットプルダウンに `disabled` 項目として表示済み。`STAGE1_UNSUPPORTED_FORMATS` に入れ、選択されたら **WebP に降格＋通知**する経路を実装済み（Stage2-3 で本実装に置換）。
- **自動種別推測トグル**（Stage4）= UIだけ設置（`disabled`）。ロジック未実装。
- **②手動昇格導線（Should S-2）**= 一括エリアのヒント文＋③割当カードのヒントで実装済み（Stage4 の推測実装時もこの導線は維持）。
- **ルーペ拡大（D6 任意）**= Stage1 では未実装（並置のみ）。後送り。
- **フォルダ一括（webkitdirectory・D9 任意）**= 時間配分の都合で未実装。Stage後送り可。
- **SEOメタ/JSON-LD/逆導線CTA**（Stage4）= 範囲外。

## 5. 規範・A11y 準拠
- 論理プロパティ使用（inline-size/block-size/padding-block/margin-block-start 等）。
- インライン style 不使用（進捗バー幅のみ JS で `style.inlineSize` を動的更新＝動的値のため不可避・静的スタイルは全て SCSS）。
- FLOCSS 命名（c-ic / c-ic-card / c-ic-btn・BEM）。SCSS は components/ glob で自動取り込み。
- A11y: ドロップゾーン `role=button`＋`tabindex=0`＋Enter/Space＋`<input type=file>` 併設。種別/フォーマット/quality は `<label for>` 紐付け。進捗・通知・サイズは `aria-live`。アイコンは `aria-hidden`（意味は隣接ラベル）。
- CSS は `<head>` link（既存方式踏襲・FOUC対策）。JS は image-compress ページのみ読み込み。

## 5-A. UI再設計（2026-06-17 / spec §0・§1-1・§1-2・§3-c・§4・§6-2・§7 反映）

黒田さん実機確認後の確定要件5点を spec 準拠で改修。Stage1 のエンコード資産（Worker/WASM/keep-JPEG）は据え置き、UI層と複数出力オーケストレーションを作り替えた。

### 変更点
1. **種別＝ラジオ化**: プルダウン全廃。一括は `fieldset[data-ic-bulk-type]`＋`legend`＋6枚のラジオカード（`.c-ic-typecard`／radio は visually-hidden、label にアイコン＋番号ラベル＋§1-2説明文）。個別は各カードの `fieldset[data-ic-card-type]`（「種別を変える」トグルで開閉・同一6択ラジオ）。`name` でグループ分離＝矢印キー移動はネイティブ。`radio:checked + label` で accent 枠、`:focus-visible + label` でフォーカスリング。
2. **全種別に説明文**: §1-2 の確定6文言を `preset.desc` に格納し `.c-ic-typecard__desc` で表示（一括・個別とも）。
3. **出力フォーマット＝チェックボックス（複数可）**: `fieldset[data-ic-bulk-format]`＋`.c-ic-fmtcard`。`FORMAT_DEFS`（presets.js）に stage/enabled/ext/mime を集約。**AVIF(Stage2)・PNG(Stage3) は `disabled`＋「準備中」バッジ**でチェック不可（`isFormatEnabled()`）。WebP・JPEG(D7) は Stage1 稼働で選択可。種別変更で推奨フォーマット（`recommendedFormats`）に既定チェック追従（`initialCheckedFormats()`／⑤⑥はPNG推奨だがStage1未稼働のためWebPへフォールバック＝出力0件防止）。
4. **複数出力パイプライン**: `encodeItemFormats()` が1入力→選択フォーマット数ぶん逐次エンコード→`item.results[]`。リサイズ済みRGBAは `ensureRgba()` で1回だけ生成し、Worker転送で detach されるため各フォーマットへ `rgba.slice(0)` のコピーを渡す。同一拡張子の重複出力は `producedExts` で抑止（降格保険）。1フォーマット失敗は通知してスキップ・全体継続。
5. **品質スライダー・長辺px入力UIを削除**: detail展開UI（`.c-ic-card__detail`／`.c-ic-detail__*`／`.c-ic-range`／`.c-ic-field--num`）と関連JSを全撤去。品質・長辺は `presets.js` の内部固定値（quality/maxEdge/avifQuality）を種別選択で自動適用（UI非表示）。
6. **自動縮小の告知**: 一括パネルに「大きすぎる画像は…自動で縮小します」を1度だけ表示（`.c-ic-bulk__hint--plain`）。

### ファイル名・DL
- 個別DL: 1出力=直DL、複数出力=その画像だけZIP（`{basename}.zip`・ボタンラベルが「DL」→「ZIP」に変化）。
- 一括ZIP: 全画像×全フォーマットを同梱。元名維持＋各拡張子追従、`makeUniqueName` で同名衝突回避（拡張子違いは衝突扱いしない／D10）。

### 行別フォーマット上書き（spec §3-b）→ 第3次修正で本実装（2026-06-18）
当初 Stage1 では未実装だったが、黒田さん実機FB（第3次・FB-4）で本実装。各カードに「出力形式」トグル＋フォーマットチェックボックス群（`data-ic-card-format`／`formatGroupHtml` 共用）を追加。`setItemFormat()` がカード単位で `item.formats` を更新（`FORMAT_ORDER` で正規化）。一括との二段構え＝一括変更は `applyBulkToItem` で全カードへ反映、その後カード個別で上書き可。種別個別変更時は `setItemPreset` が `initialCheckedFormats()` でそのカードの推奨フォーマットへ既定追従（`syncItemFormatChecks` でDOM同期・fieldset は閉じない）。`runCompression`／`updateActionState` の実行可否判定を「一括 or いずれかのカードに formats あり」へ更新。カード見出しに「種別: X ／ 形式: WebP・JPEG」を `formatsLabel()` で表示。

## 5-B. 第3次修正（黒田さん実機FB 4点 / 2026-06-18）
1. **dropzone のポインター除去（FB-1）**: 原因は `_reset.scss` の `[role="button"] { cursor: pointer }`。dropzone が `role="button"` のため空白部にもポインターが出ていた。reset は配布テンプレ基盤なので触らず、`.c-ic-dropzone { cursor: default }` で上書き（component スコープ内）。内部の「ファイルを選択」ボタン（`c-ic-dropzone__pick`＝`c-ic-btn`）は `cursor: pointer` のまま維持。
2. **②昇格導線をカード単位判定（FB-2）**: `PROMOTE_TARGET_PRESETS = ["photo"]`（③＝②以外の写真系）で `shouldShowPromote()` を判定。個別種別変更時に `updatePromoteHint()` がカード単位で出し入れ（②選択カードには出さない）。`promoteHintHtml()` を初期描画と差し替えで共用。
3. **「種別を選択」三角アイコン（FB-3）**: `icons.js` に `chevron`（右向き ▶ `M9 6l6 6-6 6`）追加。`aria-expanded="true"` のとき CSS `transform: rotate(90deg)` で ▼ に（`transition` 付き）。`aria-expanded` は既存トグルで切替済み。「出力形式」トグルも同シェブロン共用。
4. **カード個別フォーマット（FB-4）**: 上記「行別フォーマット上書き」参照。

検証: `yarn format`／`_lint`／`_prettier`／`build` すべて exit 0。built バンドルに新識別子・chevron path・`cursor:default`・`rotate(90deg)` の存在を確認。

### runtime e2e（preview＋ヘッドレスChrome CDP・一時スクリプトで実施後削除）
2枚PNG投入→種別ラジオ6＋説明文6・フォーマットボックス4（WebP/JPEG有効・AVIF/PNG disabled）→JPEG追加チェック（WebP+JPEG）→card2を⑤iconに個別変更（SVG助言バナー表示）→圧縮実行→**各カード2出力**・After並置2・削減率4・DLラベル「ZIP」→一括ZIP `compressed-images.zip` に`photoA.webp/photoA.jpg/iconB.webp/iconB.jpg`同梱。**console error 0**。quality/maxedge/select=0（削除確認）。

### Stage差し替えポイント（後続）
- AVIF稼働(Stage2): `FORMAT_DEFS[avif].enabled=true` ＋ `encodeOneFormat` の AVIF 分岐を実エンコードに。降格保険コードはそのまま安全弁。
- PNG稼働(Stage3): `FORMAT_DEFS[png-lossless].enabled=true` ＋ oxipng/imagequant 経路。⑤⑥のWebP可逆暫定をPNG可逆に差し替え。④のWebP+PNG減色の二出力が `recommendedFormats` で既に成立。

## 5-C. Stage1再設計 評価ゲート（Reid）指摘反映（2026-06-18 / 別コンテキスト Cody）

Reid `_f3-stage1-redesign-reid-review.md`（条件付き合格）の Must/Should/Nice を反映。

- **M-1（論理プロパティ）**: `_c-ic-btn.scss` の `min-height` → `min-block-size`（兄弟 `_c-btn.scss` と同形）。他 `_c-ic*` に物理 box-model 残存なし（grep 0 / sr-only は許容例外）。
- **M-2（rm() 必須）**: `_c-ic-card.scss` thumb `64px → rm(64)`／`flex:1 1 12rem → rm(192)`、`_c-ic.scss` progress `8px → rm(8)`／check-box `1.25rem → rm(20)`／typegrid minmax `15rem/13rem → rm(240)/rm(208)`（兄弟 `_p-tools.scss` の `minmax(rm(280),1fr)` と同形）。sr-only 1px は例外で据置。
- **M-3（keep-JPEG の固まり対策）**: 採用＝**(a) Worker 化**。keep-JPEG のデコード〜エンコード（`createImageBitmap`＋`OffscreenCanvas`＋`convertToBlob('image/jpeg')`）を `encode.worker.js` に移設し、WebP と同じ逐次パイプラインに統一。`worker-client.js` に `encodeJpegInWorker({file,maxEdge})` 追加（File は structured clone でデータコピーなし）。`image-ops.js` の `encodeKeepJpeg` は撤去（デッドコード化回避）。**WASM/WebP 経路・Worker 内 WASM パス解決は不変**（JPEG は WASM 非使用の OffscreenCanvas）。理由: yield 挿入（案b）では単一大判画像のエンコード自体のブロックは消えないが、Worker 化はエンコードを完全にメイン外へ出すため確実。
- **S-4（差分トークン）**: フィールド面の枠を `--field-border`（typecard/fmtcard ともに既存と同値）に、角丸を fmtcard で `--field-radius`（=radius-sm・同値）に寄せた。typecard 角丸は「面」強調のため `--radius-md` 維持（design-concept §2-2 の意図優先・視覚変化なし）。
- **N-1/N-2（コメント残骸）**: main.js ヘッダ/行別フォーマット/promote 言及、presets.js manualOnly、`_c-ic-card.scss` ヘッダのコメントを実態（after廃止・行別本実装・ラジオ化）に更新。

### Stage 送り TODO（本Stageでは対応しない）
- **S-2（降格通知の debounce / Stage2）**: AVIF/PNG 選択時の「WebP降格通知」が `showNotice` 上書き連打で点滅しうる。現状 AVIF/PNG は `disabled` で顕在化しないため未対応。**Stage2 で AVIF を enabled 化する際に、降格通知を「1回だけ集約表示（メッセージ dedupe）」へ変更する**。
- **keep の真の元形式維持 / Stage3**: 現 keep は入力形式によらず JPEG 穏やか最適化（D7）。真の元形式維持（PNG入力→oxipng で PNG のまま・WebP入力→WebP のまま）は **Stage3 の oxipng/imagequant 導入時**に実装。それまで UI ラベルは実挙動（JPEG最適化）に合わせる。
- **S-5（keepラベル「JPEG」）**: 黒田さん承認済みのため変更しない。

## 6. ★要確認
- **実機調整値**（presets.js の quality / maxEdge / LIMITS）は初期値。黒田さんの実案件書き出しサイズで F4 までに調整。
- **keep（元形式維持）の透過扱い**: D7 は JPEG 穏やか最適化が主眼のため、keep 選択時は **白背景で平坦化して JPEG 出力**にした（透過PNGをkeepで出す稀ケースの保険）。透過を保持したい場合は WebP 経路を使う想定。要確認なら Stage で調整。
