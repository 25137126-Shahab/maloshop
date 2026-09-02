/**
 * Malo Garments — Contact Page Logic
 * Client-side validation for the contact form (demo — no backend email sending).
 */

document.addEventListener('DOMContentLoaded', () => {
  MaloApp.initPage();

  const form = document.getElementById('contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    ['contactName', 'contactEmail', 'contactMessage'].forEach(id => {
      document.getElementById(`err-${id}`).textContent = '';
    });

    const name = document.getElementById('contactName').value.trim();
    if (name.length < 2) {
      document.getElementById('err-contactName').textContent = 'Please enter your name.';
      valid = false;
    }

    const email = document.getElementById('contactEmail').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('err-contactEmail').textContent = 'Please enter a valid email address.';
      valid = false;
    }

    const message = document.getElementById('contactMessage').value.trim();
    if (message.length < 10) {
      document.getElementById('err-contactMessage').textContent = 'Please write a message (at least 10 characters).';
      valid = false;
    }

    if (!valid) {
      MaloApp.showToast('Please fix the highlighted fields.', 'error');
      return;
    }

    // Demo: no backend — just confirm to the user
    MaloApp.showToast('Message sent! We\'ll get back to you soon. 💌', 'success');
    form.reset();
  });
});
