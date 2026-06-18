// =====================================================================
// エンコード Worker クライアント（メイン側のラッパー）
//   - new Worker(new URL("./encode.worker.js", import.meta.url), { type: "module" }) で生成。
//     ★この new URL(..., import.meta.url) 形式が Vite 公式の Worker 解決手段で、
//       base(/tools/) を含む最終 URL に解決される（Must M-1 のメイン側パス解決）。
//   - リクエストごとに id を振り、postMessage→message で 1:1 に対応付ける。
//   - 逐次処理（1枚ずつ）はメイン側（main.js）が await で直列化して担保する。
// =====================================================================

let worker = null;
let seq = 0;
const pending = new Map();

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./encode.worker.js", import.meta.url), {
    type: "module",
  });
  worker.addEventListener("message", event => {
    const { id, ok, buffer, error } = event.data;
    const entry = pending.get(id);
    if (!entry) return;
    pending.delete(id);
    if (ok) entry.resolve(buffer);
    else entry.reject(new Error(error));
  });
  worker.addEventListener("error", event => {
    // Worker 自体の致命エラー（WASM OOM 等）: 保留中すべてを reject（全体は main 側 try/catch で継続）。
    pending.forEach(entry => entry.reject(new Error(event.message || "Worker error")));
    pending.clear();
    // ★S-3: 壊れた可能性のある worker を破棄して null 化する。
    //   そのまま再利用すると以降の全エンコードが連鎖失敗しうるため、次回 getWorker() で
    //   新しい worker を生成し直して回復可能にする（lazy 生成パターンに乗せる）。
    if (worker) worker.terminate();
    worker = null;
  });
  return worker;
}

// 1枚を WebP エンコード。rgba は Transferable で渡す。
//   { rgba(ArrayBuffer), width, height, quality, lossless } → Promise<ArrayBuffer>
export function encodeWebpInWorker({ rgba, width, height, quality, lossless }) {
  const w = getWorker();
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({ id, type: "webp", rgba, width, height, quality, lossless }, [rgba]);
  });
}

// 1枚を AVIF エンコード（Stage2）。rgba は Transferable で渡す。
//   AVIF の WASM は Worker 内で初回のみ遅延 import される（§3-a / encode.worker.js loadAvifEncoder）。
//   { rgba(ArrayBuffer), width, height, quality } → Promise<ArrayBuffer>
export function encodeAvifInWorker({ rgba, width, height, quality }) {
  const w = getWorker();
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({ id, type: "avif", rgba, width, height, quality }, [rgba]);
  });
}

// 1枚を PNG エンコード（Stage3）。rgba は Transferable で渡す。
//   reduceColors>0 なら ④イラストの減色（メディアンカット→oxipng）、未指定/0 なら ⑤⑥可逆。
//   oxipng の WASM は Worker 内で初回のみ遅延 import される（§3-a / encode.worker.js loadOxipngEncoder）。
//   { rgba(ArrayBuffer), width, height, reduceColors? } → Promise<ArrayBuffer>
export function encodePngInWorker({ rgba, width, height, reduceColors }) {
  const w = getWorker();
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({ id, type: "png", rgba, width, height, reduceColors }, [rgba]);
  });
}

// 1枚を JPEG 穏やか最適化（D7）。デコード〜エンコードを Worker 内で完結させ、
//   メインスレッドをブロックしない（★M-3: WebP と同じ逐次パイプラインに統一）。
//   File は structured clone でコピーされる（Blob は参照渡し相当でデータコピーは発生しない）。
//   { file(File), maxEdge } → Promise<ArrayBuffer>
export function encodeJpegInWorker({ file, maxEdge }) {
  const w = getWorker();
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({ id, type: "jpeg", file, maxEdge });
  });
}
