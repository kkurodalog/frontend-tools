# F3 Stage3（PNG可逆 oxipng ＋ ④減色）評価ゲート レポート（Reid / クリーンコンテキスト）

> 評価者: Reid（制作部 / コードレビュー・規範照合・品質判定）
> 評価日: 2026-06-18 / 立場: 生成に一切関与していないクリーンな評価者（evaluation-gate.md 準拠）
> 対象: Stage3 で PNG可逆(oxipng)・④減色のために追加/変更された部分 ＋ Stage1/2 への regression 有無
> 拠り所: `01_spec.md`（§1/§3/§5-1）/ `_f3-stage2-reid-review.md`（S-1 / N-1）/ `guidelines/coding-rule.md`

---

## 判定

**合格**（Must なし / Should 1件・Nice 2件＝いずれも品質改善であり Stage3 のブロッカーではない）

Stage3 の中核（① Worker 内 oxipng WASM パス解決＝単一スレッド版直接 import で MT 罠を構造的に回避 ／ ② ④減色メディアンカット→`optimise_raw` の呼び出し規約 ／ ③ 遅延 import ／ ④ 逐次・複数出力堅牢性 ／ ⑤ ⑤⑥ WebP暫定→PNG可逆への差し替え ／ ⑥ S-1/N-1 反映 ／ ⑦ 規範準拠 ／ ⑧ Stage1/2 regression 非破壊）は、**コードと node_modules の実構造・build 出力の3点で実証的に確認**でき、いずれも正しく堅牢に実装されている。

最重要技術判断2点について、主張を鵜呑みにせず実物で裏取りした:

1. **単一スレッド版直接 import**: 公開 `optimise.js`（L36 `isWorker && hasHardwareConcurrency && await threads()` → `initMT`＝pkg-parallel＋`initThreadPool`）が AVIF と同型の MT 罠を持つことを実コードで確認。Cody は `codec/pkg/squoosh_oxipng.js` を直接 import し、`init(WebAssembly.Module)` にコンパイル済み Module を注入する方式で MT 経路に**構造的に入らない**。dist は単一スレッド版 wasm 164,172B（＝node_modules `pkg/` と同一・parallel 236KB は不在）のみ・`pkg-parallel`/`rayon`/`initThreadPool` 文字列 0 件。**妥当かつ堅牢**。
2. **imagequant 不採用＋純JSメディアンカット代替**: `@jsquash/imagequant` が npm に存在しないこと（node_modules `@jsquash/` 配下は avif/oxipng/webp のみ）、standalone imagequant 未インストールを確認。代替の純JSメディアンカット→`optimise_raw` 統一は、**フロント図版用途（spec §2-8 positioning）・段階実装・F4 実画像調整前提**に照らし、依存最小化・Worker 安全・決定論性のメリットが知覚品質の譲歩を上回る**許容範囲内**と判定する（差し戻し級ではない・Should/F4 送りで足りる）。

---

## 1. 最重要＝Worker 内 oxipng WASM パス解決（Must M-1 相当）— 合格

### 実証確認（主張の鵜呑みでなく実物で裏取り）

| 確認項目 | 方法 | 結果 |
|---|---|---|
| 公開 optimise.js の MT 経路 | `node_modules/@jsquash/oxipng/optimise.js` L15-44 読解 | `init()` は `isWorker && hasHardwareConcurrency && await threads()` で `initMT`＝`codec/pkg-parallel/squoosh_oxipng.js` を import し `initThreadPool(hardwareConcurrency)` を呼ぶ＝Cody の指摘どおりの MT 罠。本ツールのエンコードは Worker 内＝判定 true 側に倒れる |
| 単一スレッド版が Module 注入を尊重 | `pkg/squoosh_oxipng.js` `__wbg_init`(L162) ＋ `__wbg_load`(L91-119) 読解 | `init(WebAssembly.Module)` は fetch せず L110-118 `WebAssembly.instantiate(module, imports)` で Module を直接 instantiate＝コンパイル済み Module 注入が効く（Worker の `import.meta.url`/`new URL('...bg.wasm', import.meta.url)` 解決を完全バイパス） |
| 単一スレッド版に MT/SAB が無い | `pkg/squoosh_oxipng.js` grep | `SharedArrayBuffer`/`initThreadPool`/`rayon` 0 件。SIMD 分岐なし＝`.wasm` 1 本（WebP のような simd/非simd 2系統 fetch 不要・Cody の判断は正しい） |
| 呼び出し規約の一致 | `pkg/squoosh_oxipng.js` L75 と `wasm-oxipng.js` L63/L75 を突合 | `optimise_raw(data, width, height, level, interlace, optimize_alpha)`＝`wasm-oxipng.js` の `optimise_raw(rgba, w, h, OXIPNG_LEVEL, false, false)` と完全一致 |
| build に MT が出ない | `dist/` 全 grep | `pkg-parallel`/`rayon`/`initThreadPool` 文字列・MT wasm/snippets 0 件＝MT を一切バンドルしない（ビルド OOM 回避が成立） |
| base /tools/ パス解決 | `dist/assets/` 実査 | oxipng wasm 参照＝`/tools/assets/squoosh_oxipng_bg-OFMN1KwG.wasm`（base 付与済み・絶対）。`?url` import が Vite で正しく解決 |
| wasm サイズ＝単一スレッド版 | `dist/assets/squoosh_oxipng_bg-OFMN1KwG.wasm` | 164,172B＝`pkg/`（単一スレッド）と完全一致。parallel 236,042B は dist に不在 |

### 結論

`wasm-webp.js`/`wasm-avif.js` の `?url`→fetch→`WebAssembly.compile`→`init(module)` 注入方式と**構造的に整合**し、`base:"/tools/"` 配下で dev/build 双方の解決が成立する。**MT 経路には構造的に入らない**（公開 `optimise.js`/`init()` を一切 import せず単一スレッド版ファクトリを直接 import するため、`threads()` 判定そのものがコードパスに存在しない）。**Must M-1（PNG/oxipng）クリア**。

---

## 2. ④減色（メディアンカット→oxipng optimise_raw）— 合格（Should 1件あり）

`wasm-oxipng.js` `medianCutQuantise`(L87-149) をトレース:

- **アルファ保持（透過維持）**: `out = new Uint8ClampedArray(rgba)`（コピー）で開始し、バケット代表色は RGB のみ上書き（L142-144）・アルファは元値のまま＝**透過維持は正しい**。完全透過画素（a===0）はバケット分割対象から除外（L95）＝色を持たない画素を量子化に巻き込まない妥当な処理。
- **色数上限**: `max = clamp(maxColors, 2, 256)`（L88）。`buckets.length < max` までメディアンカット分割（L102）。最大レンジ軸選択→ソート→中央分割（L106-123）＝標準的なメディアンカット。バケット代表色＝平均色（L128-147）。
- **RGBA 処理**: `imageData.data instanceof Uint8ClampedArray` 判定で Uint8ClampedArray 化（L73）＝Worker 受領 ArrayBuffer を正しく扱う。
- **oxipng 連携**: 減色後 RGBA を `optimise_raw(reduced, w, h, 2, false, false)`（L75）でパレット PNG 化。oxipng がパレット化と可逆最適化を担う＝設計どおり。
- **計算場所（固まりリスク）**: `prepareRgba`（getImageData）は**メインスレッド**（`image-ops.js` / `main.js` `ensureRgba`）だが、`medianCutQuantise` は **Worker 内**（`wasm-oxipng.js`）で走る＝重い量子化はメインを固めない。逐次＋Worker 構造に正しく乗っている。

→ ロジックは正しい。Should S-1（下記）の知覚品質のみ F4 調整余地。

---

## 3. 遅延 import（§3-a）— 合格

- `encode.worker.js` `loadOxipngEncoder()`(L47-56) が `import("./wasm-oxipng.js")` を**初回 PNG ジョブ受信時のみ**実行（promise キャッシュで1度だけ）。
- dist 静的確認: `encode.worker-*.js` 内の oxipng 参照は**動的 `import("./wasm-oxipng-BaE6nkNb.js")` のみ**（静的 import 0 件）。Vite が別チャンク分割。
- → WebP/AVIF しか使わないユーザーに oxipng WASM（164KB）を DL させない構造。仕様どおり。

---

## 4. 逐次・堅牢性（§3-b）・複数出力— 合格

- PNG は Stage1/2 と同じ Worker（`worker-client.js` 共有・pending id-map）・逐次（`main.js` `runCompression` の `for` 直列）に乗る。
- **複数出力の RGBA 共有が安全**: `encodeItemFormats` の `ensureRgba()` が共有 RGBA を1度だけ生成し、各フォーマットへ `rgba.slice(0)`（コピー）を渡す（WebP=L625 / AVIF=L578 / PNG=L601）。transfer で detach される元バッファを使い回さない＝**取りこぼし/二重 transfer なし**。WebP＋AVIF＋PNG＋JPEG の4出力同時でも各々 slice コピーで独立。
- Transferable: `encodePngInWorker` が `[rgba]` を transfer（`worker-client.js` L67）。結果も `[resultBuffer]` で返却（`encode.worker.js` L126）。
- 1フォーマット/1枚失敗継続: `encodeItemFormats` の per-format try/catch（L543-554）＋ `runCompression` の per-item try/catch（L501-508）の二重。`results.length===0` で初めて throw（L557）。
- メモリ: PNG 経路も WebP/AVIF と同じく Worker へ transfer 後の明示解放不要（detach 済み）。DL blob URL の revoke は Stage1 既設のまま。リークなし。

---

## 5. 仕様整合（⑤⑥暫定解消 / ④減色 / oxipng レベル / 有効化 / D10）— 合格

- **⑤⑥ WebP暫定→PNG可逆 差し替え**: `presets.js` ⑤⑥ `recommendedFormats:[FORMAT.PNG_LOSSLESS]`（L112/L125）。`FORMAT_DEFS[png-lossless].enabled=true`（L35）＝`initialCheckedFormats`(L143-148) が PNG を直接初期チェック（Stage1 の WebP 可逆フォールバックは発火しない）。Stage1 TODO 解消。
- **④減色**: ④ `recommendedFormats:[WEBP, PNG_LOSSLESS]`＋`pngReduce:true`（L99/L105）。`main.js` `encodeOneFormat` PNG分岐(L599-604) で `reduceColors = preset.pngReduce ? ILLUST_PNG_COLORS : 0`(L602)＝④のみ256色減色・⑤⑥は0（可逆）。`ILLUST_PNG_COLORS=256`(L15) は §1 と一致・§5-1 自動推測の色数判定とは別物とコメントで明記。
- **oxipng レベル**: `OXIPNG_LEVEL=2`（`wasm-oxipng.js` L35）＝spec §1「既定2」と一致。
- **PNG チェックボックス有効化（§3-c）**: `formatGroupHtml`(L143-161) は `FORMAT_DEFS[key].enabled` 駆動。PNG `enabled:true` で disabled/「準備中」分岐が解除＝チェック可能に。HTML の残存 disabled は Stage4 の自動推測トグルのみ（正しく準備中継続）。
- **推奨追従・拡張子追従/衝突回避（D10）**: PNG result は `ext:"png"`(L604)。`producedExts` で dedup・元名維持＋拡張子追従は Stage1 構造を踏襲。④の WebP+PNG 二出力は `.webp`/`.png` で衝突しない。

---

## 6. S-1 / N-1 の反映確認 — 合格

- **S-1（AVIF降格カウント過剰の是正）**: `encodeOneFormat`(L587-592) で降格 WebP に `downgradedFromAvif` を付けるのは `!formats.includes(FORMAT.WEBP)` のときだけ。`encodeItemFormats`(L545-551) で `producedExts` dedup を通過した新規 ext のときのみ `avifDowngradeCount += 1`。`formats=[webp,avif]`＋AVIF不可でも過剰カウントしない＝S-1 指摘どおり是正。降格ロジック・無限ループ回避（`avifUnavailable` フラグ）は Stage2 のまま非破壊。
- **N-1（2値 padding shorthand→論理プロパティ分解）**: `_c-ic*.scss` の2値 shorthand grep 0 件・物理 box-model（margin-top/padding-left 等）0 件＝coding-rule §0-4(3) 準拠。論理プロパティで統一。見た目不変（block/inline 値割当保持）。

---

## 7. 規範準拠（coding-rule）— 合格

- 論理プロパティ: `_c-ic*.scss` に物理 box-model 0 件（grep 確認）。block/inline で統一。
- rm(): 新規 SCSS に生 px（1px/0 以外）0 件（grep 確認）。
- 新規 JS（`wasm-oxipng.js`）は SCSS/HTML 非関与（A11y・`.js-` 対象外）。PNG チェックボックスは `formatGroupHtml` の `<input type=checkbox id> + <label for>` 紐付け・`u-visually-hidden` チェックボックス＋ラベル経路を AVIF と共有＝enabled 解除後も紐付け維持。インライン style 増加なし。

---

## 8. regression（Stage1/2 非破壊・重点）— 合格

- WebP 経路（`encode.worker.js` else 分岐 L116-122 / `wasm-webp.js`）不変。simd/非simd 分岐・lossless 切替不変。dist に `webp_enc{,_simd}.wasm` 両系統出力を確認。
- keep-JPEG（`encode.worker.js` L94-97 / `encodeJpeg`）不変。
- AVIF 経路（`encode.worker.js` L98-106 / `wasm-avif.js`・単一スレッド版直接 instantiate）不変。dist に `avif_enc.wasm` 出力・MT 不在を確認。
- 複数出力・カード個別フォーマット: `encodeItemFormats`/`encodeOneFormat` は Stage2 構造を踏襲し PNG 分岐(L599-604)を追加したのみ。WebP 共通化（`encodeWebpFallback`）も挙動同値。
- WASM パス解決（WebP/AVIF）: 該当ファイル不変。

→ Stage1/2 の全経路（WebP/keep-JPEG/AVIF・WASMパス解決・複数出力・カード個別フォーマット・降格）非破壊。

---

## 指摘一覧

### Must
なし。

### Should

- **S-1: ④メディアンカットの知覚品質（imagequant 比）— F4 実画像調整で詰める**
  - ファイル: `wasm-oxipng.js` `medianCutQuantise`(L87-149)
  - 事象: メディアンカットは(a) 代表色＝バケット**平均**色（中央値でなく平均のため境界が僅かに鈍る）、(b) **誤差拡散（ディザ）なし**でグラデ部にバンディングが出やすい、(c) 半透明画素は RGB を量子化するが**アルファ自体は量子化しない**ため「≤256色」はRGB基準で、半透明×多階調アルファのイラストでは出力 RGBA タプル数が256を超えうる（oxipng が下流でパレット化するため最終ファイルは破綻しないが、狙った256色パレットにならないケースがある）。imagequant（perceptual + ディザ）には知覚品質で劣る。
  - 判断: **差し戻し級ではない**。フロント図版用途（spec §2-8）・段階実装・F4 実画像調整前提（spec §5-1「④PNG経路限定・深追いしない」）に照らし、依存ゼロ・Worker 安全・決定論性のメリットが上回る。imagequant 相当を要求して差し戻すのは過剰。
  - 対応方針（F4 送り）: 黒田さんの実イラスト/図版で減色結果を目視し、(1) 平坦塗りで十分なら現状維持、(2) グラデ有り図版でバンディングが気になるなら ④推奨を WebP 単独へ寄せる or 色数を上げる/下げる調整、で詰める。実装変更が要るのは F4 で品質不足が確認された場合のみ。

### Nice

- **N-1: メディアンカットの計算量（大判イラストの体感速度）— F4 実測**
  - ファイル: `wasm-oxipng.js` `medianCutQuantise`(L102-124)
  - 事象: バケット分割のたびに対象バケットを全ソート（L119）するため概算 O(buckets × n log n)。256色まで分割する大判イラスト（④ maxEdge 1600px＝最大 ~2.5M 画素）では Worker 内で数百ms〜オーダーになりうる。**Worker 内のため UI は固まらない**（構造は正しい）が、体感の処理時間として F4 で実測したい（Cody も F4 送りで自己申告済み）。
  - 対応方針: 構造変更不要。F4 の「20〜30枚一括」実測に PNG減色を含めて固まり/所要時間を確認。遅すぎる場合のみ、分割対象画素のサブサンプリング（縮小サムネで代表色を決めフル解像度に適用）等を検討。
  - 重み: Nice（現状でブロッカーではない）。

- **N-2: `optimise_raw` が `false` を返したときのメッセージ精度（参考）**
  - ファイル: `wasm-oxipng.js` `optimisePng`(L64) / `quantiseAndOptimisePng`(L76)
  - 事象: `if (!out) throw` は妥当だが、wasm-bindgen の `optimise_raw` は通常 throw か Uint8Array を返す設計で `false` を返す経路は実質レアケース。現状のガードで問題なし（参考メモ）。

---

## 自己検証

1. **oxipng 単一スレッド版直接 import の妥当性・WASM パス解決をコードと node_modules/dist 構造で確認したか** → 済。公開 `optimise.js` の MT 経路（L36 threads 判定→initMT/pkg-parallel/initThreadPool）、`pkg/squoosh_oxipng.js` の `__wbg_init`→`__wbg_load`(L110-118 Module 直接 instantiate)・SAB/rayon 0 件・SIMD 不在、dist の単一スレッド版 wasm 164,172B のみ・MT 文字列 0 件・base /tools/ 付与をすべて実物で裏取り（主張の鵜呑みでない）。
2. **④減色ロジック（メディアンカット・optimise_raw 規約）と固まりリスクをコードで追ったか** → 済。アルファ保持（out コピー・RGB のみ上書き）・完全透過除外・色数上限 clamp・`optimise_raw` シグネチャ一致を確認。`prepareRgba`=メイン / `medianCutQuantise`=Worker の実行場所を特定し固まりリスク（N-1）を F4 送りで明記。
3. **⑤⑥ WebP暫定解消・複数出力リーク・S-1/N-1 反映を確認したか** → 済。⑤⑥ recommendedFormats=PNG_LOSSLESS＋enabled=true で初期チェック直行、`slice(0)` 二重 transfer 回避、S-1（新規 ext のみ降格カウント）・N-1（2値 shorthand/物理プロパティ 0 件）を確認。
4. **Stage1/2 への regression を具体的コード箇所で確認したか** → 済。WebP/keep-JPEG/AVIF/複数出力/カード個別フォーマット/WASM パス解決の該当行が非破壊・dist に webp(両系統)/avif wasm 出力・MT 不在を確認。
5. **指摘は再現可能な粒度か** → 済（S-1 は知覚品質の具体メカニズム3点＋F4 判断基準、N-1 は計算量の式と画素規模を明示）。

- 検証済み: Worker内 oxipng WASMパス解決（単一スレッド版直接import・MT構造的回避・base/tools/解決・dist 164KB単一スレッド版のみ）
- 検証済み: ④減色（メディアンカット・アルファ保持・透過除外・色数上限・optimise_raw規約一致・Worker内実行）
- 検証済み: 遅延import（dynamic import分割・PNG未使用時非取得）
- 検証済み: 逐次/堅牢性/複数出力（RGBA共有slice・Transferable・失敗継続・リークなし・4出力同時安全）
- 検証済み: 仕様整合（⑤⑥WebP暫定解消・④256色・oxipngレベル2・PNG有効化・D10拡張子追従）
- 検証済み: S-1（降格過剰カウント是正）/N-1（論理プロパティ分解）反映
- 検証済み: 規範準拠（論理プロパティ・rm()・A11y・インラインstyle非増加）
- 検証済み: Stage1/2 regression 非破壊
- 未達: なし（Should S-1 / Nice N-1・N-2 は F4 実機調整・品質改善であり Stage3 ブロッカーではない）
