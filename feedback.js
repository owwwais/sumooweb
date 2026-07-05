/* ==========================================================================
   سُمو — Feedback form handler
   Sends { name, email, device, category, rating, message } to the same
   Google Apps Script Web App used by the testers form (routed by form=feedback).

   ⚙️  Paste the SAME deployed Apps Script Web App URL below as in testers.js.
       (Re-deploy the script after updating it — see SETUP-testers.md.)
   ========================================================================== */
const ENDPOINT = 'ضع_هنا_رابط_تطبيق_Apps_Script'; // نفس رابط testers.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedbackForm');
    const submitBtn = document.getElementById('submitBtn');
    const successState = document.getElementById('successState');
    const againBtn = document.getElementById('againBtn');
    if (!form) return;

    /* ---- Star rating ---- */
    const stars = Array.from(document.querySelectorAll('.star'));
    const ratingInput = document.getElementById('rating');
    const starNote = document.getElementById('starNote');
    const labels = { 1: 'ضعيف', 2: 'مقبول', 3: 'جيد', 4: 'ممتاز', 5: 'رائع!' };

    const paint = (val) => stars.forEach(s => s.classList.toggle('on', +s.dataset.value <= val));
    stars.forEach(star => {
        const val = +star.dataset.value;
        star.addEventListener('mouseenter', () => paint(val));
        star.addEventListener('click', () => {
            ratingInput.value = String(val);
            starNote.textContent = labels[val] || '';
            paint(val);
        });
    });
    const starsWrap = document.getElementById('stars');
    if (starsWrap) starsWrap.addEventListener('mouseleave', () => paint(+ratingInput.value || 0));

    /* ---- Error banner ---- */
    const errorBanner = document.createElement('div');
    errorBanner.className = 'form-error';
    errorBanner.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i><span></span>';
    submitBtn.parentNode.insertBefore(errorBanner, submitBtn);
    const showError = (msg) => { errorBanner.querySelector('span').textContent = msg; errorBanner.classList.add('show'); };
    const clearError = () => errorBanner.classList.remove('show');

    /* ---- Validation helpers ---- */
    const setInvalid = (name, msg) => {
        const el = form.querySelector(`[name="${name}"]`);
        const field = el.closest('.field');
        field.classList.add('invalid');
        const err = field.querySelector(`.err[data-for="${name}"]`);
        if (err) err.textContent = msg;
    };
    const clearInvalid = (field) => field.classList.remove('invalid');
    form.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => clearInvalid(el.closest('.field')));
        el.addEventListener('change', () => clearInvalid(el.closest('.field')));
    });

    const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const validate = (data) => {
        let ok = true;
        form.querySelectorAll('.field').forEach(clearInvalid);

        if (!data.category) {
            setInvalid('category', 'اختر نوع الملاحظة.');
            ok = false;
        }
        if (!data.message || data.message.length < 3) {
            setInvalid('message', 'من فضلك اكتب ملاحظتك.');
            ok = false;
        }
        if (data.email && !isValidEmail(data.email)) {
            setInvalid('email', 'صيغة البريد الإلكتروني غير صحيحة.');
            ok = false;
        }
        return ok;
    };

    const resetForm = () => {
        form.reset();
        ratingInput.value = '';
        starNote.textContent = '';
        paint(0);
        form.querySelectorAll('.field').forEach(clearInvalid);
    };

    if (againBtn) {
        againBtn.addEventListener('click', () => {
            successState.hidden = true;
            form.hidden = false;
            resetForm();
            submitBtn.classList.remove('loading');
            form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();

        const data = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            category: (form.querySelector('input[name="category"]:checked') || {}).value || '',
            rating: ratingInput.value,
            message: form.message.value.trim(),
        };

        if (!validate(data)) return;

        if (ENDPOINT.startsWith('ضع_هنا') || !/^https?:\/\//.test(ENDPOINT)) {
            showError('لم يتم ضبط رابط الحفظ بعد. راجع ملف SETUP-testers.md لإكمال الإعداد.');
            return;
        }

        submitBtn.classList.add('loading');

        try {
            const body = new FormData();
            body.append('form', 'feedback');
            body.append('name', data.name);
            body.append('email', data.email);
            body.append('category', data.category);
            body.append('rating', data.rating);
            body.append('message', data.message);
            body.append('source', 'feedback-page');

            const res = await fetch(ENDPOINT, { method: 'POST', body });

            let payload = {};
            try { payload = await res.json(); } catch (_) { /* opaque/redirect */ }

            if (!res.ok || (payload.result && payload.result !== 'success')) {
                throw new Error(payload.message || 'HTTP ' + res.status);
            }

            form.hidden = true;
            successState.hidden = false;
            successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (err) {
            showError('تعذّر إرسال ملاحظتك حالياً. تحقّق من اتصالك وحاول مرة أخرى.');
            submitBtn.classList.remove('loading');
        }
    });
});
