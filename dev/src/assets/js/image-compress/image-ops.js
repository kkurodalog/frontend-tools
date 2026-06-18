// =====================================================================
// 画像のネイティブ前処理（WASM 不要・Canvas / createImageBitmap で完結）
//   - デコード（createImageBitmap は EXIF Orientation を自動適用＝正立焼き込み / D3）
//   - リサイズ（長辺上限・縮小のみ・アスペクト比維持）
//   - RGBA 取り出し（Worker へ渡す ImageData 相当）
//   ※ EXIF/メタは Canvas 経由で再描画する時点で落ちる（メタ削除デフォルトON と整合）。
//   ※ 元形式維持の JPEG 穏やか最適化（D7）は encode.worker.js 側へ移設した（★M-3: メイン
//      スレッドを固めないよう Worker 内 OffscreenCanvas で完結。本ファイルからは撤去）。
// =====================================================================

// createImageBitmap で Orientation を正立適用してデコードする。
//   imageOrientation: "from-image" = EXIF の向きを反映（＝正立焼き込み / D3）。
async function decodeOriented(file) {
  // createImageBitmap の imageOrientation 対応はモダンブラウザで広くサポート。
  // 非対応環境では通常デコードにフォールバック（向きは無補正だが処理は継続）。
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}

// 長辺 maxEdge に収まるよう縮小後の寸法を計算（拡大しない・アスペクト比維持）。
function fitDimensions(width, height, maxEdge) {
  if (!maxEdge) return { width, height };
  const longEdge = Math.max(width, height);
  if (longEdge <= maxEdge) return { width, height };
  const scale = maxEdge / longEdge;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

// file → { rgba(ArrayBuffer), width, height }（Worker へ渡す素材）。
//   リサイズ＋Orientation正立焼き込み＋メタ削除をこの段階で済ませる。
export async function prepareRgba(file, maxEdge) {
  const bitmap = await decodeOriented(file);
  const { width, height } = fitDimensions(bitmap.width, bitmap.height, maxEdge);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const imageData = ctx.getImageData(0, 0, width, height);
  // Uint8ClampedArray の backing ArrayBuffer を Transferable で Worker へ渡す。
  return { rgba: imageData.data.buffer, width, height };
}

// 画像メタ（元寸 ＋ 自動推測（Stage4）用の軽量特徴量）を取得。
//   ★spec §5-1: 取得するのは「デコード時に得られる軽量な特徴量のみ」。
//     - 解像度（長辺px・アスペクト比）
//     - 透過アルファの有無
//     - 色数おおよそ（縮小サムネ 64〜128px 上のユニーク色を Set でカウント・上限到達で打ち切り）
//     - 入力フォーマット（png/jpeg/webp）
//   フル解像度では走査しない（縮小サムネ上のみ＝軽量）。重い解析はしない。
//   ※この色数判定は「自動推測（種別割当）用」であり、④の減色（imagequant）とは別物（spec §5-1 注記）。
export async function readImageMeta(file) {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    return { width: 0, height: 0, aspect: 1, hasAlpha: false, approxColors: 0, manyColors: false, format: detectInputFormat(file) };
  }
  const width = bitmap.width;
  const height = bitmap.height;
  const features = extractThumbFeatures(bitmap); // 縮小サムネ上でアルファ有無・色数を軽量判定
  bitmap.close();
  const longEdge = Math.max(width, height);
  return {
    width,
    height,
    aspect: height ? width / height : 1, // 横/縦
    longEdge,
    hasAlpha: features.hasAlpha,
    approxColors: features.approxColors,
    manyColors: features.manyColors,
    format: detectInputFormat(file),
  };
}

// 入力フォーマット（png/jpeg/webp）。MIME 優先・無ければ拡張子で判定（spec §5-1）。
function detectInputFormat(file) {
  const type = (file.type || "").toLowerCase();
  if (type.includes("png")) return "png";
  if (type.includes("jpeg") || type.includes("jpg")) return "jpeg";
  if (type.includes("webp")) return "webp";
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".png")) return "png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "jpeg";
  if (name.endsWith(".webp")) return "webp";
  return "other";
}

// 推測用の色数上限（これを超えたら「多色」と確定して走査を打ち切る＝軽量化 / spec §5-1 S-1）。
const APPROX_COLOR_CAP = 400;
// 縮小サムネの長辺px（64〜128px 目安・spec §5-1）。
const THUMB_LONG_EDGE = 96;

// 縮小サムネ（長辺 96px）を描画 → getImageData でアルファ有無・ユニーク色数を軽量判定。
//   ユニーク色が APPROX_COLOR_CAP を超えた時点で「多色」と確定し走査を止める（全色カウントしない）。
function extractThumbFeatures(bitmap) {
  const longEdge = Math.max(bitmap.width, bitmap.height) || 1;
  const scale = longEdge > THUMB_LONG_EDGE ? THUMB_LONG_EDGE / longEdge : 1;
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  try {
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const colors = new Set();
    let hasAlpha = false;
    let manyColors = false;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 250) hasAlpha = true; // 半透明・透明ピクセルがあれば「透過あり」
      if (!manyColors) {
        // RGB をビットパックしてユニーク色をカウント（アルファは色数に含めない＝色味の多寡を見る）。
        const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
        colors.add(key);
        if (colors.size > APPROX_COLOR_CAP) manyColors = true; // 上限到達で打ち切り（軽量）
      }
    }
    return { hasAlpha, approxColors: colors.size, manyColors };
  } catch {
    // getImageData が失敗（極端な環境）したら推測は無効化（フォールバックは ③ になる）。
    return { hasAlpha: false, approxColors: 0, manyColors: false };
  }
}
