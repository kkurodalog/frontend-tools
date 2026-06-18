# F3 Stage2（AVIF出力）評価ゲート レポート（Reid / クリーンコンテキスト）

> 評価者: Reid（制作部 / コードレビュー・規範照合・品質判定）
> 評価日: 2026-06-18 / 立場: 生成に一切関与していないクリーンな評価者（evaluation-gate.md 準拠）
> 対象: Stage2 で AVIF のために追加/変更された部分 ＋ Stage1 への regression 有無
> 拠り所: `01_spec.md`（§1/§3/§4）/ `_f2-mane-review.md`（Must M-1 / Should S-3）/ `guidelines/coding-rule.md`

---

## 判定

**合格**（Must なし / Should 1件・Nice 2件＝いずれも品質改善であり Stage2 のブロッカーではない）

Stage2 の中核（Worker 内 AVIF WASM パス解決・単一スレッド版直接 instantiate・遅延 import・逐次/堅牢性・S-3 降格・S-2 集約・仕様整合・regression 非破壊）は、**コードと node_modules の実構造・build 出力の3点で実証的に確認**でき、いずれも正しく堅牢に実装されている。Cody の最重要技術判断（MT 経路を構造的に回避するための単一スレッド版直接 instantiate）は、主張を鵜呑みにせず node_modules / dist の実物で裏取りした結果、**妥当かつ将来保守上も合理的**と判定する。

---

## 1. 最重要＝Worker 内 AVIF WASM パス解決（Must M-1 相当）— 合格

### 実証確認（主張の鵜呑みでなく実物で裏取り）

| 確認項目 | 方法 | 結果 |
|---|---|---|
| MT 版ファイルの存在 | `node_modules/@jsquash/avif/codec/enc/` 実査 | `avif_enc_mt.{js,wasm,worker.mjs}` 実在＝Cody の前提は事実 |
| 公開 encode.js の MT 経路 | `encode.js` L29-38 読解 | `await threads()` true で `import('./codec/enc/avif_enc_mt.js')` を引く＝Cody の指摘どおり |
| 単一スレッド版が instantiateWasm を尊重 | `avif_enc.js` を grep | `Module["instantiateWasm"]` を3箇所で参照・`createWasm` が `try{return Module["instantiateWasm"](...)}` で分岐＝注入が効く |
| 単一スレッド版に MT/SAB が無い | `avif_enc.js` を grep | `SharedArrayBuffer` 0件 / `pthread` 0件＝MT 要素なし。SIMD 分岐も無く `.wasm` は `avif_enc.wasm` 1本のみ＝WebP のような simd/非simd 2系統 fetch は不要（Cody の判断は正しい） |
| 呼び出し規約の一致 | `encode.js` L69 と `wasm-avif.js` L87 を突合 | 公開 `encode.js` は `module.encode(new Uint8Array(data.data.buffer), w, h, _options)`。`wasm-avif.js` は同一シグネチャで呼ぶ＝規約準拠 |
| defaultOptions の一致 | `meta.js` L4-18 と `wasm-avif.js` L34-48 を突合 | 完全一致（quality:50/speed:6/subsample:1/bitDepth:8/lossless:false 等）＝複製は正確 |
| build に MT が出ない | `dist/assets/` 全 JS を grep | `avif_enc_mt` 文字列 0件・MT wasm/worker ファイル 0件＝MT を一切バンドルしない＝ビルド OOM 回避が成立 |
| base /tools/ パス解決 | `dist/assets/wasm-avif-*.js` を grep | wasm 参照＝`/tools/assets/avif_enc-Co4TcJko.wasm`（base 付与済み・絶対）。`?url` import が Vite で正しく解決 |
| Worker 内 fetch が import.meta.url に依存しない | `wasm-avif.js` L30/L55 ＋ `instantiateWasm` L65 | `?url` 文字列を fetch→compile→`instantiateWasm` で注入＝emscripten の locateFile（Worker 相対）を完全バイパス＝WebP（`wasm-webp.js`）と同作法で整合 |

### 結論

WebP（`wasm-webp.js`）の `?url`→fetch→compile→init 方式と**構造的に整合**しており、`base:"/tools/"` 配下で dev/build 双方の解決が成立する。**MT 経路には構造的に入らない**（公開 `encode.js`/`meta.js` を一切 import せず、単一スレッド版ファクトリ `avif_enc.js` を直接 import するため、`threads()` 判定そのものがコードパスに存在しない）。SIMD 分岐不要も実物で確認。**Must M-1（AVIF）クリア**。

---

## 2. 遅延 import（§3-a）— 合格

- `encode.worker.js` L31-36 `loadAvifEncoder()` が `import("./wasm-avif.js")` を**初回 AVIF ジョブ受信時のみ**実行（promise キャッシュで1度だけ）。
- `dist` 静的確認: `encode.worker-*.js` 内の wasm-avif 参照は**動的 `import("./wasm-avif-*.js")` のみ**（静的 import 0件）。Vite が別チャンク分割。
- → WebP しか使わないユーザーに 3.5MB の AVIF WASM を DL させない構造。仕様どおり。

---

## 3. 逐次・堅牢性（§3-b）— 合格

- AVIF は Stage1 と同じ Worker（`worker-client.js` 共有・pending id-map）・逐次（`main.js` `runCompression` の `for await` 直列）に乗る。
- **複数出力の RGBA 共有が安全**: `encodeItemFormats` で `ensureRgba()` が共有 RGBA を1度だけ生成し、各フォーマットへ `rgba.slice(0)`（コピー）を渡す（WebP=L606 / AVIF=L574）。transfer で detach される元バッファを使い回さない＝**取りこぼし/二重 transfer なし**。
- Transferable: `worker-client.js` の各 postMessage が `[rgba]` を transfer。結果も `[resultBuffer]` で返却（`encode.worker.js` L98）。
- 1枚/1フォーマット失敗継続: `encodeItemFormats` の per-format try/catch（L541-551）＋ `runCompression` の per-item try/catch（L500-507）の二重で全体を止めない。
- メモリ: before サムネ Object URL は `renderItem` で旧 URL を `revokeObjectURL`（L361）。DL blob URL も `setTimeout` revoke（L713）。リークなし。

---

## 4. S-3 AVIF 降格 / S-2 集約 — 合格（Should 1件あり）

- **降格判定**: 初回 AVIF エンコード例外で `avifUnavailable=true`（`main.js` L579）。以降の画像は `if (!avifUnavailable)` で AVIF を試さず直接 WebP 降格（L571）＝**再試行・無限ループなし**。確認済み（コードトレース）。
- **重複抑止**: `producedExts` Set（L540/544）で、AVIF→WebP 降格と WebP 明示選択が重なっても `.webp` を1件に dedup。
- **S-2 集約**: `avifDowngradeCount` を加算するのみ（L583）。`runCompression` 完了時に `flushAvifDowngradeNotice()` で1回だけ通知（L513/518-523）。実行ごとに `avifDowngradeCount=0` リセット（L483）。`avifUnavailable` はセッション持続（2回目以降も降格固定）＝連打/点滅を防止。仕様どおり。

→ Should S-1（下記）の通知文言の精度のみ改善余地。降格ロジック自体は正しい。

---

## 5. 仕様整合（§1 品質値 / §3-c 有効化 / D4 注記）— 合格

- AVIF 品質定数（`presets.js`）: ①45 / ②63 / ③52 / ④60 / ⑤⑥70 ＝ spec §1「AVIF出力時」列と一致。`avifQuality` を Worker へ渡し `{ quality }` で受ける（`encode.worker.js` L86 / `wasm-avif.js` L83-86）。
- §3-c 有効化: `FORMAT_DEFS[avif].enabled=true`（`presets.js` L30・stage:2 のまま）。`formatGroupHtml` の disabled/「準備中」分岐が enabled で解除（`main.js` L147-150）。PNG は `enabled:false` を維持＝Stage3 準備中バッジ継続（仕様どおり）。
- 推奨フォーマット追従: ①②③等は WebP 推奨のまま（AVIF は任意 ON）。`recommendedFormats` 不変。spec §1「既定は WebP 優先」と整合。
- D4「重い」注記: `runCompression` 冒頭で「一括 or いずれかのカードで AVIF 選択」を検出し `showNotice("AVIF は…時間がかかります…", "info")`（L489-492）。`avifUnavailable` 時は出さない（無意味な注記回避）＝妥当。

---

## 6. 規範準拠（coding-rule）— 合格

- 論理プロパティ: `_c-ic*.scss` に物理 box-model（margin-top/padding-left 等）0件（grep 確認）。block/inline で統一。
- rm(): 新規寸法はトークン or rm()。生 px は 1px（border/sr-only）と 0% のみ＝例外カテゴリ内（§6）。
- `.js-` セレクタ: SCSS に 0件（§2-2 維持）。フックは `data-ic-*` 属性で実装＝CSS 装飾と責務分離。
- インライン style: 進捗バー幅（`style.inlineSize`・動的値）のみ＝不可避の例外。静的スタイルは全て SCSS。
- A11y（AVIF 関連の新規面）: フォーマットチェックボックスは `formatGroupHtml` が `<input type=checkbox id> + <label for>` 紐付け・visually-hidden チェックボックス＋`:focus-visible + label` フォーカスリング・アイコン `aria-hidden`。disabled 解除後（AVIF）も同じ生成経路＝ラベル紐付け維持。通知は `aria-live`（Stage1 既設）。

---

## 7. regression（Stage1 非破壊・重点）— 合格

- WebP 経路（`encode.worker.js` L88-94）: `ensureWebpReady` ＋ simd/非simd 分岐（`wasm-webp.js`）不変。lossless/非可逆の options 切替も不変。
- keep-JPEG の Worker 化（M-3）: `encode.worker.js` の jpeg 分岐（L74-77 / `encodeJpeg`）不変。`image-ops.js` から JPEG 撤去済みのまま。
- 複数出力・カード個別フォーマット: `encodeItemFormats`/`setItemFormat`/`applyBulkToItem` のオーケストレーションは Stage1 構造を踏襲し、AVIF 分岐を `encodeOneFormat` に追加したのみ（L570-585）。WebP 共通化（`encodeWebpFallback`）への切り出しは挙動同値。
- WASM パス解決（WebP）: `wasm-webp.js` 不変。build に `webp_enc{,_simd}.wasm` 両系統が出力されている（dist 確認）。

→ Stage1 の WebP/keep-JPEG/複数出力/個別フォーマット/Worker 内 WASM 解決すべて非破壊。

---

## 指摘一覧

### Must
なし。

### Should

- **S-1: AVIF→WebP 降格通知の文言精度（既に WebP も選択済みのケース）**
  - ファイル: `main.js` `encodeOneFormat`（L582-584）＋ `flushAvifDowngradeNotice`（L518-523）
  - 事象: `item.formats=[webp, avif]` で AVIF 不可の場合、WebP は明示選択分が既に出力されており、AVIF 降格分は `producedExts` で dedup されて**結果は増えない**（＝ユーザーは元々欲しかった WebP を得る・実害なし）。しかし `avifDowngradeCount` は加算されるため、完了通知が「N 枚を WebP で出力しました」と出る。ユーザー視点では「もともと WebP も選んでいた」ため、やや過剰・誤解を生みうる文言。
  - 修正方針（軽微）: 降格カウントを「その画像が WebP を**まだ持っていない**ときだけ」加算する（例: `encodeOneFormat` で当該 item の `producedExts`/結果に webp が無い場合のみ `avifDowngradeCount += 1`）。あるいは通知文言を「AVIF が使えないため WebP で代替しました（対象 N 枚）」等、出力増減に依存しない表現へ。**Stage2 のブロッカーではない**（降格ロジック・出力結果は正しい）。F4 実機で Safari 降格を実際に踏むため、その際に文言を最終確認する形でも可。

### Nice

- **N-1: 2値 padding shorthand（Stage1 由来・参考）**
  - ファイル: `_c-ic.scss` L273・L300 / `_c-ic-card.scss` L98（`padding: var(--space-2) var(--space-3)` 等）
  - coding-rule §0-4(3) は2値 shorthand を `padding-block`/`padding-inline` への分解必須としている。ただしこれは**Stage1 で実装済み・Stage1 評価で承認された既存行**であり Stage2 変更点ではない。Stage2 判定には影響しない。Stage3 以降のリファクタ機会に合わせて分解を検討（参考）。

- **N-2: AVIF lossless 経路の将来余地（参考）**
  - `wasm-avif.js` は非可逆固定（`lossless:false`）。現状 spec §1 で AVIF は①②③等の非可逆用途のみ＝正しい。将来 AVIF 可逆を使う種別が出た場合は `encode.js` の lossless ガード（quality=100 強制等・`encode.js` L52-67）を `wasm-avif.js` に複製する必要がある。現時点は不要（参考メモ）。

---

## 自己検証

1. **AVIF WASM パス解決・単一スレッド版直接 instantiate の妥当性をコードと node_modules 構造で確認したか** → 済。`avif_enc.js` の `instantiateWasm` 尊重・SAB/pthread 0件・SIMD 分岐不在、`encode.js` の MT 経路、`meta.js` の defaultOptions、dist に MT 非出力・wasm URL の base 付与をすべて実物で裏取り（主張の鵜呑みでない）。
2. **複数出力の取りこぼし/リーク・降格ループの有無をコードで追ったか** → 済。`ensureRgba`+`slice(0)` の二重 transfer 回避、`producedExts` dedup、`avifUnavailable` フラグによる再試行回避（無限ループなし）、Object URL/blob URL の revoke を行ごとに確認。
3. **Stage1 への regression を具体的コード箇所で確認したか** → 済。WebP/keep-JPEG/Worker 内 WASM 解決/複数出力/個別フォーマットの該当行が Stage2 で非破壊であることを確認。dist に WebP 両系統 wasm 出力も確認。
4. **指摘は再現可能な粒度か** → 済（S-1 は再現条件 `formats=[webp,avif]`＋AVIF不可 を明記・修正箇所を行番号付きで提示）。

- 検証済み: Worker内AVIF WASMパス解決（単一スレッド版直接instantiate・MT構造的回避・base/tools/解決）
- 検証済み: 遅延import（dynamic import分割・ロード時非取得）
- 検証済み: 逐次/堅牢性/複数出力（RGBA共有slice・Transferable・失敗継続・リークなし）
- 検証済み: S-3降格/S-2集約（再試行なし・1回集約通知）
- 検証済み: 仕様整合（AVIF品質①45/②63/③52/④60/⑤⑥70・有効化・D4注記）
- 検証済み: 規範準拠（論理プロパティ・rm()・.js-=0・A11y）
- 検証済み: Stage1 regression 非破壊
- 未達: なし（Should S-1 / Nice N-1・N-2 は品質改善・Stage2 ブロッカーではない）
