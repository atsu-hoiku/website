$(function () {
    // ==========================================
    // 1. よくある質問（FAQ）のアコーディオン
    // ==========================================
    $(".faq__question").on("click", function () {
        const $item = $(this).closest(".faq__item");
        const $answer = $(this).next(".faq__answer");

        if ($item.hasClass("is-active")) {
            // 閉じる
            $item.removeClass("is-active");
            $answer.css("max-height", 0);
        } else {
            // 開く
            $item.addClass("is-active");
            // スクロール可能な高さを取得して適用する（CSSのtransitionを効かせるため）
            $answer.css("max-height", $answer[0].scrollHeight + "px");
        }
    });

    // ==========================================
    // 2. スクロールアニメーション (ふわっと表示)
    // ==========================================
    const $fadeElements = $(".fade-in");

    function checkScroll() {
        const triggerPoint = $(window).scrollTop() + $(window).height() - 100;

        $fadeElements.each(function () {
            const elemTop = $(this).offset().top;
            if (elemTop < triggerPoint) {
                $(this).addClass("is-visible");
            }
        });
    }

    // 初期表示とスクロール時に実行
    $(window).on("scroll load", checkScroll);
});