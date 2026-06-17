import { defineConfig } from "vite";
import { resolve, relative, extname, basename } from "path";
import { globSync } from "glob";
import fs from "fs";
import autoprefixer from "autoprefixer";
import handlebars from "vite-plugin-handlebars";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import convertImages from "./bin/vite-plugin-convert-images.js";
import sassGlobImports from "vite-plugin-sass-glob-import";

// サイトのルート（src）を解決
const root = resolve(__dirname, "src");

// 環境変数取得（dev のとき画像を webp に変換）
const isDev = process.env.NODE_ENV === "development";

// ツール一覧データ（ポータルトップのカード生成・各ツールの逆導線に共通で渡す）
const tools = JSON.parse(fs.readFileSync(resolve(root, "data/tools.json"), "utf8"));
const publishedTools = tools.filter(tool => tool.status === "published");

// ページごとの meta（title / description / ogImage）
const metaData = JSON.parse(fs.readFileSync(resolve(root, "data/meta.json"), "utf8"));

// 本体（kurodafolio.com）への逆導線で使う絶対 URL ＋ ツール内カテゴリ導線（将来復帰用に温存）
const site = {
  home: "https://kurodafolio.com/",
  works: "https://kurodafolio.com/works/",
  skills: "https://kurodafolio.com/skills/",
  about: "https://kurodafolio.com/about/",
  contact: "https://kurodafolio.com/contact/",
  // ツール内カテゴリページの遷移先 URL（将来復帰用に保持 / 現状は参照箇所なし）。
  // 黒田さん確定（2026-06-17）: 複数カテゴリ化までカテゴリ導線（ヘッダー「カテゴリ」/
  //   フッターG1「このツール集について」）は出さないため header/footer の参照はコメントアウト済み。
  // URL 階層の申し送り: カテゴリ複数化時は親 /tools/category/（一覧）+ 子 /tools/category/image/
  //   （画像カテゴリ）の 2 階層で実装する。slug は tools.json の categorySlug（"画像"=image）に対応。
  toolsCategoryImage: "/tools/category/image/",
};

// 静的開発用の input。CSS は style.scss を直接エントリーにし（HTML <head> から <link> で読む＝
// FOUC 回避のためクリティカルパスに乗せる）、各 HTML は components 配下・_ 始まりを除外して拾う。
const inputsForStatic = {
  style: resolve(root, "assets", "styles", "style.scss"),
  ...Object.fromEntries(
    globSync("src/**/*.html")
      .filter(file => {
        const normalizedPath = file.replace(/\\/g, "/");
        const fileName = basename(normalizedPath);
        const isPrivateFile = fileName.startsWith("_");
        const isComponent = normalizedPath.includes("src/components/");
        return !isPrivateFile && !isComponent;
      })
      .map(file => [relative("src", file.slice(0, file.length - extname(file).length)), resolve(__dirname, file)]),
  ),
};

export default defineConfig(() => ({
  root,
  // 本番は kurodafolio.com/tools/ 配下に展開するため base を /tools/ に固定。
  // CSS/JS の参照は HTML にハードコードせず Vite のアセット解決に委ねる（/tools/tools/ 二重 base の根絶）。
  base: "/tools/",
  server: {
    port: 5180,
    host: true,
    hmr: true,
  },
  css: {
    devSourcemap: true,
  },
  build: {
    minify: false,
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    assetsInlineLimit: (filePath, content) => {
      if (filePath.endsWith(".svg")) {
        return 0;
      }
      return 4096;
    },
    rollupOptions: {
      input: inputsForStatic,
      output: {
        entryFileNames: "assets/js/[name].[hash].js",
        chunkFileNames: "assets/js/[name].[hash].js",
        assetFileNames: assetsInfo => {
          if (assetsInfo.name.endsWith(".css")) {
            return "assets/style/[name].[hash].[ext]";
          }
          return "assets/images/[name].[hash].[ext]";
        },
      },
    },
    css: {
      postcss: {
        plugins: [autoprefixer()],
      },
    },
  },
  plugins: [
    // Sass でワイルドカード（@use "components/**"）を使えるようにする
    sassGlobImports(),

    // 画像最適化
    ViteImageOptimizer({
      include: "**/*.{png,jpg,jpeg,webp,avif}",
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 80 },
    }),
    // 開発環境では png/jpg を webp に変換
    isDev ? convertImages({ format: "webp" }) : null,

    // コンポーネント（partial）を読み込み、ページ meta ＋ 全ページ共通データ（tools / site）を注入
    handlebars({
      partialDirectory: resolve(root, "components"),
      context: pagePath => {
        const pageMeta = metaData[pagePath] || metaData["default"];
        return {
          page: pageMeta,
          // ポータルトップが {{#each tools}} でカード生成する
          tools: publishedTools,
          site,
        };
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src/assets/styles"),
      "@js": resolve(__dirname, "src/assets/js"),
    },
  },
}));
