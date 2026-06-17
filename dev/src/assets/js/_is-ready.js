// =====================================================================
// is-ready — 初回描画完了後に html.is-ready を付与する
//   transition 付き UI（c-mobile-nav / c-hamburger-fab / c-color-toggle 等）の
//   FOUC（初回読み込み時にアニメが暴発する現象）を防ぐ。
//   本体 kurodafolio _is-ready.js と同方式。
// =====================================================================
(function () {
  function enableDocumentTransitions() {
    document.documentElement.classList.add("is-ready");
  }

  function scheduleIsReady() {
    requestAnimationFrame(function () {
      requestAnimationFrame(enableDocumentTransitions);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleIsReady);
  } else {
    scheduleIsReady();
  }
})();
