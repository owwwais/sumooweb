document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    /* ---- Navbar background on scroll ---- */
    const onScroll = () => {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---- Mobile menu ---- */
    if (navToggle && navLinks) {
        const toggleMenu = (open) => {
            navLinks.classList.toggle('open', open);
            navToggle.innerHTML = open
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';
        };
        navToggle.addEventListener('click', () => {
            toggleMenu(!navLinks.classList.contains('open'));
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });
    }

    /* ---- Scroll reveal ---- */
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        revealEls.forEach(el => observer.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('visible'));
    }

    /* ==========================================================
       Interactive mouse effects (pointer-fine devices only)
       ========================================================== */
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (finePointer) {
        /* --- Hero: cursor spotlight + parallax depth --- */
        const hero = document.querySelector('.hero');
        if (hero) {
            const shotMain = hero.querySelector('.shot-main');
            const shotBack = hero.querySelector('.shot-back');
            const orbs = hero.querySelectorAll('.orb');
            let frame = null;

            hero.addEventListener('mousemove', (e) => {
                const r = hero.getBoundingClientRect();
                const rx = (e.clientX - r.left) / r.width;
                const ry = (e.clientY - r.top) / r.height;
                hero.style.setProperty('--mx', (rx * 100) + '%');
                hero.style.setProperty('--my', (ry * 100) + '%');
                const dx = rx - 0.5;
                const dy = ry - 0.5;

                if (frame) cancelAnimationFrame(frame);
                frame = requestAnimationFrame(() => {
                    if (shotMain) shotMain.style.transform = `translate(${dx * -24}px, ${dy * -24}px) rotate(-3deg)`;
                    if (shotBack) shotBack.style.transform = `translate(${dx * -40}px, ${dy * -40}px) rotate(6deg)`;
                    orbs.forEach((o, i) => {
                        const k = (i + 1) * 16;
                        o.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
                    });
                });
            });

            hero.addEventListener('mouseleave', () => {
                if (shotMain) shotMain.style.transform = '';
                if (shotBack) shotBack.style.transform = '';
                orbs.forEach(o => { o.style.transform = ''; });
            });
        }

        /* --- 3D tilt on cards --- */
        document.querySelectorAll('.treasure-card, .why-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.12s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
            });
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform =
                    `perspective(820px) rotateX(${py * -5}deg) rotateY(${px * 7}deg) translateY(-6px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease, border-color 0.4s ease';
                card.style.transform = '';
            });
        });

        /* --- Magnetic pull on primary buttons --- */
        document.querySelectorAll('.btn-navy, .btn-gold').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                const mx = (e.clientX - r.left) / r.width - 0.5;
                const my = (e.clientY - r.top) / r.height - 0.5;
                btn.style.transform = `translate(${mx * 7}px, ${my * 7 - 3}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }
});
