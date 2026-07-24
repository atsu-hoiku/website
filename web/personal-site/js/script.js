/* Healing Match JavaScript
   機能ごとにコメントで分けています。 */

$(function () {
  // ハンバーガーメニュー
  $(".menu-button").on("click", function () {
    const isOpen = $(this).toggleClass("is-open").hasClass("is-open");
    $(this).attr("aria-expanded", isOpen);
    $(".global-nav").stop(true, true).slideToggle(220);
  });

  // スマホメニューから移動したら閉じる
  $(".global-nav a").on("click", function () {
    if (window.matchMedia("(max-width: 760px)").matches) {
      $(".global-nav").slideUp(180);
      $(".menu-button").removeClass("is-open").attr("aria-expanded", "false");
    }
  });

  // 画面幅変更時のナビゲーション調整
  $(window).on("resize", function () {
    if (window.innerWidth > 760) {
      $(".global-nav").removeAttr("style");
      $(".menu-button").removeClass("is-open").attr("aria-expanded", "false");
    }
  });

  /* ==================================================
     なめらかなスクロール
     requestAnimationFrameでカクつきを抑える
  ================================================== */
  let scrollAnimationId = null;

  function smoothScrollTo(targetY, duration = 520) {
    if (scrollAnimationId) cancelAnimationFrame(scrollAnimationId);

    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();

    function easeInOutCubic(progress) {
      return progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    }

    function animate(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));

      if (progress < 1) {
        scrollAnimationId = requestAnimationFrame(animate);
      } else {
        scrollAnimationId = null;
      }
    }

    scrollAnimationId = requestAnimationFrame(animate);
  }

  $('a[href^="#"]').on("click", function (event) {
    const href = $(this).attr("href");
    if (!href || href === "#") { event.preventDefault(); return; }

    const $target = $(href);
    if ($target.length) {
      event.preventDefault();
      const headerHeight = $(".site-header").outerHeight() || 0;
      smoothScrollTo(Math.max(0, $target.offset().top - headerHeight - 8));
    }
  });

  // 現在位置に応じてナビを強調
  const $sections = $("main section[id]");
  $(window).on("scroll", function () {
    const scrollY = $(this).scrollTop() + 140;
    let currentId = "home";

    $sections.each(function () {
      if ($(this).offset().top <= scrollY) {
        currentId = $(this).attr("id");
      }
    });

    $(".global-nav a").removeClass("is-active");
    $('.global-nav a[href="#' + currentId + '"]').addClass("is-active");

    $(".page-top").toggleClass("is-visible", scrollY > 700);
  });

  /* ページトップボタン */
  $(".page-top").on("click", function () {
    smoothScrollTo(0);
  });

  // パートナーカルーセル
  const $track = $(".partner-track");

  $(".carousel-arrow.next").on("click", function () {
    const amount = $(".partner-card").first().outerWidth(true);
    $track.animate({ scrollLeft: $track.scrollLeft() + amount }, 300);
  });

  $(".carousel-arrow.prev").on("click", function () {
    const amount = $(".partner-card").first().outerWidth(true);
    $track.animate({ scrollLeft: $track.scrollLeft() - amount }, 300);
  });

  $(".partner-more").on("click", function () {
    const $button = $(this);
    const isExpanded = $(".partner-track").toggleClass("is-expanded")
      .hasClass("is-expanded");

    $button.text(isExpanded ? "閉じる" : "もっと見る");

    const targetY = $("#partners").offset().top - ($(".site-header").outerHeight() || 0) - 18;
    smoothScrollTo(Math.max(0, targetY), 420);
  });

  // パートナー詳細モーダル
  $(".partner-detail-button").on("click", function () {
    const $card = $(this).closest(".partner-card");

    $(".partner-modal-image")
      .attr("src", $card.data("image"))
      .attr("alt", $card.data("name"));

    $(".partner-modal-type").text($card.data("type"));
    $("#partner-modal-title").text($card.data("name"));
    $(".partner-modal-description").text($card.data("description"));
    $(".partner-modal-best p").text($card.data("best"));

    $(".partner-modal")
      .addClass("is-open")
      .attr("aria-hidden", "false");

    $("body").addClass("modal-open");
  });

  function closePartnerModal() {
    $(".partner-modal")
      .removeClass("is-open")
      .attr("aria-hidden", "true");

    $("body").removeClass("modal-open");
  }

  $(".partner-modal-close, .partner-modal-overlay")
    .on("click", closePartnerModal);

  $(document).on("keydown", function (event) {
    if (event.key === "Escape") {
      closePartnerModal();
    }
  });

  // 診断
  let scores = { animal: 0, plush: 0, robot: 0 };
  let currentStep = 1;

  $(".diagnosis-start").on("click", function () {
    scores = { animal: 0, plush: 0, robot: 0 };
    currentStep = 1;
    $(".diagnosis-result").hide();
    $(".question").hide();
    $('.question[data-step="1"]').show();
    $(".diagnosis-panel").stop(true, true).slideDown(240, function () {
      const targetY = $(".diagnosis-panel").offset().top - ($(".site-header").outerHeight() || 0) - 20;
      smoothScrollTo(Math.max(0, targetY), 420);
    });
  });

  $(".answer-grid button").on("click", function () {
    const type = $(this).data("type");
    scores[type] += 1;

    if (currentStep < 3) {
      $('.question[data-step="' + currentStep + '"]').fadeOut(150, function () {
        currentStep += 1;
        $('.question[data-step="' + currentStep + '"]').fadeIn(180);
      });
    } else {
      $(".question").fadeOut(150, showResult);
    }
  });

  function showResult() {
    const resultType = Object.keys(scores).reduce(function (a, b) {
      return scores[a] >= scores[b] ? a : b;
    });

    const resultData = {
      animal: {
        image: "images/partner-dog.jpeg",
        alt: "犬の癒しパートナー",
        title: "元気なアニマルタイプ",
        text: "明るく元気なパートナーが、毎日に笑顔を届けてくれそうです。"
      },

      plush: {
        image: "images/partner-bear.jpeg",
        alt: "クマのぬいぐるみの癒しパートナー",
        title: "安心ぬいぐるみタイプ",
        text: "静かに寄り添ってくれる存在が、安心できる時間を作ってくれそうです。"
      },

      robot: {
        image: "images/feature-ai-robot.jpeg",
        alt: "会話や見守りをしてくれるロボット",
        title: "おしゃべりロボットタイプ",
        text: "話を聞いてくれる相棒が、あなたの毎日を優しく支えてくれそうです。"
      }
    };

    const data = resultData[resultType];
    $(".result-image img")
      .attr("src", data.image)
      .attr("alt", data.alt);

    $(".diagnosis-result h3").text(data.title);
    $(".result-text").text(data.text);
    $(".diagnosis-result").fadeIn(250);
  }

  $(".diagnosis-reset").on("click", function () {
    $(".diagnosis-start").trigger("click");
  });

  // 利用者の声
  $(".slider-dots button").on("click", function () {
    const index = $(this).index();
    $(".slider-dots button").removeClass("is-active").eq(index).addClass("is-active");
    $(".voice-card").removeClass("is-current").eq(index).addClass("is-current");
  });

  // FAQアコーディオン
  $(".faq-question").on("click", function () {
    const $button = $(this);
    const $answer = $button.next(".faq-answer");
    const isOpen = $button.attr("aria-expanded") === "true";

    $(".faq-question").not($button).attr("aria-expanded", "false");
    $(".faq-answer").not($answer).slideUp(180);

    $button.attr("aria-expanded", !isOpen);
    $answer.stop(true, true).slideToggle(180);
  });

  $(".faq-more").on("click", function () {
    $(".faq-question").attr("aria-expanded", "true");
    $(".faq-answer").slideDown(180);
    $(this).hide();
  });

  // お問い合わせフォーム（デモ）
  $(".contact-form").on("submit", function (event) {
    event.preventDefault();

    const $form = $(this);
    const $name = $form.find('[name="name"]');
    const $email = $form.find('[name="email"]');
    const $message = $form.find('[name="message"]');

    const name = $.trim($name.val());
    const email = $.trim($email.val());
    const message = $.trim($message.val());

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let hasError = false;

    $(".field-error").text("");
    $(".form-message").text("");
    $form.find("input, textarea").removeClass("is-error");

    if (!name) {
      $(".name-error").text("お名前を入力してください。");
      $name.addClass("is-error");
      hasError = true;
    }

    if (!email) {
      $(".email-error").text("メールアドレスを入力してください。");
      $email.addClass("is-error");
      hasError = true;
    } else if (!email.includes("@")) {
      $(".email-error").text("メールアドレスには「@」が必要です。");
      $email.addClass("is-error");
      hasError = true;
    } else if (!emailPattern.test(email)) {
      $(".email-error").text("正しいメールアドレスの形式で入力してください。");
      $email.addClass("is-error");
      hasError = true;
    }

    if (!message) {
      $(".message-error").text("お問い合わせ内容を入力してください。");
      $message.addClass("is-error");
      hasError = true;
    } else if (message.length < 10) {
      $(".message-error").text("お問い合わせ内容は10文字以上で入力してください。");
      $message.addClass("is-error");
      hasError = true;
    }

    if (hasError) {
      $form.find(".is-error").first().focus();
      return;
    }

    $(".form-message")
      .css("color", "#169d86")
      .text("お問い合わせを受け付けました（デモ表示）。");

    this.reset();
  });
});
