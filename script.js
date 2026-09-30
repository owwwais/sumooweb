document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const hasIO = 'IntersectionObserver' in window;

    /* ---- Navbar background once the page leaves the top ---- */
    const sentinel = document.getElementById('navSentinel');
    if (navbar && sentinel && hasIO) {
        new IntersectionObserver(([entry]) => {
            navbar.classList.toggle('scrolled', !entry.isIntersecting);
        }).observe(sentinel);
    }

    /* ---- Mobile menu ---- */
    if (navToggle && navLinks) {
        const toggleMenu = (open) => {
            navLinks.classList.toggle('open', open);
            navToggle.setAttribute('aria-expanded', String(open));
            document.body.classList.toggle('menu-open', open);
        };
        navToggle.addEventListener('click', () => {
            toggleMenu(!navLinks.classList.contains('open'));
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') toggleMenu(false);
        });
    }

    /* ---- Scroll reveal ---- */
    const revealEls = document.querySelectorAll('.reveal');
    if (hasIO && revealEls.length) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        revealEls.forEach(el => observer.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('visible'));
    }

    /* ---- Story: the step crossing the middle of the viewport drives the stage ---- */
    const stage = document.getElementById('storyStage');
    const steps = document.querySelectorAll('.story-step');
    if (stage && steps.length && hasIO) {
        const shots = stage.querySelectorAll('.story-shot');
        const setPhase = (index) => {
            stage.dataset.phase = index;
            steps.forEach(step => step.classList.toggle('is-active', step.dataset.step === index));
            shots.forEach(shot => shot.classList.toggle('is-active', shot.dataset.shot === index));
        };
        const stepObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setPhase(entry.target.dataset.step);
            });
        }, { rootMargin: '-50% 0px -50% 0px' });
        steps.forEach(step => stepObserver.observe(step));
    }

    /* ---- Tasbih: a working miniature of the app's counter ---- */
    const tasbih = document.getElementById('tasbih');
    if (tasbih) {
        const countEl = document.getElementById('tasbihCount');
        const phraseEl = document.getElementById('tasbihPhrase');
        const ring = document.getElementById('tasbihRing');
        const phrases = ['سبحان الله', 'الحمد لله', 'الله أكبر'];
        const ROUND = 33;
        const LENGTH = 389.56;
        let count = 0;
        let phrase = 0;

        tasbih.addEventListener('click', () => {
            if (count === ROUND) {
                count = 0;
                phrase = (phrase + 1) % phrases.length;
                phraseEl.textContent = phrases[phrase];
            }
            count += 1;
            countEl.textContent = count;
            ring.style.strokeDashoffset = LENGTH * (1 - count / ROUND);
            if (navigator.vibrate) navigator.vibrate(count === ROUND ? 40 : 8);
        });
    }

    /* ---- Today's Hijri date (Umm al-Qura), straight from the browser ---- */
    const hijriToday = document.getElementById('hijriToday');
    const hijriDay = document.getElementById('hijriDay');
    const hijriMonth = document.getElementById('hijriMonth');
    if (hijriToday && hijriDay && hijriMonth) {
        try {
            const parts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
                day: 'numeric', month: 'long', year: 'numeric',
            }).formatToParts(new Date());
            const get = (type) => (parts.find(p => p.type === type) || {}).value;
            if (get('day') && get('month') && get('year')) {
                hijriDay.textContent = get('day');
                hijriMonth.textContent = `${get('month')} ${get('year')} هـ`;
                hijriToday.hidden = false;
            }
        } catch (_) { /* the tile stands on its title alone */ }
    }

    /* ---- Testers form: arriving from an iPhone button preselects the device ---- */
    const deviceParam = new URLSearchParams(location.search).get('device');
    const deviceInput = deviceParam && document.getElementById(`dev-${deviceParam}`);
    if (deviceInput) deviceInput.checked = true;

    /* ---- Footer year ---- */
    document.querySelectorAll('[data-year]').forEach(el => {
        el.textContent = new Date().getFullYear();
    });

    /* ---- Contact form (privacy page), sent through Formspree ---- */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const status = document.getElementById('contactStatus');
        const showStatus = (kind, msg) => {
            status.className = `form-status ${kind}`;
            status.querySelector('span').textContent = msg;
        };

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            status.className = 'form-status';
            submitBtn.classList.add('loading');

            try {
                const res = await fetch(contactForm.action, {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' },
                });
                const data = await res.json();
                if (!data.ok) throw new Error('send failed');
                contactForm.reset();
                showStatus('ok', 'وصلتنا رسالتك. سنردّ عليك عبر بريدك قريباً بإذن الله.');
            } catch (_) {
                showStatus('fail', 'تعذّر إرسال رسالتك. تحقّق من اتصالك وحاول مرة أخرى.');
            } finally {
                submitBtn.classList.remove('loading');
            }
        });
    }
});
