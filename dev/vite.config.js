import { defineConfig } from "vite";
import { resolve } from "path";
import { globSync } from "glob";
import fs from "fs";
import handlebars from "vite-plugin-handlebars";

// サイトのルート（src）を解決
const root = resolve(__dirname, "src");

// ツール一覧データ（ポータルトップのカード生成・各ツールの逆導線に共通で渡す）
const tools = JSON.parse(fs.readFileSync(resolve(root, "data/tools.json"), "utf8"));

// 公開済み（status: "published"）のツールだけをトップ一覧に出す
const publishedTools = tools.filter(tool => tool.status === "published");

// マルチページ入力: src 配下の html を全て拾う（components 配下と _ 始まりは除外）
const inputs = Object.fromEntries(
  globSync("src/**/*.html")
    .filter(file => {
      const normalized = file.replace(/\\/g, "/");
      const name = normalized.split("/").pop();
      return !name.startsWith("_") && !normalized.includes("/components/");
    })
    .map(file => {
      const normalized = file.replace(/\\/g, "/");
      // src からの相対パス（拡張子なし）を input 名にする
      const name = normalized.replace(/^src\//, "").replace(/\.html$/, "");
      return [name, resolve(__dirname, file)];
    }),
);

export default defineConfig({
  root,
  // 本番は kurodafolio.com/tools/ 配下に展開するため base を /tools/ に固定。
  // dev では Vite が base 配下にリダイレクトしてくれるので、そのまま検証できる。
  base: "/tools/",
  server: {
    port: 5180,
    host: true,
  },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: inputs,
    },
  },
  plugins: [
    handlebars({
      partialDirectory: resolve(root, "components"),
      // 全ページに共通で渡すデータ。ポータルトップが {{#each tools}} でカード生成する。
      context: {
        tools: publishedTools,
        site: {
          // 本体（kurodafolio.com）への逆導線で使う絶対URL
          home: "https://kurodafolio.com/",
          works: "https://kurodafolio.com/works/",
          about: "https://kurodafolio.com/about/",
          contact: "https://kurodafolio.com/contact/",
        },
      },
    }),
  ],
});
