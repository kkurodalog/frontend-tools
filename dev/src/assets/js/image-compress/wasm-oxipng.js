// =====================================================================
// PNG 可逆最適化（oxipng）＋ ④イラスト減色（★Must M-1: Worker 内 .wasm パス解決 / Stage3）
//
//   ★方針: @jsquash/oxipng の optimise.js（公開 API の init/optimise）は使わない。
//     理由 ＝ AVIF と同じ MT 経路の罠: optimise.js の init() は
//       「Worker コンテキスト ＆ hardwareConcurrency>1 ＆ await threads()」のとき
//       マルチスレッド版（codec/pkg-parallel/squoosh_oxipng.js ＋ wasm-bindgen-rayon ＋
//       parallel .wasm）を dynamic import する。本サイト（kurodafolio.com/tools/）は
//       cross-origin isolation（COOP/COEP）を張っていないため MT 版は SharedArrayBuffer 不在で
//       動かず、Rollup も MT グルー＋snippets を辿ってビルドが膨らむ（AVIF と同型の罠）。
//       しかも本ツールのエンコードは Worker 内で走る＝ちょうど MT 判定が true 側に倒れる条件。
//
//   そこで「単一スレッド版 codec/pkg/squoosh_oxipng.js を直接 import して自前で init」する。
//     - WebP/AVIF（wasm-webp.js / wasm-avif.js）と同じく、こちらで .wasm の URL を Vite の
//       `?url` import で取得（base /tools/ + fingerprint 付きの最終 URL）→ fetch →
//       WebAssembly.compile → 単一スレッド版の default export init(module) にコンパイル済み
//       Module を渡す。wasm-bindgen の init は引数が WebAssembly.Module ならそれをそのまま
//       instantiate する（emscripten の instantiateWasm と同等の効果 / Worker の import.meta.url
//       解決に依存しない＝base /tools/ 安全・Must M-1）。
//     - 単一スレッド版 .wasm は 1 本（squoosh_oxipng_bg.wasm）のみ。WebP のような SIMD 分岐は不要。
//     - MT 版（pkg-parallel）には一切触れないため、ビルドの膨張も回避できる。
//
//   ※ wasm-bindgen の export は関数（optimise / optimise_raw）。
//      optimise_raw(rgba, width, height, level, interlace, optimiseAlpha) は生 RGBA を受け取り
//      oxipng で PNG にエンコード＋可逆最適化して Uint8Array を返す。
//      ⑤⑥（可逆）も ④（減色後の RGBA）も同じ optimise_raw 1 本で扱える。
// =====================================================================
import init, { optimise_raw } from "@jsquash/oxipng/codec/pkg/squoosh_oxipng.js";

// Vite が base(/tools/) + fingerprint 付きの最終 URL に解決する（単一スレッド版の 1 本のみ）。
//   Worker でも import.meta.url 起点ではなくこの URL 文字列で fetch するため Worker 安全。
import oxipngWasmUrl from "@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm?url";

// oxipng 最適化レベル（spec §1: 内部固定 2）。interlace=false / optimiseAlpha=false は既定どおり。
const OXIPNG_LEVEL = 2;

let readyPromise = null;

// 単一スレッド版 init に、自前 compile した Module を渡して初期化（1度だけ）。
function ensureReady() {
  if (!readyPromise) {
    readyPromise = fetch(oxipngWasmUrl)
      .then(res => {
        if (!res.ok) throw new Error(`PNG(oxipng) WASM の取得に失敗しました (${res.status}): ${oxipngWasmUrl}`);
        return res.arrayBuffer();
      })
      .then(buf => WebAssembly.compile(buf))
      // wasm-bindgen の init は WebAssembly.Module を渡すとそれを instantiate する（MT 経路を一切引かない）。
      .then(wasmModule => init(wasmModule));
  }
  return readyPromise;
}

export async function ensureOxipngReady() {
  await ensureReady();
}

// ⑤⑥（可逆）: RGBA をそのまま PNG 可逆最適化（減色なし・劣化なし）。
//   imageData = { data: Uint8ClampedArray | ArrayBuffer 由来, width, height } → 出力 PNG の ArrayBuffer。
export async function optimisePng(imageData) {
  await ensureReady();
  const rgba = imageData.data instanceof Uint8ClampedArray ? imageData.data : new Uint8ClampedArray(imageData.data);
  const out = optimise_raw(rgba, imageData.width, imageData.height, OXIPNG_LEVEL, false, false);
  if (!out) throw new Error("PNG(oxipng) 最適化に失敗しました");
  return out.buffer;
}

// ④イラスト: 減色（≤maxColors 色・既定 256）してから PNG 可逆最適化。
//   減色は純 JS のメディアンカット（WASM 非依存・Worker 内で完結＝メインを固めない）。
//   減色後の RGBA を optimise_raw に渡すと、oxipng がパレット PNG として効率よく出力する。
export async function quantiseAndOptimisePng(imageData, maxColors) {
  await ensureReady();
  const src = imageData.data instanceof Uint8ClampedArray ? imageData.data : new Uint8ClampedArray(imageData.data);
  const reduced = medianCutQuantise(src, maxColors);
  const out = optimise_raw(reduced, imageData.width, imageData.height, OXIPNG_LEVEL, false, false);
  if (!out) throw new Error("PNG(oxipng) 減色最適化に失敗しました");
  return out.buffer;
}

// =====================================================================
// メディアンカット減色（純 JS / WASM 非依存）
//   - RGBA 配列を ≤maxColors 色のパレットへ量子化する。アルファは元の値を保持する（透過維持）。
//   - 平坦色のイラスト・図版で効果が高い（spec §1 ④）。色数が元から少なければ素通しに近い。
//   - 厳密な perceptual 最適化（imagequant 相当）ではないが、Worker 安全・依存ゼロ・決定論的で、
//     フロント制作の図版用途には十分。品質チューニングは F4 で実画像調整（spec §5-1 の注記＝深追いしない）。
// =====================================================================
function medianCutQuantise(rgba, maxColors) {
  const max = Math.max(2, Math.min(256, maxColors || 256));
  const pixelCount = rgba.length / 4;

  // 不透明画素のみで色空間を分割する（透過画素は最終出力で元アルファを保つ）。
  const pixels = [];
  for (let i = 0; i < pixelCount; i++) {
    const a = rgba[i * 4 + 3];
    if (a === 0) continue; // 完全透過は分割対象から除外（色は意味を持たない）。
    pixels.push(i);
  }
  if (pixels.length === 0) return rgba; // 全透過 → 減色不要。

  // 初期バケット = 全画素。再帰的に最も広い軸で中央分割していく。
  let buckets = [pixels];
  while (buckets.length < max) {
    // 最も「広がっている（最大レンジの軸が大きい）」バケットを選んで分割する。
    let targetIdx = -1;
    let targetRange = -1;
    let targetChannel = 0;
    for (let b = 0; b < buckets.length; b++) {
      if (buckets[b].length < 2) continue;
      const { range, channel } = widestChannel(rgba, buckets[b]);
      if (range > targetRange) {
        targetRange = range;
        targetIdx = b;
        targetChannel = channel;
      }
    }
    if (targetIdx === -1) break; // これ以上分割できない（全バケットが単色）。

    const bucket = buckets[targetIdx];
    bucket.sort((p, q) => rgba[p * 4 + targetChannel] - rgba[q * 4 + targetChannel]);
    const mid = bucket.length >> 1;
    const left = bucket.slice(0, mid);
    const right = bucket.slice(mid);
    buckets.splice(targetIdx, 1, left, right);
  }

  // 各バケットの平均色を代表色（パレット）にし、所属画素へ書き戻す。アルファは元値を保持。
  const out = new Uint8ClampedArray(rgba); // 透過画素はコピー元のまま残る。
  for (const bucket of buckets) {
    let r = 0;
    let g = 0;
    let bl = 0;
    for (const p of bucket) {
      r += rgba[p * 4];
      g += rgba[p * 4 + 1];
      bl += rgba[p * 4 + 2];
    }
    const n = bucket.length || 1;
    const ar = Math.round(r / n);
    const ag = Math.round(g / n);
    const ab = Math.round(bl / n);
    for (const p of bucket) {
      out[p * 4] = ar;
      out[p * 4 + 1] = ag;
      out[p * 4 + 2] = ab;
      // out[p*4+3] = 元アルファのまま（コピー済み）。
    }
  }
  return out;
}

// バケット内で最もレンジが広いチャンネル（0=R,1=G,2=B）とそのレンジを返す。
function widestChannel(rgba, bucket) {
  let rMin = 255;
  let rMax = 0;
  let gMin = 255;
  let gMax = 0;
  let bMin = 255;
  let bMax = 0;
  for (const p of bucket) {
    const r = rgba[p * 4];
    const g = rgba[p * 4 + 1];
    const b = rgba[p * 4 + 2];
    if (r < rMin) rMin = r;
    if (r > rMax) rMax = r;
    if (g < gMin) gMin = g;
    if (g > gMax) gMax = g;
    if (b < bMin) bMin = b;
    if (b > bMax) bMax = b;
  }
  const rRange = rMax - rMin;
  const gRange = gMax - gMin;
  const bRange = bMax - bMin;
  if (rRange >= gRange && rRange >= bRange) return { range: rRange, channel: 0 };
  if (gRange >= bRange) return { range: gRange, channel: 1 };
  return { range: bRange, channel: 2 };
}
