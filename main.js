// Wildera site JS

// Smooth-scroll for in-page anchors (e.g., #about, #contact)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetSelector = this.getAttribute('href');
    const target = document.querySelector(targetSelector);

    // Only intercept if the target exists on the current page
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// EmailJS (only initialize + bind if the contact form exists on this page)
(function () {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  // NOTE: Update these to your Wildera EmailJS Service ID + Template ID when ready.
  // Keeping existing values avoids breaking current functionality.
  const EMAILJS_SERVICE_ID = 'hannahansenphotography';
  const EMAILJS_TEMPLATE_ID = 'template_k7a4rl5';
  const EMAILJS_PUBLIC_KEY = 'ST_aM3HmS9Oq1D3Hf';

  if (typeof emailjs === 'undefined') {
    console.error('EmailJS is not loaded. Make sure the EmailJS CDN script is included.');
    return;
  }

  emailjs.init(EMAILJS_PUBLIC_KEY);

  function formatPhoneNumber(value) {
    value = value.replace(/\D/g, '');

    if (value.length > 3 && value.length <= 6) {
      return value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 6) {
      return value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
    }
    return value;
  }

  function displayMessage(message, type) {
    const formMessage = document.getElementById('contact-message');
    if (!formMessage) return;

    formMessage.style.display = 'block';
    formMessage.style.color = type === 'success' ? 'green' : 'red';
    formMessage.textContent = message;

    setTimeout(() => {
      formMessage.style.display = 'none';
    }, 5000);
  }

  const phoneInput = document.querySelector("input[name='phone']");
  if (phoneInput) {
    phoneInput.addEventListener('input', function (event) {
      event.target.value = formatPhoneNumber(event.target.value);
    });
  }

  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    if (phoneInput) {
      const formattedPhone = formatPhoneNumber(phoneInput.value);
      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

      if (!phoneRegex.test(formattedPhone)) {
        displayMessage('Invalid phone number. Use 000-000-0000.', 'error');
        return;
      }
      phoneInput.value = formattedPhone;
    }

    emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, this)
      .then(() => {
        displayMessage('Your message has been sent successfully!', 'success');
        contactForm.reset();
      })
      .catch((error) => {
        displayMessage('Failed to send message: ' + JSON.stringify(error), 'error');
      });
  });
})();