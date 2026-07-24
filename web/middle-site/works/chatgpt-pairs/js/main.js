$(function () {
    $('.menu-button').on('click', function () {
        $(this).toggleClass('open'); $('.mobile-nav').toggleClass('open');
        $(this).attr('aria-expanded', $(this).hasClass('open'));
    });
    $('.mobile-nav a').on('click', function () { $('.menu-button,.mobile-nav').removeClass('open') });
    $('.accordion button').on('click', function () {
        const item = $(this).closest('article');
        item.toggleClass('open').find('.answer').stop().slideToggle(250);
    });
    const reveal = () => $('.reveal').each(function () { if ($(this).offset().top < $(window).scrollTop() + $(window).height() - 80) $(this).addClass('visible') });
    reveal(); $(window).on('scroll', reveal);
    let counted = false;
    $(window).on('scroll', function () {
        if (!counted && $('.numbers').length && $(window).scrollTop() + $(window).height() > $('.numbers').offset().top) {
            counted = true; $('.count').each(function () { const el = $(this), goal = +el.data('count'); $({ n: 0 }).animate({ n: goal }, { duration: 1200, step: function () { el.text(Math.floor(this.n)) }, complete: function () { el.text(goal) } }) });
        }
    }).trigger('scroll');
    let index = 0;
    function slide(dir) {
        const track = $('.slider-track'), cards = track.children(), visible = window.innerWidth <= 600 ? 1 : (window.innerWidth <= 900 ? 2 : 3), max = Math.max(0, cards.length - visible);
        index = Math.max(0, Math.min(max, index + dir));
        const cardWidth = cards.first().outerWidth() + 24; track.css('transform', `translateX(${-index * cardWidth}px)`);
    }
    $('.slider-arrow.next').on('click', () => slide(1)); $('.slider-arrow.prev').on('click', () => slide(-1)); $(window).on('resize', () => { index = 0; slide(0) });
});
