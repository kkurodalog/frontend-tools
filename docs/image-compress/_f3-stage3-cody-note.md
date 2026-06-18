# F3 Stage3 実装ノート（Cody / PNG可逆 oxipng ＋ ④減色）

担当: Cody（制作部）/ 2026-06-18 / 対象: `dev/src/assets/js/image-compress/{wasm-oxipng,encode.worker,worker-client,presets,main}.js` ＋ `_c-ic*.scss`
前提: Stage1（WebP/keep-JPEG）・Stage2（AVIF）完成・Reid 評価ゲート通過済み。本ノートは Stage3（PNG可逆＋④減色・spec §1/§3/§4/§5-1）の差分のみ記録。

## 1. ★依存選定（imagequant を採らず oxipng 1本＋純JS減色）

- **採用**: `@jsquash/oxipng@2.3.0` のみ追加（`@jsquash/png` は一旦 add したが不要と判明し remove）。
- **`@jsquash/imagequant` は存在しない**（npm の @jsquash 配下は webp/avif/oxipng/png/jpeg/resize/jxl/qoi のみ）。`@jsquash/png` は PNG codec（encode/decode）で量子化を持たない。標準系の量子化WASMは無い。
- **standalone `imagequant@0.1.2` は不採用**: (a) wasm-bindgen **bundler ターゲット**（`import * as wasm from "./imagequant_bg.wasm"`）で、本プロジェクトの確立作法（`?url`→fetch→compile→init 注入）に乗らず `vite-plugin-wasm` 等の追加が要る、(b) GPL-v3・単独メンテ・2年更新停止、で Worker WASM パス解決の罠と保守リスクが高い。
- **結論**: ④の減色は **純JS メディアンカット（`wasm-oxipng.js` 内 `medianCutQuantise`）→ 減色済みRGBAを oxipng `optimise_raw` でパレットPNG化** に統一。WASM は **oxipng 1本**で ⑤⑥可逆も ④減色も賄う。依存最小・Worker安全・決定論的・追加ビルド設定ゼロ。spec §3 表は「imagequant 系 or @jsquash/png 量子化」を許容しており、その代替として spec §5-1 注記（④PNG経路限定・深追いしない）の範囲内。

## 2. ★最重要＝Worker内 oxipng WASMパス解決（Must M-1・AVIFと同じ轍を踏まない）

`@jsquash/oxipng` の公開 `optimise.js` `init()` は **AVIFと同型のMT罠**: 「Worker コンテキスト ＆ `hardwareConcurrency>1` ＆ `await threads()`」で `codec/pkg-parallel/squoosh_oxipng.js`（wasm-bindgen-rayon ＋ SharedArrayBuffer ＋ 236KB parallel wasm ＋ snippets）を dynamic import する。本ツールのエンコードは**まさに Worker 内**＝MT 判定が true 側に倒れる条件で、isolation 非対応の本サイトでは実行時に落ち、Rollup も MT グルー＋snippets を辿って膨らむ。

→ **単一スレッド版 `@jsquash/oxipng/codec/pkg/squoosh_oxipng.js` を直接 import**（`wasm-oxipng.js`）。oxipng は wasm-bindgen（web ターゲット）で、`init(WebAssembly.Module)` にコンパイル済み Module を渡せる。`squoosh_oxipng_bg.wasm?url`（Vite が base/tools/+fingerprint 付与）→ fetch → `WebAssembly.compile` → `init(module)` 注入。emscripten の `instantiateWasm` と同等効果で、Worker の `import.meta.url` 解決に依存しない。SIMD分岐は不要（1本）。`optimise_raw(rgba,w,h,level=2,interlace=false,optimiseAlpha=false)` が生RGBA→PNG最適化を一発で返すため、⑤⑥可逆も ④減色後RGBAも同じ1関数で扱える。

### build 静的確認（dist）
| 確認 | 結果 |
|---|---|
| oxipng wasm URL の base | `/tools/assets/squoosh_oxipng_bg-OFMN1KwG.wasm`（絶対・base付与済み） |
| oxipng wasm のサイズ | **164KB ＝ 単一スレッド版**（parallel は 236KB＝dist に無し） |
| worker→PNG 参照 | `import("./wasm-oxipng-*.js")` の **dynamic import のみ**（静的 import 0） |
| MT/rayon 痕跡 | `pkg-parallel`/`rayon`/`initThreadPool` 文字列・ファイル **すべて 0** |
| build | `✓ 17 modules transformed` / **OOM なし**（382ms） |

## 3. 実装差分

- **`wasm-oxipng.js`（新規）**: 単一スレッド oxipng init 注入＋`optimisePng`（⑤⑥可逆）／`quantiseAndOptimisePng`（④減色→可逆）／純JS `medianCutQuantise`（透過は元アルファ保持・完全透過は分割対象外）。
- **`encode.worker.js`**: `loadOxipngEncoder()`（遅延 import）＋`type==="png"` 分岐（`reduceColors>0` で減色、0で可逆）。
- **`worker-client.js`**: `encodePngInWorker({rgba,width,height,reduceColors})` 追加（Transferable）。
- **`presets.js`**: `FORMAT_DEFS[png-lossless].enabled=true`（準備中解除）／`ILLUST_PNG_COLORS=256`（④限定・§5-1 自動推測の色数判定とは別物と明記）／④に `pngReduce:true`／⑤⑥は推奨そのまま PNG（暫定TODO/`stage3Todo` 削除）／`initialCheckedFormats` の WebP フォールバックは保険として残置。
- **`main.js`**: `encodeOneFormat` に PNG分岐（④=減色256色・⑤⑥=可逆／preset.pngReduce で分岐）。Stage1 の「PNG→WebP降格暫定」を撤去。

## 4. ⑤⑥のWebP暫定解消（§3-c・spec差し替え）
⑤⑥は `recommendedFormats:[PNG_LOSSLESS]` ＝ PNG enabled になったので `initialCheckedFormats` が **PNG を直接初期チェック**（Stage1 の WebP 可逆フォールバックは発火しない）。e2e で ⑤ が PNG 単独出力（136B/-60%）を確認＝暫定解消済み。④は WebP＋PNG の二出力が推奨どおり成立。

## 5. ④減色（256色）
`pngReduce:true` の ④のみ `ILLUST_PNG_COLORS=256` でメディアンカット→`optimise_raw`。少色フラット画像で oxipng がパレットPNG化して効く。色数チューニングは F4 で実画像調整（spec §5-1: ④PNG経路限定・深追いしない）。

## 6. 併せて反映（Stage2 Reid 指摘）
- **S-1**: AVIF→WebP 降格カウントを「**ユーザーが元々 WebP を選んでおらず、降格で初めて WebP が出力に加わるとき**」だけに限定（`main.js`: フォールバック result に `downgradedFromAvif` を付け、`encodeItemFormats` で新規 ext（dedup を通過）時のみ `avifDowngradeCount += 1`／`formats.includes(WEBP)` 時は付けない）。`formats=[webp,avif]`＋AVIF不可でも過剰カウントしない。
- **N-1**: `_c-ic.scss`（`.c-ic-bulk__hint` L273 / `.c-ic-notice` L300）・`_c-ic-card.scss`（`.c-ic-card__advise` L98）の 2値 padding shorthand を `padding-block`/`padding-inline` へ分解（coding-rule §0-4(3)）。見た目不変（block/inline の値割当を保持）。残存 2値 shorthand grep 0。

## 7. 検証（dev:5180 / build→preview:4173 / headless Chrome raw CDP・Node25 global WS・一時script実施後削除）
| 経路 | dev | preview(build) |
|---|---|---|
| ④ WebP 226B(-34%) ＋ **PNG 136B(-60%)**・DL「ZIP」 | ✅ | ✅ |
| ⑤ **PNG 136B(-60%) 単独**・DL「DL」・SVG助言バナー表示 | ✅ | ✅ |
| PNGチェックボックス enabled（準備中バッジ無し）・④で WebP+PNG 既定チェック | ✅ | ✅ |
| console error | 0 | 0 |

regression（preview）: WebP＋AVIF＋JPEG（PNG非選択）→ WebP 200B / AVIF 375B / JPEG 1KB の3出力・err 0・console error 0。**PNG未選択時に oxipng wasm を page Network で取得しない**（遅延import）。

## 8. 自己検証
- 検証済み: **Worker内 oxipng WASMパス解決**（dev/build両方でPNG可逆・④減色がWorker内動作・base/tools/維持・**MT/isolation罠を踏んでいない**＝単一スレッド版164KBのみ・pkg-parallel/rayon 0）。
- 検証済み: **遅延import**（PNG未使用時 oxipng wasm 非取得・dist で dynamic import 分割）。
- 検証済み: **lint/format green**（`_lint`/`_prettier` exit 0）。
- 検証済み: **build 通過**（17 modules・OOMなし）。
- 検証済み: 動線（⑤⑥PNG可逆／④PNG減色／WebP+AVIF+PNG+JPEG 複数選択→逐次→個別DL/一括ZIP・拡張子追従で衝突なし／⑤⑥のWebP暫定解消）。
- 検証済み: S-1（過剰カウント抑止）/N-1（論理プロパティ分解）反映・Stage1/2 regression 非破壊。
- 未達: なし。
- ★要確認（実機調整・F4）: ④減色256色・oxipngレベル2（spec §1）は初期値、黒田さん実画像で詰める。純JSメディアンカットは imagequant ほどの perceptual 最適化ではない（フロント図版用途には十分との判断）。
- F4送り（重い実機検証）: 20〜30枚一括でPNG可逆/減色を含む処理がブラウザを固めないか（逐次＋Worker＋oxipng は大判で時間がかかりうる・構造上は固まらないが実測未了）。
