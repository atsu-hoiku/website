/* Healing Match JavaScript
   v1.1：標準スムーススクロール・表示アニメーション
   v2.0：5問診断・相性度・おすすめポイント
*/

$(function () {
  const $window = $(window);
  const $header = $(".site-header");
  const $globalNav = $(".global-nav");
  const $menuButton = $(".menu-button");
  const $pageTop = $(".page-top");
  const $partnerTrack = $(".partner-track");

  /* ==================================================
     1. ハンバーガーメニュー
  ================================================== */
  $menuButton.on("click", function () {
    const isOpen = $(this).toggleClass("is-open").hasClass("is-open");

    $(this).attr("aria-expanded", isOpen);
    $globalNav.stop(true, true).slideToggle(180);
  });

  /* スマートフォンでナビを押したらメニューを閉じる */
  $(".global-nav a").on("click", function () {
    if (window.matchMedia("(max-width: 760px)").matches) {
      $globalNav.stop(true, true).slideUp(160);
      $menuButton
        .removeClass("is-open")
        .attr("aria-expanded", "false");
    }
  });

  /* PC幅に戻した時にスマートフォン用のstyle属性を解除 */
  $window.on("resize", function () {
    if (window.innerWidth > 760) {
      $globalNav.removeAttr("style");
      $menuButton
        .removeClass("is-open")
        .attr("aria-expanded", "false");
    }
  });

  /* ==================================================
     2. ページ内スクロール
     CSSのscroll-behaviorとブラウザ標準機能に統一
  ================================================== */

  /* href="#"だけの仮リンクはページ上部へ飛ばさない */
  $('a[href="#"]').on("click", function (event) {
    event.preventDefault();
  });

  /* TOPボタン */
  $pageTop.on("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  /* ==================================================
     3. スクロール位置によるナビ強調とTOPボタン
  ================================================== */
  const $sections = $("main section[id]");
  let scrollTicking = false;

  function updateScrollState() {
    const scrollY = window.pageYOffset + 140;
    let currentId = "home";

    $sections.each(function () {
      if ($(this).offset().top <= scrollY) {
        currentId = $(this).attr("id");
      }
    });

    $(".global-nav a").removeClass("is-active");
    $('.global-nav a[href="#' + currentId + '"]').addClass("is-active");

    $pageTop.toggleClass("is-visible", scrollY > 700);
    scrollTicking = false;
  }

  $window.on("scroll", function () {
    if (!scrollTicking) {
      requestAnimationFrame(updateScrollState);
      scrollTicking = true;
    }
  });

  updateScrollState();

  /* ==================================================
     4. v1.1：スクロール表示アニメーション
  ================================================== */
  const revealSelectors = [
    ".intro-photo-inner",
    ".feature-card",
    ".partner-card",
    ".step-card",
    ".voice-card",
    ".faq-item",
    ".partners-cta-inner",
    ".contact-form"
  ].join(",");

  const $revealItems = $(revealSelectors).addClass("reveal-item");

  /* 同じ並びのカードは少しずつ遅れて表示 */
  $(".feature-card, .step-card, .voice-card").each(function (index) {
    $(this).addClass("reveal-delay-" + ((index % 3) + 1));
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });

    $revealItems.each(function () {
      revealObserver.observe(this);
    });
  } else {
    $revealItems.addClass("is-revealed");
  }

  /* ==================================================
     5. パートナーカルーセル・もっと見る
  ================================================== */
  $(".carousel-arrow.next").on("click", function () {
    const amount = $(".partner-card").first().outerWidth(true);

    $partnerTrack.stop(true).animate({
      scrollLeft: $partnerTrack.scrollLeft() + amount
    }, 260);
  });

  $(".carousel-arrow.prev").on("click", function () {
    const amount = $(".partner-card").first().outerWidth(true);

    $partnerTrack.stop(true).animate({
      scrollLeft: $partnerTrack.scrollLeft() - amount
    }, 260);
  });

  $(".partner-more").on("click", function () {
    const $button = $(this);
    const isExpanded = $partnerTrack
      .toggleClass("is-expanded")
      .hasClass("is-expanded");

    $button
      .text(isExpanded ? "閉じる" : "もっと見る")
      .attr("aria-expanded", isExpanded);
  });

  /* ==================================================
     6. パートナー詳細モーダル
  ================================================== */
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
    $(".partner-modal-close").trigger("focus");
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

  /* ==================================================
     7. v2.0：5問の癒しパートナー診断
  ================================================== */
  const totalQuestions = 5;
  let scores = {
    animal: 0,
    plush: 0,
    robot: 0
  };
  let currentStep = 1;

  const resultData = {
    animal: {
      image: "images/partner-dog.jpeg",
      alt: "犬の癒しパートナー",
      type: "元気なアニマルタイプ",
      name: "わん太",
      text: "一緒に動いたり笑ったりできる、明るいパートナーとの相性がよさそうです。疲れた日も、前向きなエネルギーを届けてくれます。",
      tags: ["元気", "ぬくもり", "アクティブ"]
    },
    plush: {
      image: "images/partner-bear.jpeg",
      alt: "クマのぬいぐるみの癒しパートナー",
      type: "安心ぬいぐるみタイプ",
      name: "くまのモコ",
      text: "静かに寄り添ってくれる存在との相性がよさそうです。何も話さなくても、ほっと安心できる時間を作ってくれます。",
      tags: ["安心感", "見守り", "リラックス"]
    },
    robot: {
      image: "images/feature-ai-robot.jpeg",
      alt: "会話や見守りをしてくれるロボット",
      type: "おしゃべりロボットタイプ",
      name: "きょうちゃん",
      text: "言葉や反応で気持ちを支えてくれるパートナーとの相性がよさそうです。会話を通して、毎日の小さな変化にも寄り添ってくれます。",
      tags: ["会話", "励まし", "好奇心"]
    }
  };

  function updateDiagnosisProgress(step) {
    const percent = Math.round((step / totalQuestions) * 100);

    $(".diagnosis-progress-label")
      .text("QUESTION " + step + " / " + totalQuestions);

    $(".diagnosis-progress-percent")
      .text(percent + "%");

    $(".diagnosis-progress-bar span")
      .css("width", percent + "%");
  }

  function resetDiagnosis() {
    scores = {
      animal: 0,
      plush: 0,
      robot: 0
    };

    currentStep = 1;

    $(".diagnosis-result").hide();
    $(".question").hide();
    $('.question[data-step="1"]').show();
    updateDiagnosisProgress(1);
  }

  $(".diagnosis-start").on("click", function () {
    resetDiagnosis();

    $(".diagnosis-panel")
      .stop(true, true)
      .slideDown(220, function () {
        this.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
  });

  $(".answer-grid button").on("click", function () {
    const type = $(this).data("type");
    scores[type] += 1;

    if (currentStep < totalQuestions) {
      $('.question[data-step="' + currentStep + '"]')
        .fadeOut(120, function () {
          currentStep += 1;
          updateDiagnosisProgress(currentStep);

          $('.question[data-step="' + currentStep + '"]')
            .fadeIn(160);
        });
    } else {
      $(".question").fadeOut(120, showDiagnosisResult);
    }
  });

  function showDiagnosisResult() {
    const resultType = Object.keys(scores).reduce(function (bestType, type) {
      return scores[type] > scores[bestType] ? type : bestType;
    }, "animal");

    const bestScore = scores[resultType];
    const compatibility = Math.min(98, 73 + (bestScore * 5));
    const data = resultData[resultType];

    $(".result-image img")
      .attr("src", data.image)
      .attr("alt", data.alt);

    $(".result-type").text(data.type);
    $(".diagnosis-result h3").text(data.name);
    $(".result-text").text(data.text);
    $(".compatibility-score").text(compatibility);

    $(".result-tags").empty();
    data.tags.forEach(function (tag) {
      $("<li>").text(tag).appendTo(".result-tags");
    });

    $(".diagnosis-progress-label").text("RESULT");
    $(".diagnosis-progress-percent").text("100%");
    $(".diagnosis-progress-bar span").css("width", "100%");

    $(".diagnosis-result").fadeIn(220, function () {
      $(".compatibility-bar span")
        .css("width", compatibility + "%");
    });
  }

  $(".diagnosis-reset").on("click", function () {
    resetDiagnosis();

    $(".compatibility-bar span").css("width", "0");

    $(".diagnosis-panel")[0].scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  /* ==================================================
     8. 利用者の声
  ================================================== */
  $(".slider-dots button").on("click", function () {
    const index = $(this).index();

    $(".slider-dots button")
      .removeClass("is-active")
      .eq(index)
      .addClass("is-active");

    $(".voice-card")
      .removeClass("is-current")
      .eq(index)
      .addClass("is-current");
  });

  /* ==================================================
     9. FAQアコーディオン
  ================================================== */
  $(".faq-question").on("click", function () {
    const $button = $(this);
    const $answer = $button.next(".faq-answer");
    const isOpen = $button.attr("aria-expanded") === "true";

    $(".faq-question")
      .not($button)
      .attr("aria-expanded", "false");

    $(".faq-answer")
      .not($answer)
      .stop(true, true)
      .slideUp(160);

    $button.attr("aria-expanded", !isOpen);
    $answer.stop(true, true).slideToggle(160, updateFaqAllButton);
  });

  function updateFaqAllButton() {
    const allOpen =
      $(".faq-question").length ===
      $('.faq-question[aria-expanded="true"]').length;

    $(".faq-more")
      .text(allOpen ? "すべて閉じる" : "すべて開く")
      .attr("aria-expanded", allOpen);
  }

  $(".faq-more").on("click", function () {
    const isExpanded = $(this).attr("aria-expanded") === "true";

    if (isExpanded) {
      $(".faq-question").attr("aria-expanded", "false");
      $(".faq-answer").stop(true, true).slideUp(160);
    } else {
      $(".faq-question").attr("aria-expanded", "true");
      $(".faq-answer").stop(true, true).slideDown(160);
    }

    updateFaqAllButton();
  });

  /* ==================================================
     10. お問い合わせフォーム
  ================================================== */
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
    $(".form-message").text("").css("color", "");
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
      $form.find(".is-error").first().trigger("focus");
      return;
    }

    $(".form-message")
      .css("color", "#169d86")
      .text("お問い合わせを受け付けました（デモ表示）。");

    this.reset();
  });
});
