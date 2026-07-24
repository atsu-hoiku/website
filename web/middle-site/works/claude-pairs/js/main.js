$(function () {
  "use strict";

  /* ---- モバイルナビ開閉 ---- */
  $(".nav-toggle").on("click", function () {
    $(this).toggleClass("is-open");
    $(".gnav").toggleClass("is-open");
  });
  $(".gnav a").on("click", function () {
    $(".gnav").removeClass("is-open");
    $(".nav-toggle").removeClass("is-open");
  });

  /* ---- スクロール出現演出 ---- */
  var $reveals = $(".reveal");
  function checkReveal() {
    var winBottom = $(window).scrollTop() + $(window).height() - 80;
    $reveals.each(function () {
      var $el = $(this);
      if ($el.hasClass("is-visible")) return;
      if ($el.offset().top < winBottom) {
        $el.addClass("is-visible");
      }
    });
  }
  checkReveal();
  $(window).on("scroll", checkReveal);

  /* ---- FAQアコーディオン ---- */
  $(".faq-q").on("click", function () {
    var $item = $(this).closest(".faq-item");
    var $answer = $item.find(".faq-a");

    if ($item.hasClass("is-open")) {
      $item.removeClass("is-open");
      $answer.css("max-height", 0);
    } else {
      // 同時に一つだけ開く場合はここで他を閉じる（全開放が良ければコメントアウト）
      $item.addClass("is-open");
      $answer.css("max-height", $answer.find(".faq-a-inner").outerHeight() + "px");
    }
  });

  /* ---- ヘッダーの現在地ハイライト ---- */
  var path = window.location.pathname.split("/").pop() || "index.html";
  $(".gnav a").each(function () {
    var href = $(this).attr("href");
    if (href === path) $(this).addClass("is-current");
  });
});
