// =====================================================================
// ダーク/ライト切替トグル（本体 c-color-toggle と同等の挙動）
//   - data-color-scheme を <html> に付与してテーマ切替
//   - localStorage に保存し再訪時に復元
//   - 未保存時は OS の prefers-color-scheme に追従（CSS 側で対応済み）
//   - トグルの ON/OFF は aria-pressed で表現し、CSS は [aria-pressed="true"] を参照
// =====================================================================
(function () {
  var STORAGE_KEY = "frontend-tools-color-scheme";
  var root = document.documentElement;

  // 初期化: 保存値があれば適用（未保存なら CSS の prefers 追従に任せる）
  var saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    // localStorage 不可環境（プライベートブラウズ等）は無視
  }
  if (saved === "dark" || saved === "light") {
    root.setAttribute("data-color-scheme", saved);
  }

  function currentIsDark() {
    var attr = root.getAttribute("data-color-scheme");
    if (attr === "dark") return true;
    if (attr === "light") return false;
    // 未指定時は OS 設定を見る
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function syncButtons() {
    var isDark = currentIsDark();
    document.querySelectorAll(".js-color-toggle").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(isDark));
      btn.setAttribute("aria-label", isDark ? "ライトモードに切り替える" : "ダークモードに切り替える");
    });
  }

  function toggle() {
    var next = currentIsDark() ? "light" : "dark";
    root.setAttribute("data-color-scheme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // 保存不可でも切替自体は機能させる
    }
    syncButtons();
  }

  document.querySelectorAll(".js-color-toggle").forEach(function (btn) {
    btn.addEventListener("click", toggle);
  });

  syncButtons();
})();
