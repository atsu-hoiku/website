$(function () {

    // ハンバーガーメニュー
    $(".menu-btn").on("click", function () {
        $(".global-nav").toggleClass("active");
    });

    $(".global-nav a").on("click", function () {
        $(".global-nav").removeClass("active");
    });

    // SNSアイコンをクリックしても何も起こさない
    $(".sns-link").on("click", function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
    });

    // ページ内リンクをなめらかに移動
    $('a[href^="#"]:not(.choicemen)').on("click", function () {
        var speed = 500;
        var href = $(this).attr("href");
        var target = $(href === "#" || href === "" ? "html" : href);
        var position = target.offset().top;

        $("html, body").animate({
            scrollTop: position
        }, speed);

        return false;
    });

    // メインビジュアルのスライダー
    let current = 0;
    const slides = $(".hero-slide");
    const slideCount = slides.length;

    setInterval(function () {
        const next = (current + 1) % slideCount;

        slides.eq(current).removeClass("is-active");
        slides.eq(next).addClass("is-active");

        current = next;
    }, 3000);


});