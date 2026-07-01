/* ==========================================================================
   سُمو — Internal testers form handler
   Sends { name, email, device } to a Google Apps Script Web App,
   which appends a row to a Google Sheet.

   ⚙️  SETUP: paste your deployed Apps Script Web App URL below.
   See SETUP-testers.md for step-by-step instructions.
   ========================================================================== */
const ENDPOINT = 'ضع_هنا_رابط_تطبيق_Apps_Script'; // e.g. https://script.google.com/macros/s/AKfy.../exec

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('testerForm');
    const submitBtn = document.getElementById('submitBtn');
    const successState = document.getElementById('successState');
    if (!form) return;

    /* ---- Inline error banner for network/server issues ---- */
    const errorBanner = document.createElement('div');
    errorBanner.className = 'form-error';
    errorBanner.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i><span></span>';
    submitBtn.parentNode.insertBefore(errorBanner, submitBtn);

    const showError = (msg) => {
        errorBanner.querySelector('span').textContent = msg;
        errorBanner.classList.add('show');
    };
    const clearError = () => errorBanner.classList.remove('show');

    /* ---- Field-level validation helpers ---- */
    const setInvalid = (name, msg) => {
        const field = form.querySelector(`[name="${name}"]`).closest('.field');
        field.classList.add('invalid');
        const err = field.querySelector(`.err[data-for="${name}"]`);
        if (err) err.textContent = msg;
    };
    const clearInvalid = (field) => field.classList.remove('invalid');

    // Clear a field's error as soon as the user fixes it.
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => clearInvalid(input.closest('.field')));
        input.addEventListener('change', () => clearInvalid(input.closest('.field')));
    });

    const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const validate = (data) => {
        let ok = true;
        form.querySelectorAll('.field').forEach(clearInvalid);

        if (!data.name || data.name.length < 2) {
            setInvalid('name', 'من فضلك اكتب اسمك.');
            ok = false;
        }
        if (!data.email) {
            setInvalid('email', 'من فضلك اكتب بريدك الإلكتروني.');
            ok = false;
        } else if (!isValidEmail(data.email)) {
            setInvalid('email', 'صيغة البريد الإلكتروني غير صحيحة.');
            ok = false;
        }
        if (!data.device) {
            setInvalid('device', 'اختر نوع جهازك.');
            ok = false;
        }
        return ok;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();

        const data = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            device: (form.querySelector('input[name="device"]:checked') || {}).value || '',
        };

        if (!validate(data)) return;

        if (ENDPOINT.startsWith('ضع_هنا') || !/^https?:\/\//.test(ENDPOINT)) {
            showError('لم يتم ضبط رابط الحفظ بعد. راجع ملف SETUP-testers.md لإكمال الإعداد.');
            return;
        }

        submitBtn.classList.add('loading');

        try {
            const body = new FormData();
            body.append('name', data.name);
            body.append('email', data.email);
            body.append('device', data.device);
            body.append('source', 'testers-page');

            const res = await fetch(ENDPOINT, { method: 'POST', body });

            // Apps Script returns JSON like { result: "success" }.
            let payload = {};
            try { payload = await res.json(); } catch (_) { /* opaque/redirect */ }

            if (!res.ok || (payload.result && payload.result !== 'success')) {
                throw new Error(payload.message || 'HTTP ' + res.status);
            }

            // Success — swap the form for the thank-you state.
            form.hidden = true;
            successState.hidden = false;
            successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (err) {
            showError('تعذّر إرسال بياناتك حالياً. تحقّق من اتصالك وحاول مرة أخرى.');
            submitBtn.classList.remove('loading');
        }
    });
});
