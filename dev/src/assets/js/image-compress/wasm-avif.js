// =====================================================================
// AVIF WASM 初期化＋エンコード（★Must M-1: Worker 内からの .wasm パス解決 / Stage2）
//
//   ★方針: @jsquash/avif の encode.js（公開 API の init/encode）は使わない。
//     理由(1) ＝ MT 経路の混入: encode.js の init() は内部で `await threads()` を判定し、
//       true なら マルチスレッド版 `avif_enc_mt.js`（+ `.worker.mjs` + `avif_enc_mt.wasm`）を
//       dynamic import する。本サイト（kurodafolio.com/tools/）は cross-origin isolation
//       （COOP/COEP ヘッダ）を張っていないため MT 版は動かない（SharedArrayBuffer 不可）。
//     理由(2) ＝ ビルド爆発: Rollup は encode.js の両 dynamic import を辿って MT グルー
//       （avif_enc_mt.js）と nested worker（avif_enc_mt.worker.mjs）まで変換しようとし、
//       transform フェーズで JS heap OOM（実測: --max-old-space-size=6144 でも落ちる）になる。
//
//   そこで「単一スレッド版ファクトリ avif_enc.js を直接 import して自前で instantiate」する。
//     - WebP（wasm-webp.js）と同じく、emscripten に locate させず、こちらで .wasm の URL を
//       Vite の `?url` import で取得（base /tools/ + fingerprint 付きの最終 URL）→ fetch →
//       WebAssembly.compile → ファクトリの `instantiateWasm` フックでその Module を注入する。
//       これで Worker 内の import.meta.url 解決に依存しない（base /tools/ 安全・Must M-1）。
//     - 単一スレッド版 .wasm は SIMD 分岐のない 1 本（avif_enc.wasm）だけで、WebP のような
//       SIMD/非SIMD 分岐は不要。
//     - MT 版（avif_enc_mt.*）には一切触れないため、ビルドの OOM も回避できる。
//
//   ※ emscripten ファクトリは `Module["instantiateWasm"]` を尊重する（確認済み:
//      node_modules/@jsquash/avif/codec/enc/avif_enc.js）。同梱の encode メソッド呼び出し規約は
//      node_modules/@jsquash/avif/encode.js（module.encode(Uint8Array, w, h, options)）に準拠。
// =====================================================================
import avifEncoderFactory from "@jsquash/avif/codec/enc/avif_enc.js";

// Vite が base(/tools/) + fingerprint 付きの最終 URL に解決する（単一スレッド版の 1 本のみ）。
//   Worker でも import.meta.url 起点ではなくこの URL 文字列で fetch するため Worker 安全。
import avifWasmUrl from "@jsquash/avif/codec/enc/avif_enc.wasm?url";

// @jsquash/avif の encode 既定オプション（meta.js と同値）。種別固定の quality だけ差し替える。
//   ※ meta.js を import すると encode.js 経由で MT が引き込まれうるため、ここに必要分だけ複製する。
const AVIF_DEFAULT_OPTIONS = {
  quality: 50,
  qualityAlpha: -1,
  denoiseLevel: 0,
  tileColsLog2: 0,
  tileRowsLog2: 0,
  speed: 6,
  subsample: 1,
  chromaDeltaQ: false,
  sharpness: 0,
  tune: 0,
  enableSharpYUV: false,
  bitDepth: 8,
  lossless: false,
};

let modulePromise = null;

// 単一スレッド版ファクトリを、自前 compile した Module を instantiateWasm で注入して初期化（1度だけ）。
function getModule() {
  if (!modulePromise) {
    modulePromise = fetch(avifWasmUrl)
      .then(res => {
        if (!res.ok) throw new Error(`AVIF WASM の取得に失敗しました (${res.status}): ${avifWasmUrl}`);
        return res.arrayBuffer();
      })
      .then(buf => WebAssembly.compile(buf))
      .then(wasmModule =>
        avifEncoderFactory({
          noInitialRun: true,
          // emscripten に .wasm を locate/fetch させず、こちらの compile 済み Module を使わせる。
          instantiateWasm(imports, callback) {
            const instance = new WebAssembly.Instance(wasmModule, imports);
            callback(instance);
            return instance.exports;
          },
        }),
      );
  }
  return modulePromise;
}

// AVIF を初期化（Worker の遅延ロード後に1度だけ呼ぶ想定）。エラーは呼び出し側で捕捉→WebP 降格（S-3）。
export async function ensureAvifReady() {
  await getModule();
}

// 1枚を AVIF エンコード。imageData = { data: Uint8ClampedArray, width, height }。
//   module.encode(Uint8Array, width, height, options) → 出力 Uint8Array（.buffer を返す）。
export async function encodeAvif(imageData, { quality } = {}) {
  const module = await getModule();
  const options = { ...AVIF_DEFAULT_OPTIONS };
  if (typeof quality === "number") options.quality = quality;
  const output = module.encode(new Uint8Array(imageData.data.buffer), imageData.width, imageData.height, options);
  if (!output) throw new Error("AVIF エンコードに失敗しました");
  return output.buffer;
}
