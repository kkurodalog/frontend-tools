// =====================================================================
// drawer — kuroda-tools SP/タブレット モバイルナビ（円形展開型 / FAB 連動）
//   本体 kurodafolio _drawer.js を移植（挙動を完全再現）。
//
//   - 第1段階: FAB（.js-hamburger）クリックで円形背景（.js-mobile-nav-bg）が
//     ボタン位置から円形に拡大（.is-expanding）
//   - 第2段階: 第1段階の途中からナビリンク（.js-mobile-nav）がスタッガードでフェードイン（.is-open）
//   - 閉じる時は 1 段階・短時間（背景縮小 .is-closing とリンク非表示を同時実行）
//   - FAB は 3 本線 → ×（.is-active / CSS 側で変形）
//   - aria-expanded / aria-hidden を連動更新
//   - Escape で閉じてフォーカスを FAB に戻す / スクロールロック / フォーカストラップ
//   - matchMedia でリサイズ時（768px 以上 = 横ナビ表示域）に状態をリセット
//
//   タイミング定数は styles/global/_variables.scss の以下トークンと一致させること:
//   - PHASE1_DURATION ← --expand-transition-bg: 0.5s（開く時 第1段階）
//   - CLOSE_DURATION  ← --expand-close-bg / --expand-close-nav: 0.22s（閉じる時 1 段階）
// =====================================================================
(function () {
  "use strict";

  var hamburger = document.querySelector(".js-hamburger");
  var nav = document.querySelector(".js-mobile-nav");
  var bg = document.querySelector(".js-mobile-nav-bg");

  if (!hamburger || !nav || !bg) return;

  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  // タイミング定数（CSS トークンと一致 / 上記コメント参照）
  var PHASE1_DURATION = 400; // 開く: 第1段階の途中で第2段階を開始するまでの待機
  var PHASE2_FOCUS_DELAY = 100; // 開く: 第2段階フェード開始後にフォーカス移動するまでの待機
  var CLOSE_DURATION = 220; // 閉じる: 1 段階・短時間（--expand-close-* と一致）

  var isAnimating = false;

  function openMenu() {
    if (isAnimating) return;
    isAnimating = true;

    hamburger.classList.add("is-active");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "メニューを閉じる");
    nav.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden"; // スクロールロック

    bg.classList.remove("is-closing");
    bg.classList.add("is-expanding"); // 第1段階: 円形背景の拡大

    setTimeout(function () {
      nav.classList.add("is-open"); // 第2段階: ナビリンクのフェードイン

      var focusable = Array.prototype.slice.call(nav.querySelectorAll(FOCUSABLE));
      if (focusable.length > 0) {
        setTimeout(function () {
          focusable[0].focus();
        }, PHASE2_FOCUS_DELAY);
      }

      isAnimating = false;
    }, PHASE1_DURATION);
  }

  function closeMenu(returnFocus) {
    if (returnFocus === undefined) returnFocus = true;
    if (isAnimating) return;
    isAnimating = true;

    nav.classList.remove("is-open");
    nav.setAttribute("aria-hidden", "true");
    bg.classList.remove("is-expanding");
    bg.classList.add("is-closing");

    hamburger.classList.remove("is-active");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "メニューを開く");

    document.body.style.overflow = ""; // スクロールロック解除

    if (returnFocus) hamburger.focus();

    setTimeout(function () {
      bg.classList.remove("is-closing");
      isAnimating = false;
    }, CLOSE_DURATION);
  }

  function toggleMenu() {
    if (hamburger.classList.contains("is-active")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  hamburger.addEventListener("click", toggleMenu);

  // Escape で閉じる / Tab でフォーカストラップ
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu(true);
      return;
    }

    if (e.key === "Tab") {
      if (!nav.classList.contains("is-open")) return;

      var navFocusable = Array.prototype.slice.call(nav.querySelectorAll(FOCUSABLE));
      var focusable = [hamburger].concat(navFocusable);
      if (focusable.length === 0) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // ナビ内リンククリックで閉じる（ページ遷移前に状態をリセット）
  nav.querySelectorAll("a[href]").forEach(function (link) {
    link.addEventListener("click", function () {
      closeMenu(false);
    });
  });

  // 768px 以上（ヘッダー横ナビ表示）になったら即座に閉じる（CSS の切替境界と一致）
  var mediaQuery = window.matchMedia("(min-width: 768px)");
  mediaQuery.addEventListener("change", function (e) {
    if (e.matches) {
      isAnimating = false;
      hamburger.classList.remove("is-active");
      bg.classList.remove("is-expanding", "is-closing");
      nav.classList.remove("is-open");

      hamburger.setAttribute("aria-expanded", "false");
      hamburger.setAttribute("aria-label", "メニューを開く");
      nav.removeAttribute("aria-hidden");

      document.body.style.overflow = "";
    } else {
      nav.setAttribute("aria-hidden", "true");
    }
  });

  // 初期化: PC で読み込んだ場合は aria-hidden を外す（nav は CSS で非表示）
  if (mediaQuery.matches) {
    nav.removeAttribute("aria-hidden");
  }
})();
