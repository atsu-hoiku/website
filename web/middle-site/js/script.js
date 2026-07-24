'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // ================================================================
    // スマートフォン用ハンバーガーメニュー
    // ================================================================
    const menuButton = document.querySelector('.menu-toggle');
    const globalNav = document.querySelector('.global-nav');

    if (menuButton && globalNav) {
        const closeMenu = () => {
            menuButton.classList.remove('is-open');
            globalNav.classList.remove('is-open');
            menuButton.setAttribute('aria-expanded', 'false');
            menuButton.setAttribute('aria-label', 'メニューを開く');
        };

        menuButton.addEventListener('click', () => {
            const willOpen = !globalNav.classList.contains('is-open');
            menuButton.classList.toggle('is-open', willOpen);
            globalNav.classList.toggle('is-open', willOpen);
            menuButton.setAttribute('aria-expanded', String(willOpen));
            menuButton.setAttribute('aria-label', willOpen ? 'メニューを閉じる' : 'メニューを開く');
        });

        globalNav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 600) closeMenu();
        });
    }


    // ================================================================
    // メインビジュアル：プラグインを使わないフェードスライダー
    // ================================================================
    const slider = document.querySelector('.slider');

    if (slider) {
        const slides = Array.from(slider.children);
        let currentIndex = 0;

        slides.forEach((slide, index) => {
            slide.classList.add('main-slide');
            slide.classList.toggle('is-active', index === 0);
            slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
        });

        if (slides.length > 1) {
            window.setInterval(() => {
                slides[currentIndex].classList.remove('is-active');
                slides[currentIndex].setAttribute('aria-hidden', 'true');

                currentIndex = (currentIndex + 1) % slides.length;

                slides[currentIndex].classList.add('is-active');
                slides[currentIndex].setAttribute('aria-hidden', 'false');
            }, 4000);
        }
    }

    // ================================================================
    // 特徴カード：画面に入るたびに少し上へ浮き上がる
    // ================================================================
    const fadeTargets = document.querySelectorAll('.fadeUp-trigger');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fadeUpActive');
                } else {
                    // 再び画面に入ったときにもアニメーションさせる
                    entry.target.classList.remove('fadeUpActive');
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -60px 0px'
        });

        fadeTargets.forEach((target) => observer.observe(target));
    } else {
        // 古いブラウザでは常に表示
        fadeTargets.forEach((target) => target.classList.add('fadeUpActive'));
    }

    // ================================================================
    // フォトギャラリー：5枚を途切れず横へ流す
    // ================================================================
    const photoTrack = document.querySelector('.photo-track');

    if (photoTrack && !photoTrack.dataset.cloned) {
        const originalItems = Array.from(photoTrack.children);
        originalItems.forEach((item) => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            photoTrack.appendChild(clone);
        });
        photoTrack.dataset.cloned = 'true';
    }
});
