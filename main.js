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

  // EmailJS config is set in index.html (public key / service ID / template IDs).
  const EMAILJS_PUBLIC_KEY = window.EMAILJS_PUBLIC_KEY;
  const EMAILJS_SERVICE_ID = window.EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_CONTACT = window.EMAILJS_TEMPLATE_CONTACT;
  const EMAILJS_TEMPLATE_AUTOREPLY = window.EMAILJS_TEMPLATE_AUTOREPLY;
  const WILDERA_WEBSITE_LINK = window.WILDERA_WEBSITE_LINK;
  const WILDERA_LOGO_URL = window.WILDERA_LOGO_URL;

  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_CONTACT || !EMAILJS_TEMPLATE_AUTOREPLY || (EMAILJS_PUBLIC_KEY + EMAILJS_SERVICE_ID + EMAILJS_TEMPLATE_CONTACT + EMAILJS_TEMPLATE_AUTOREPLY).includes('REPLACE_WITH')) {
    console.error('EmailJS is not configured. Set EMAILJS_PUBLIC_KEY / SERVICE_ID / TEMPLATE_CONTACT / TEMPLATE_AUTOREPLY in index.html.');
    displayMessage('Contact form is not configured yet. Please try again later.', 'error');
    return;
  }

  if (typeof emailjs === 'undefined') {
    console.error('EmailJS is not loaded. Make sure the EmailJS CDN script is included.');
    return;
  }

  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

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

    // 1) Email YOU the inquiry (Contact Us template)
    emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_CONTACT, this)
      .then(() => {
        // 2) Auto-reply to the customer (Auto Reply template)
        const first = (contactForm.querySelector('input[name="first_name"]')?.value || '').trim();
        const last = (contactForm.querySelector('input[name="last_name"]')?.value || '').trim();
        const fullName = (first + ' ' + last).trim() || 'there';
        const customerEmail = (contactForm.querySelector('input[name="email"]')?.value || '').trim();
        const inquiryType = (contactForm.querySelector('input[name="inquiry_type"]')?.value || '').trim();

        // If we can't find an email, still treat the submission as successful
        if (!customerEmail) {
          displayMessage('Your message has been sent successfully!', 'success');
          contactForm.reset();
          return;
        }

        const autoReplyParams = {
          // IMPORTANT: in EmailJS, set the Auto Reply template "To email" to {{to_email}}
          to_email: customerEmail,

          // Use these in your template
          name: fullName,
          title: inquiryType || 'your message',
          website_link: WILDERA_WEBSITE_LINK || window.location.origin,
          logo_url: WILDERA_LOGO_URL || ''
        };

        return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_AUTOREPLY, autoReplyParams);
      })
      .then(() => {
        displayMessage('Your message has been sent successfully!', 'success');
        contactForm.reset();
      })
      .catch((error) => {
        displayMessage('Failed to send message: ' + JSON.stringify(error), 'error');
      });
  });
})();