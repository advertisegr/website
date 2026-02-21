// ===== Mobile Navigation Toggle =====
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const dropdowns = document.querySelectorAll('.dropdown');

  // Toggle mobile menu
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // Mobile dropdown toggle
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dropdown.classList.toggle('active');
        }
      });
    }
  });

  // Close mobile menu on link click
  document.querySelectorAll('.nav-links a:not(.dropdown-toggle)').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('active') &&
        !e.target.closest('.nav-links') &&
        !e.target.closest('.hamburger')) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    }
  });

  // ===== Back to Top =====
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== Contact Form Handling =====
  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('[name="name"]');
      const phone = form.querySelector('[name="phone"]');
      const email = form.querySelector('[name="email"]');
      const consent = form.querySelector('[name="consent"]');
      let messageEl = form.querySelector('.form-message');

      // Create message element if it doesn't exist
      if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = 'form-message';
        form.appendChild(messageEl);
      }

      // Reset
      messageEl.className = 'form-message';
      messageEl.style.display = 'none';

      // Validation
      if (!name.value.trim() || !phone.value.trim() || !email.value.trim()) {
        messageEl.textContent = 'Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία.';
        messageEl.className = 'form-message error';
        messageEl.style.display = 'block';
        return;
      }

      if (consent && !consent.checked) {
        messageEl.textContent = 'Παρακαλώ αποδεχτείτε την πολιτική απορρήτου.';
        messageEl.className = 'form-message error';
        messageEl.style.display = 'block';
        return;
      }

      // Success
      messageEl.textContent = 'Το μήνυμά σας στάλθηκε επιτυχώς! Θα επικοινωνήσουμε μαζί σας σύντομα.';
      messageEl.className = 'form-message success';
      messageEl.style.display = 'block';
      form.reset();

      // Auto-hide after 5 seconds
      setTimeout(() => {
        messageEl.style.display = 'none';
      }, 5000);
    });
  });

  // ===== Smooth Scroll for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== Set active nav link =====
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links > a, .nav-links .dropdown-toggle').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
});
