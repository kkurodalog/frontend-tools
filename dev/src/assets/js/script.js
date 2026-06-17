// =====================================================================
// kuroda-tools — 全ページ共通の JS エントリー（テンプレ static-template の script.js 方式）
//   役割: 各機能モジュールを import するだけ。
//   ★CSS は本ファイルから import しない。head.html が <link href="style.scss"> で
//     クリティカルパスに乗せて読む（JS 遅延 import による FOUC を根絶）。
//   ★base(/tools/) は Vite が <head> の <link>/<script> を 1 度だけ解決する
//     （HTML に絶対パスをハードコードしない＝/tools/tools/ 二重 base の根絶）。
// =====================================================================
import "./_viewport.js"; // 360px 以下の viewport 固定（テンプレ作法）
import "./_is-ready.js"; // FOUC ゲート（html.is-ready 付与）— transition 系 UI より先に
import "./_theme-toggle.js"; // ダーク/ライト切替トグル（aria-pressed 駆動・localStorage 永続）
import "./_drawer.js"; // モバイルナビ（円形展開型ハンバーガー / 768px 未満）
