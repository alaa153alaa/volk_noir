const loginForm = document.querySelector('#login-form');
const passwordInput = document.querySelector('#password');
const passwordToggle = document.querySelector('#toggle-password');
const formMessage = document.querySelector('#form-message');
const loginSound = document.querySelector('#login-sound');
const soundToggle = document.querySelector('#sound-toggle');
const emailInput = document.querySelector('#email'); // يُستخدم هنا كاسم المستخدم
const rememberInput = document.querySelector('input[name="remember"]');
const forgotPassword = document.querySelector('#forgot-password');

let rememberedEmail = '';
try {
    rememberedEmail = localStorage.getItem('volknoir_email') || '';
} catch {
    rememberedEmail = '';
}
if (rememberedEmail && emailInput && rememberInput) {
    emailInput.value = rememberedEmail;
    rememberInput.checked = true;
}

passwordToggle?.addEventListener('click', () => {
    const showing = passwordInput.type === 'text';
    passwordInput.type = showing ? 'password' : 'text';
    passwordToggle.setAttribute('aria-label', showing ? 'إظهار كلمة المرور' : 'إخفاء كلمة المرور');
    passwordToggle.textContent = showing ? '◉' : '◌';
});

soundToggle?.addEventListener('click', async () => {
    if (!loginSound) return;
    if (loginSound.paused) {
        try {
            await loginSound.play();
            soundToggle.classList.add('is-on');
            soundToggle.setAttribute('aria-pressed', 'true');
            soundToggle.setAttribute('aria-label', 'كتم صوت الخلفية');
            soundToggle.querySelector('strong').textContent = 'SOUND ON';
        } catch {
            soundToggle.querySelector('strong').textContent = 'AUDIO ERROR';
        }
    } else {
        loginSound.pause();
        soundToggle.classList.remove('is-on');
        soundToggle.setAttribute('aria-pressed', 'false');
        soundToggle.setAttribute('aria-label', 'تشغيل صوت الخلفية');
        soundToggle.querySelector('strong').textContent = 'SOUND OFF';
    }
});

// التعديل الرئيسي هنا للتحقق من السيرفر
loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;

    const username = emailInput.value.trim();
    const password = passwordInput.value;

    if (formMessage) formMessage.textContent = 'جاري التحقق من البيانات...';

    try {
        // إرسال البيانات للسيرفر
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            // حفظ الحساب عند الخيار
            if (rememberInput?.checked) {
                try {
                    localStorage.setItem('volknoir_email', username);
                } catch {}
            } else {
                try {
                    localStorage.removeItem('volknoir_email');
                } catch {}
            }

            // التوجيه لصفحة التحميل عند نجاح تسجيل الدخول فقط
            window.location.href = 'loding.html';
        } else {
            // إظهار رسالة الخطأ القادمة من السيرفر
            const errorText = await response.text();
            if (formMessage) formMessage.textContent = errorText || 'بيانات الدخول غير صحيحة';
        }
    } catch (err) {
        if (formMessage) formMessage.textContent = 'عذراً، تعذر الاتصال بالسيرفر';
    }
});

forgotPassword?.addEventListener('click', (event) => {
    event.preventDefault();
    if (formMessage) formMessage.textContent = 'اكتب بريدك الإلكتروني وسنتواصل معك لاستعادة الحساب.';
    emailInput?.focus();
});