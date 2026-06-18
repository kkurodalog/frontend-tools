# F3 Stage2 実装ノート（Cody / AVIF 出力）

担当: Cody（制作部）/ 2026-06-18 / 対象: `dev/src/assets/js/image-compress/{wasm-avif,encode.worker,worker-client,presets,main}.js`
前提: Stage1（WebP＋keep-JPEG）完成・Reid 評価ゲート通過済み（`_f3-stage1-cody-note.md`）。本ノートは Stage2（AVIF・spec §1/§3/§4）の差分のみ記録。

## 1. ★最重要＝Worker 内 AVIF WASM パス解決（Must M-1・WebP と同作法＋AVIF 固有の罠）

### 採用方式（新規 `wasm-avif.js`）
WebP（`wasm-webp.js`）と同じく **emscripten に locate させず、こちらで `.wasm` URL を確定して渡す**:
1. `import avifWasmUrl from "@jsquash/avif/codec/enc/avif_enc.wasm?url"` で Vite が base(/tools/)＋fingerprint 付き最終 URL に解決。
2. `fetch(url)` → `WebAssembly.compile(buf)` → emscripten ファクトリの **`instantiateWasm` フック**でその Module を注入。
3. Worker 生成・遅延 import は既存 `worker-client.js` / `encode.worker.js` の作法を踏襲（`new URL("./encode.worker.js", import.meta.url)`）。

### ★WebP との決定的な相違＝「SIMD 分岐」ではなく「マルチスレッド(MT)分岐」
`@jsquash/avif` の公開 `encode.js` の `init()` は内部で **`await threads()`**（`simd()` ではない）を判定し、true なら **MT 版**（`avif_enc_mt.js` ＋ nested `avif_enc_mt.worker.mjs` ＋ `avif_enc_mt.wasm`）を dynamic import する。これが2つの問題を生む:

- **(問題A) 実行時に動かない**: MT 版は `SharedArrayBuffer` 前提＝**cross-origin isolation（COOP/COEP ヘッダ）必須**。本サイト（kurodafolio.com/tools/・静的配信）は isolation を張っていないため MT 経路では落ちる。`threads()` は「MessageChannel で SAB を postMessage できるか」で判定するため非 isolated 環境では false を返し、単一スレッド版にフォールバックする想定だが、判定に依存するのは脆い。
- **(問題B) ビルドが OOM で落ちる**: Rollup は `encode.js` の両 dynamic import を辿り、MT グルー（`avif_enc_mt.js`・54KB minified）と nested worker（`.worker.mjs`）まで変換しようとして、**transform フェーズで JS heap OOM**（`--max-old-space-size=6144` でも `FATAL: Allocation failed` で落ちる・実測）。

### 解決＝公開 `encode.js` を使わず、単一スレッド版ファクトリを直接 import
`wasm-avif.js` で **`@jsquash/avif/codec/enc/avif_enc.js`（単一スレッド版ファクトリ）を直接 import** し、自前で `instantiateWasm` 注入＋ `module.encode(Uint8Array, w, h, options)` を呼ぶ（呼び出し規約は `@jsquash/avif/encode.js` に準拠）。`encode.js`（init/encode）には一切触れない。
- → **MT 版（`avif_enc_mt.*`）を一切ビルドに引かない** ＝ 問題A（実行時 SAB 不在）も問題B（ビルド OOM）も同時に解消。
- 単一スレッド版 `.wasm` は **SIMD 分岐のない 1 本**（`avif_enc.wasm`・3.5MB）のみ。WebP のような simd/非simd の2系統 fetch は不要。
- `defaultOptions`（quality:50, speed:6, subsample:1 等）は `meta.js` を import すると `encode.js` 経由で MT を引きうるため、`wasm-avif.js` 内に必要分だけ複製した。種別固定の `avifQuality` だけ差し替える。

### 検証（dev / build 両モード・headless Chrome＋raw CDP / Node25 global WebSocket・一時スクリプトで実施後削除）
| 環境 | URL | 結果 |
|---|---|---|
| `yarn dev` | `http://localhost:5180/tools/image-compress/` | ✅ 200×200 PNG → WebP 1010B(-97%) ＋ **AVIF 712B(-98%)** / console error 0 |
| `yarn build`→`yarn preview` | `http://localhost:4173/tools/image-compress/` | ✅ 同上（AVIF 712B）/ console error 0 |

build 静的確認: `dist/assets/wasm-avif-*.js` 内の wasm 参照＝`"/tools/assets/avif_enc-*.wasm"`（base 付与済み・絶対）。`encode.worker-*.js` は AVIF を `import("./wasm-avif-*.js")` の **dynamic import** でのみ参照（静的参照 0）。**MT codec（`avif_enc_mt*`）は dist に一切出力されない**。
→ **dev / build(preview) 双方で Worker 内 AVIF WASM 解決が成立**。Must M-1（AVIF）クリア。

## 2. 遅延 import（§3-a）
- AVIF の WASM（3.5MB）はユーザーが AVIF を初めて選択し圧縮を走らせた瞬間にだけ Worker 内で `import("./wasm-avif.js")` される（`encode.worker.js` `loadAvifEncoder()`・1度だけ解決して使い回す）。
- 検証: ページロード時点の Network に `avif_enc*.wasm` は出現しない（`avifWasmFetchedBeforeSelect: false`）。build 解析でも main image-compress entry に AVIF wasm 参照なし＝WebP しか使わないユーザーに重い WASM を DL させない。
  - 注: Worker 内 fetch は Worker target の Network であり page-level CDP には surface しないため、ランタイムでの「選択後 fetch」を page Network では直接観測できない。実エンコード成功（712B 出力）＋静的 dynamic-import 分割＋ロード時非取得の3点で §3-a を担保。

## 3. AVIF チェックボックス有効化（§3-c）
- `presets.js` `FORMAT_DEFS[avif].enabled = true`（`stage:2` のまま）。disabled「準備中」バッジ解除。一括＋カード個別の両方で選択可（既存 `formatGroupHtml`/`isFormatEnabled` がそのまま機能）。
- 種別変更時の推奨フォーマット既定追従（`initialCheckedFormats`）は不変。①②③等は WebP 推奨のままで、AVIF はユーザーが任意 ON（spec §1「AVIF出力時 q=…」＝既定は WebP 優先）。

## 4. AVIF 品質値（§1）
- presets の `avifQuality` を Worker へ渡す（①45 / ②63 / ③52 / ④60 / ⑤⑥70・spec §1 の AVIF 列）。`encode.worker.js` の avif 分岐が `{ quality: avifQuality }` で受ける。実機調整は presets 1か所。

## 5. 「重い」注記＋進捗（D4・§3-b）
- `runCompression` 冒頭で「一括 or いずれかのカードで AVIF 選択」を検出したら `showNotice("AVIF は…エンコードに時間がかかります…", "info")` を実行中表示。逐次進捗（n/N＋ファイル名）は Stage1 の `showProgress` をそのまま流用。

## 6. Should S-3＝AVIF 不可環境は WebP 自動降格（＋ S-2 集約）
- 判定方式＝**初回 AVIF エンコード時の例外捕捉**（probe 方式は採らず・無駄な試行を避ける）。`encodeOneFormat` の AVIF 分岐で `encodeAvifInWorker` が reject したら `avifUnavailable=true` を立て、当該枚を `encodeWebpFallback` で WebP 出力。**以降の画像は最初から WebP 経路へ**（再試行・再失敗・固まりを回避）。処理は止めない。
- **S-2 集約**: 降格のたびに通知を上書きせず `avifDowngradeCount` を加算するだけにし、`runCompression` 完了時に `flushAvifDowngradeNotice()` で **「この環境では AVIF が使えないため、N 枚を WebP で出力しました。」を1回だけ**表示（連打・点滅を防止）。`avifUnavailable` はセッション内で持続（同セッションの2回目以降の実行も降格固定）。
- ※ MT 経路（SAB 不在）には構造的に入らない実装にしたため、主な降格トリガは「Safari 等で単一スレッド WASM 初期化/エンコードに失敗」した場合。実機 Safari 検証は F4 送り（02_qa 2-2）。コード経路は dev で AVIF 成功を確認済み＝正常系は通る。

## 7. フォーマット別容量比較（§4-1-4）
- `paintResult` が結果配列を各フォーマット行（ラベル＋容量＋削減率）で並べる既存仕組みがそのまま比較表示になる。`formatExtLabel` を `FORMAT_DEFS[result.format].label` 参照に変更し、AVIF 行が「AVIF」と正しく出る（降格時は実体に従い「WebP」表示）。e2e で WebP/AVIF の2行併記＝比較成立を確認。

## 8. regression（Stage1 非破壊）
- `encodeOneFormat` を AVIF 分岐＋ `encodeWebpFallback` 共通化にリファクタしたが、WebP/keep-JPEG 経路・複数出力・カード個別フォーマット・Transferable・メモリ解放は不変。
- 検証（dev・WebP＋JPEG／AVIF 非選択）: WebP 128B(-87%) ＋ JPEG 905B(-9%)・DL ラベル「ZIP」・**AVIF 注記は非表示**・console error 0。Stage1 維持を確認。

## 9. lint/format/build
- `yarn format` → `yarn _lint` / `yarn _prettier` いずれも exit 0。`yarn build` 成功（`✓ 17 modules transformed`・OOM なし）。

## 10. 依存追加
- `@jsquash/avif@2.1.1` を dependencies に追加（`yarn add @jsquash/avif`）。理由＝AVIF エンコーダ（spec §3）。

## 11. ★要確認 / F4 送り
- **★要確認（実機調整）**: `avifQuality`（①45/②63/③52 等）は spec §1 の初期値。WebP より低い数値で同等の見た目という前提で、黒田さんの実画像で詰める（F4）。`speed:6`（既定）も品質/速度トレードオフの調整余地（重ければ 8 寄せ等）。
- **F4 送り（重い実機検証）**: 20〜30枚一括で AVIF を含む処理がブラウザを固めないか（逐次＋Worker で構造的には固まらないはずだが実測未了）。Safari での AVIF 不可→WebP 降格パスの実機確認（本実装はコード経路を用意済み・擬似発火は未実施）。
- **PNG 可逆（⑤⑥・④減色）は Stage3**: AVIF 降格保険は WebP 固定（PNG 未稼働は従来どおり WebP 降格・通知）。
