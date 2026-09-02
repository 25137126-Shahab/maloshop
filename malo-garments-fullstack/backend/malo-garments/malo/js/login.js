/**
 * Malo Garments — Login & Signup Logic
 * Handles tab switching, form validation, registration, and authentication.
 */

document.addEventListener('DOMContentLoaded', () => {
  MaloApp.initPage();

  // Redirect if already logged in
  if (MaloStore.getCurrentUser()) {
    window.location.href = './account.html';
    return;
  }

  initAuthTabs();
  bindLoginForm();
  bindSignupForm();
});

function initAuthTabs() {
  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get('tab') === 'signup' ? 'signup' : 'login';

  document.querySelectorAll('.auth-tab').forEach(tab => {
    if (tab.dataset.tab === initialTab) {
      activateTab(tab.dataset.tab);
    }
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  });
}

function activateTab(tabName) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  document.getElementById('loginForm').classList.toggle('active', tabName === 'login');
  document.getElementById('signupForm').classList.toggle('active', tabName === 'signup');
}

// ─── Login ───
function bindLoginForm() {
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    let valid = true;

    document.getElementById('err-loginEmail').textContent = '';
    document.getElementById('err-loginPassword').textContent = '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('err-loginEmail').textContent = 'Please enter a valid email address.';
      valid = false;
    }
    if (password.length === 0) {
      document.getElementById('err-loginPassword').textContent = 'Please enter your password.';
      valid = false;
    }
    if (!valid) return;

    const result = await MaloStore.loginUser(email, password);
    if (result.success) {
      MaloApp.showToast(`Welcome back, ${result.user.name}! 👋`, 'success');
      setTimeout(() => window.location.href = './account.html', 800);
    } else {
      document.getElementById('err-loginPassword').textContent = result.error;
    }
  });
}

// ─── Signup ───
function bindSignupForm() {
  const passwordInput = document.getElementById('signupPassword');
  passwordInput.addEventListener('input', () => updatePasswordStrength(passwordInput.value));

  const form = document.getElementById('signupForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateSignupForm()) return;

    const userData = {
      name: document.getElementById('signupName').value.trim(),
      email: document.getElementById('signupEmail').value.trim(),
      phone: document.getElementById('signupPhone').value.trim(),
      password: document.getElementById('signupPassword').value
    };

    const result = await MaloStore.registerUser(userData);
    if (result.success) {
      // registerUser already logs the new session in, no separate login call needed
      MaloApp.showToast(`Account created! Welcome, ${result.user.name}! ✨`, 'success');
      setTimeout(() => window.location.href = './account.html', 800);
    } else {
      document.getElementById('err-signupEmail').textContent = result.error;
    }
  });
}

function updatePasswordStrength(password) {
  const bars = document.querySelectorAll('.password-strength-bar');
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (password.length >= 10 && /[^A-Za-z0-9]/.test(password)) score++;

  const level = score === 0 ? '' : score === 1 ? 'weak' : score === 2 ? 'medium' : 'strong';
  bars.forEach((bar, i) => {
    bar.className = 'password-strength-bar';
    if (i < score) bar.classList.add(level);
  });
}

function validateSignupForm() {
  let valid = true;
  ['signupName', 'signupEmail', 'signupPassword', 'signupConfirmPassword'].forEach(id => {
    document.getElementById(`err-${id}`).textContent = '';
  });

  const name = document.getElementById('signupName').value.trim();
  if (name.length < 2) {
    document.getElementById('err-signupName').textContent = 'Please enter your full name.';
    valid = false;
  }

  const email = document.getElementById('signupEmail').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('err-signupEmail').textContent = 'Please enter a valid email address.';
    valid = false;
  }

  const password = document.getElementById('signupPassword').value;
  if (password.length < 6) {
    document.getElementById('err-signupPassword').textContent = 'Password must be at least 6 characters.';
    valid = false;
  }

  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  if (password !== confirmPassword) {
    document.getElementById('err-signupConfirmPassword').textContent = 'Passwords do not match.';
    valid = false;
  }

  if (!valid) MaloApp.showToast('Please fix the highlighted fields.', 'error');
  return valid;
}
