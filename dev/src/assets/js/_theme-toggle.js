// =====================================================================
// ダーク/ライト切替トグル（本体 c-color-toggle と同等の挙動）
//   - data-color-scheme を <html> に付与してテーマ切替
//   - localStorage に保存し再訪時に復元
//   - 未保存時は OS の prefers-color-scheme に追従（CSS 側で対応済み）
//   - トグルの ON/OFF は aria-pressed で表現し、CSS は [aria-pressed="true"] を参照
//   - キーは本体 kurodafolio と共有（同一オリジン localStorage 連動）。本体↔/tools/ 間の
//     遷移でテーマが揃い、同時表示の別タブは storage イベントで即追従する。
// =====================================================================
(function () {
  // 本体 kurodafolio と同一キー（同一オリジン localStorage 共有のため）。本体 _color-scheme.js
  // の STORAGE_KEY と一致させることで、本体で切替→ツールへ遷移時もテーマが引き継がれる。
  var STORAGE_KEY = "kurodafolio-color-scheme";
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

  // 別タブ/同時表示でのリアルタイム連動。
  // storage イベントは「変更した本人以外の同一オリジン文書」で発火する（同一タブでは発火しない）。
  // ＝同時に開いた本体タブ（kurodafolio.com）で切替→このツールタブ（/tools/）が即追従する用途に合致。
  window.addEventListener("storage", function (e) {
    if (e.key !== STORAGE_KEY) return;
    if (e.newValue === "dark" || e.newValue === "light") {
      // 明示値あり: そのまま <html> に適用
      root.setAttribute("data-color-scheme", e.newValue);
    } else {
      // キー削除・異常値（null 等）: 属性を外して OS の prefers-color-scheme 追従へフォールバック
      // （currentIsDark() が data-color-scheme 未指定時に matchMedia を見る既存判定を再利用）
      root.removeAttribute("data-color-scheme");
    }
    // トグルの aria 状態（aria-pressed / aria-label）も既存の更新関数で同期
    syncButtons();
  });

  syncButtons();
})();
