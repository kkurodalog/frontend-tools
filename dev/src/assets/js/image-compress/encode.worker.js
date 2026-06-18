// =====================================================================
// エンコード Web Worker（01_spec §3-b: メインスレッド凍結を防ぐ生命線）
//   - メインから { rgba(ArrayBuffer), width, height, format, quality, lossless } を受け取り、
//     WebP にエンコードして結果 ArrayBuffer を Transferable で返す。
//   - 1メッセージ=1枚（逐次処理はメイン側が制御）。失敗はメインへ error で返し、全体は止めない。
//   - ★Must M-1: WASM の .wasm は wasm-webp.js が Vite `?url` で解決した URL を fetch→compile して
//     init() に渡すため、Worker 内の import.meta.url 解決に依存しない（base /tools/ 安全）。
//
//   扱うジョブは3種類（type で分岐）。
//     - "webp": メイン側で焼き込んだ RGBA を受け取り WASM で WebP エンコード（非可逆/可逆）。
//     - "avif": 同じ RGBA を AVIF エンコード（WASM）。★Stage2 で追加。
//       ★遅延 import（§3-a）: AVIF の WASM は重いため、初めて AVIF ジョブが来た瞬間に
//         dynamic import する（encode 関数・wasm-avif.js とも）。WebP しか使わないユーザーには
//         AVIF の重い WASM チャンクを一切 DL させない。Vite が別チャンクに分割する。
//     - "png": PNG 可逆（⑤⑥・oxipng）／④イラストの減色（256色→oxipng 可逆）。★Stage3 で追加。
//       ★遅延 import（§3-a）: oxipng の WASM も重いため、初めて PNG ジョブが来た瞬間に
//         dynamic import する（wasm-oxipng.js）。PNG を使わないユーザーには DL させない。
//     - "jpeg": 元形式維持の JPEG 穏やか最適化（D7）。File を受け取り Worker 内で
//       createImageBitmap → OffscreenCanvas → convertToBlob('image/jpeg') まで完結する。
//       ★M-3: 旧実装はこの JPEG 経路をメインスレッドで実行しており、大量×大判で UI が固まる
//         非対称（WebP は Worker・JPEG はメイン）だった。JPEG も Worker に載せて WebP と同じ
//         逐次パイプラインで動かし、メインスレッドを一切ブロックしないようにする。
//         WASM は使わない（OffscreenCanvas のネイティブ JPEG エンコード）ため WebP/WASM 経路に影響しない。
// =====================================================================
import encode from "@jsquash/webp/encode.js";
import { ensureWebpReady } from "./wasm-webp.js";

// ---------------------------------------------------------------------
// AVIF エンコーダの遅延ロード（§3-a）。初めて AVIF ジョブを受けたときだけ wasm-avif.js を
//   dynamic import する（単一スレッド版ファクトリ＋自前 instantiate を内包＝MT 経路を一切引かない）。
//   重い AVIF WASM チャンクは AVIF を使わないユーザーには DL されない（Vite が別チャンク分割）。
// ---------------------------------------------------------------------
let avifModulePromise = null;
function loadAvifEncoder() {
  if (!avifModulePromise) {
    avifModulePromise = import("./wasm-avif.js").then(mod => ({ encode: mod.encodeAvif, ensureReady: mod.ensureAvifReady }));
  }
  return avifModulePromise;
}

// ---------------------------------------------------------------------
// PNG(oxipng) エンコーダの遅延ロード（§3-a / Stage3）。初めて PNG ジョブを受けたときだけ
//   wasm-oxipng.js を dynamic import する（単一スレッド版を自前 instantiate＝MT 経路を引かない）。
//   重い oxipng WASM チャンクは PNG を使わないユーザーには DL されない（Vite が別チャンク分割）。
// ---------------------------------------------------------------------
let oxipngModulePromise = null;
function loadOxipngEncoder() {
  if (!oxipngModulePromise) {
    oxipngModulePromise = import("./wasm-oxipng.js").then(mod => ({
      optimise: mod.optimisePng,
      quantiseAndOptimise: mod.quantiseAndOptimisePng,
      ensureReady: mod.ensureOxipngReady,
    }));
  }
  return oxipngModulePromise;
}

// 長辺 maxEdge に収まるよう縮小後の寸法を計算（拡大しない・アスペクト比維持 / image-ops と同仕様）。
function fitDimensions(width, height, maxEdge) {
  if (!maxEdge) return { width, height };
  const longEdge = Math.max(width, height);
  if (longEdge <= maxEdge) return { width, height };
  const scale = maxEdge / longEdge;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

// JPEG 穏やか最適化（D7）を Worker 内で完結させる。
//   createImageBitmap は EXIF Orientation を自動適用＝正立焼き込み（D3）。透過は白背景で平坦化。
async function encodeJpeg(file, maxEdge) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    bitmap = await createImageBitmap(file);
  }
  const { width, height } = fitDimensions(bitmap.width, bitmap.height, maxEdge);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; // JPEG は透過を持てないため白背景で平坦化。
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.82 });
  return await blob.arrayBuffer();
}

self.addEventListener("message", async event => {
  const { id, type } = event.data;
  try {
    let resultBuffer;

    if (type === "jpeg") {
      // 元形式維持 JPEG（D7）= Worker 内 OffscreenCanvas（WASM 不要）。
      const { file, maxEdge } = event.data;
      resultBuffer = await encodeJpeg(file, maxEdge);
    } else if (type === "avif") {
      // AVIF（Stage2 / WASM・遅延ロード）。@jsquash/avif の encode も ImageData 互換 { data, width, height }。
      const { rgba, width, height, quality } = event.data;
      const avif = await loadAvifEncoder();
      await avif.ensureReady();
      const imageData = { data: new Uint8ClampedArray(rgba), width, height };
      // AVIF は WebP より低い数値で同等の見た目（spec §1-1）。種別×フォーマットの固定品質を quality で受ける。
      //   speed は既定(6)を踏襲。lossless は使わない（種別固定品質で非可逆出力）。
      resultBuffer = await avif.encode(imageData, { quality });
    } else if (type === "png") {
      // PNG（Stage3 / oxipng・遅延ロード）。reduceColors>0 なら ④減色（メディアンカット→oxipng）、
      //   それ以外は ⑤⑥可逆（減色なし・劣化なし）。いずれも RGBA から PNG を生成して可逆最適化する。
      const { rgba, width, height, reduceColors } = event.data;
      const oxipng = await loadOxipngEncoder();
      await oxipng.ensureReady();
      const imageData = { data: new Uint8ClampedArray(rgba), width, height };
      resultBuffer = reduceColors ? await oxipng.quantiseAndOptimise(imageData, reduceColors) : await oxipng.optimise(imageData);
    } else {
      // WebP（既定 / WASM）。@jsquash/webp の encode は ImageData 互換 { data, width, height }。
      const { rgba, width, height, quality, lossless } = event.data;
      await ensureWebpReady();
      const imageData = { data: new Uint8ClampedArray(rgba), width, height };
      // 可逆（lossless）と非可逆で options を切り替える。
      const options = lossless ? { lossless: 1, quality: 100, exact: 1 } : { quality };
      resultBuffer = await encode(imageData, options);
    }

    // 結果 ArrayBuffer を Transferable で返す（コピーコスト回避）。
    self.postMessage({ id, ok: true, buffer: resultBuffer }, [resultBuffer]);
  } catch (err) {
    self.postMessage({
      id,
      ok: false,
      error: (err && err.message) || `${type} エンコードに失敗しました`,
    });
  }
});
