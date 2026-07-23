// Small visual helpers kept separate from business logic for classroom reading.
(function () {
    function canUseGsap() {
        return Boolean(window.gsap) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function runEntrance() {
        if (!canUseGsap()) return;
        window.gsap.from(['.wordmark', '.nav-link', '.active-page .page-stagger', '.active-page .paper-photo'], {
            y: 10,
            duration: 0.42,
            ease: 'power2.out',
            stagger: 0.035,
            clearProps: 'transform'
        });
    }

    function runSaveFeedback(element) {
        if (!element) return;
        element.classList.remove('status-pop');
        void element.offsetWidth;
        element.classList.add('status-pop');
        if (canUseGsap()) {
            window.gsap.fromTo(element, { scale: 0.99 }, { scale: 1, duration: 0.2, ease: 'power1.out' });
        }
    }

    function bindShortcutHover() {
        if (!canUseGsap()) return;
        document.querySelectorAll('.shortcut, .study-link').forEach(card => {
            card.addEventListener('mouseenter', () => {
                window.gsap.to(card, { scale: 1.008, y: -2, duration: 0.14, ease: 'power1.out' });
            });
            card.addEventListener('mouseleave', () => {
                window.gsap.to(card, { scale: 1, y: 0, duration: 0.16, ease: 'power1.out' });
            });
        });
    }

    window.CampusFlowEffects = {
        runEntrance,
        runSaveFeedback,
        bindShortcutHover
    };
})();
