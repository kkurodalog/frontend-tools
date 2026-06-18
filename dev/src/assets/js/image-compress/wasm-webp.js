// =====================================================================
// WebP WASM 初期化（★Must M-1: Worker 内からの .wasm パス解決）
//
//   背景: @jsquash/webp の emscripten グルー（webp_enc.js）は、既定で
//     `import.meta.url` 起点の `scriptDirectory` から `webp_enc.wasm` を
//     locateFile で取得する。これは Worker 内では「Worker スクリプトの URL 起点」で
//     解決されるため、Vite の base(/tools/) 配下での解決が不安定になりうる
//     （メインスレッドの asset 解決とは挙動が異なる）。
//
//   解決方針（採用）: emscripten に locate させず、こちらで .wasm の URL を
//     Vite の `?url` import で取得（＝Vite が base /tools/ と fingerprint を
//     正しく付与した最終 URL を返す）→ fetch → WebAssembly.compile して
//     コンパイル済み Module を init() に渡す。
//     これで dev / build(preview) 双方で確実に解決でき、Worker でも安定する。
//
//   ※ この方式は @jsquash/webp の init(module) が
//     「引数が WebAssembly.Module ならそれを使う」設計（utils.initEmscriptenModule）
//     に依存している（確認済み: node_modules/@jsquash/webp/utils.js）。
// =====================================================================
import { init as initWebpEncode } from "@jsquash/webp/encode.js";
import { simd } from "wasm-feature-detect";

// ---------------------------------------------------------------------
// ★Must M-A: SIMD/非SIMD の module 不整合を防ぐ（非SIMD環境で WebP 全滅対策）
//
//   @jsquash/webp の init() は内部で `await simd()`（wasm-feature-detect）を
//   再判定し、SIMD 非対応環境では非SIMD 版ファクトリ（webp_enc.js）を import する。
//   そのため、こちらが常に SIMD 版 .wasm を compile して渡すと、非SIMD 環境では
//   「非SIMD ファクトリ × SIMD コンパイル済み Module」の import シグネチャ不整合で
//   `new WebAssembly.Instance` 生成が失敗し、その端末では全 WebP エンコードが落ちる。
//
//   対策: こちら側でも `simd()` で判定し、`webp_enc_simd.wasm` / `webp_enc.wasm` を
//   分岐して fetch→compile し、init() 内部の simd() 判定と同系統の Module を渡す。
//   両 `?url` を静的 import しておけば Vite が両方を asset 化する（build に両 .wasm が出る）。
// ---------------------------------------------------------------------

// Vite が base(/tools/) + fingerprint 付きの最終 URL に解決する（両系統を静的 import）。
// なお Worker でも import.meta.url 起点ではなくこの URL 文字列で fetch するため Worker 安全。
import webpWasmSimdUrl from "@jsquash/webp/codec/enc/webp_enc_simd.wasm?url";
import webpWasmUrl from "@jsquash/webp/codec/enc/webp_enc.wasm?url";

let compiledModulePromise = null;
let initialized = false;

// SIMD 判定に応じた .wasm URL を返す（init() 内部の `await simd()` と一致させる）。
async function resolveWasmUrl() {
  return (await simd()) ? webpWasmSimdUrl : webpWasmUrl;
}

// .wasm を fetch → compile（1度だけ）。SIMD/非SIMD を init() 内部判定と揃える。
function getCompiledModule() {
  if (!compiledModulePromise) {
    compiledModulePromise = resolveWasmUrl()
      .then(url =>
        fetch(url).then(res => {
          if (!res.ok) throw new Error(`WebP WASM の取得に失敗しました (${res.status}): ${url}`);
          return res.arrayBuffer();
        }),
      )
      .then(buf => WebAssembly.compile(buf));
  }
  return compiledModulePromise;
}

// エンコーダを初期化（コンパイル済み Module を渡す＝emscripten に locate させない）。
export async function ensureWebpReady() {
  if (initialized) return;
  const module = await getCompiledModule();
  await initWebpEncode(module);
  initialized = true;
}
