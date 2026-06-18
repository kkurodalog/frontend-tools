// =====================================================================
// 画像仕分け圧縮くん — ページ専用エントリー
//   このファイルは image-compress ページの HTML からのみ <script type="module"> で読む
//   （共通の script.js には載せない＝他ページに WASM 関連バンドルを持ち込まない）。
//   実体は image-compress/main.js（機能本体）に委譲する。
// =====================================================================
import { initImageCompress } from "./image-compress/main.js";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initImageCompress);
} else {
  initImageCompress();
}
