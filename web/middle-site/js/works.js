document.addEventListener("DOMContentLoaded", function () {
    const tabButtons = document.querySelectorAll("[data-game-tab]");
    const panels = document.querySelectorAll("[data-game-panel]");

    tabButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const targetId = button.dataset.gameTab;
            tabButtons.forEach(function (item) {
                const active = item === button;
                item.classList.toggle("is-active", active);
                item.setAttribute("aria-selected", String(active));
            });
            panels.forEach(function (panel) {
                panel.hidden = panel.id !== targetId;
            });
        });
    });
});
