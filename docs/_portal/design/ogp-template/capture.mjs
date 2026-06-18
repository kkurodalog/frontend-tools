/* =====================================================================
   Frontend Tools — OGP 撮影スクリプト（Playwright headless + sharp 高品質縮小）
   担当: Cody（制作部）/ 2026-06-18 改訂2（くっきり化）

   役割: ogp.html を 1200×630 の viewport で開き、Web フォント（Noto Sans JP /
         Inter）のロード完了（document.fonts.ready）を待ってから #ogp-card を
         deviceScaleFactor=3（=3600×1890）で撮影し、sharp の lanczos3 で
         1200×630 へ高品質縮小する。最後に軽くシャープをかけてエッジを締める。

   ■ なぜこの方式か（ぼやけの原因と対策）
     旧方式は「DSF=2 で撮影 → sips -z で縮小」だった。sips の縮小は補間が甘く
     和文の細部がにじむ。さらに本体 OGP は DSF=1 撮影でスーパーサンプリングが
     なく最もぼやけていた。本スクリプトは
       (1) DSF=3 で 3倍精細に撮る（テキストのエッジ情報を多く取る）
       (2) sharp（libvips / lanczos3 カーネル）で 1200×630 へ縮小（高品質補間）
       (3) sharp.sharpen で軽くアンシャープ（縮小で甘くなったエッジを締める）
     により、最終 1200×630 でも和文がくっきりする。

   使い方:
     node capture.mjs <html入力パス> <出力パス.png|.jpg> [jpegQuality]
   例:
     node capture.mjs ./ogp.html ./ogp.png          # PNG（frontend-tools）
     node capture.mjs ./ogp.html ./ogp.jpg 90       # JPEG q90（本体）

   依存:
     - Playwright（chromium）: グローバル導入（NODE_PATH=$(npm root -g)）で解決。
     - sharp: frontend-tools/dev/node_modules の sharp を SHARP_PATH 環境変数で
       絶対パス指定して読み込む（新規 devDependency は足さない方針）。
         SHARP_PATH=/abs/path/to/dev/node_modules/sharp/lib/index.js
   ===================================================================== */

import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

// sharp は dev/node_modules から絶対パスで読む（ESM は NODE_PATH を無視するため）
const sharpPath = process.env.SHARP_PATH;
if (!sharpPath) {
  console.error(
    "SHARP_PATH 未指定。例: SHARP_PATH=/abs/.../dev/node_modules/sharp/lib/index.js node capture.mjs ..."
  );
  process.exit(1);
}
const { default: sharp } = await import(pathToFileURL(sharpPath).href);

const inputArg = process.argv[2] || "./ogp.html";
const outputArg = process.argv[3] || "./ogp.png";
const jpegQuality = process.argv[4] ? parseInt(process.argv[4], 10) : 90;

const inputUrl = pathToFileURL(resolve(process.cwd(), inputArg)).href;
const outputPath = resolve(process.cwd(), outputArg);
const isJpeg = /\.jpe?g$/i.test(outputPath);

const SCALE = 3; // deviceScaleFactor（3 = 3600×1890 で撮影）

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: SCALE,
  });

  await page.goto(inputUrl, { waitUntil: "networkidle" });

  // Web フォントのロード完了を待つ（最重要 / フォントが乗らないと別物になる）
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(300);

  const card = page.locator("#ogp-card");
  // 高精細 PNG をメモリに取得（DSF3 = 3600×1890）
  const hiResBuf = await card.screenshot({ type: "png" });

  // sharp で 1200×630 へ高品質縮小（lanczos3）＋ 軽いシャープでエッジを締める
  let pipeline = sharp(hiResBuf)
    .resize(1200, 630, { kernel: "lanczos3", fit: "fill" })
    .sharpen({ sigma: 0.6 }); // 縮小で甘くなったエッジを軽く復元

  if (isJpeg) {
    pipeline = pipeline.jpeg({ quality: jpegQuality, mozjpeg: true });
  } else {
    pipeline = pipeline.png({ compressionLevel: 9 });
  }

  await pipeline.toFile(outputPath);
  console.log(
    `OGP captured: ${outputPath} (DSF${SCALE}→1200×630 lanczos3+sharpen${
      isJpeg ? `, jpeg q${jpegQuality}` : ", png"
    })`
  );
} finally {
  await browser.close();
}
