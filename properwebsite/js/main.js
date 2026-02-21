// ===== OK Promo - Main JavaScript =====
document.addEventListener('DOMContentLoaded', () => {

  // ===== Navbar Scroll Effect =====
  const navbar = document.querySelector('.navbar');
  const scrollThreshold = 50;

  function handleNavbarScroll() {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // ===== Mobile Navigation =====
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const dropdowns = document.querySelectorAll('.dropdown');
  let overlay = document.querySelector('.nav-overlay');

  // Create overlay if it doesn't exist
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  function openMenu() {
    hamburger.classList.add('active');
    navLinks.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  // Close on overlay click
  overlay.addEventListener('click', closeMenu);

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
        closeMenu();
      }
    });
  });

  // Close menu on outside click (desktop)
  document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('active') &&
        !e.target.closest('.nav-links') &&
        !e.target.closest('.hamburger') &&
        !e.target.closest('.nav-overlay')) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      closeMenu();
    }
  });

  // ===== Back to Top Button =====
  const backToTopBtn = document.querySelector('.back-to-top-btn');
  const backToTopInline = document.querySelector('.back-to-top');

  function handleBackToTopVisibility() {
    if (backToTopBtn) {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', handleBackToTopVisibility, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (backToTopInline) {
    backToTopInline.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== Intersection Observer - Scroll Animations =====
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const animateElements = document.querySelectorAll('[data-animate]');

    if (animateElements.length > 0) {
      const animateObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            animateObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      });

      animateElements.forEach(el => animateObserver.observe(el));
    }
  } else {
    // If reduced motion, make everything visible immediately
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.classList.add('animated');
    });
  }

  // ===== Counter Animation =====
  const counterElements = document.querySelectorAll('[data-count]');

  if (counterElements.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterElements.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'), 10);
    const suffix = element.getAttribute('data-count-suffix') || '';
    const prefix = element.getAttribute('data-count-prefix') || '';
    const duration = 2000;
    const startTime = performance.now();

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = Math.round(easedProgress * target);

      element.textContent = prefix + currentValue.toLocaleString('el-GR') + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    if (prefersReducedMotion) {
      element.textContent = prefix + target.toLocaleString('el-GR') + suffix;
    } else {
      requestAnimationFrame(update);
    }
  }

  // ===== FAQ Accordion =====
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all other items
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('active');
        });

        // Toggle current
        item.classList.toggle('active', !isActive);
      });
    }
  });

  // ===== Contact Form Handling =====
  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('[name="name"]');
      const phone = form.querySelector('[name="phone"]');
      const email = form.querySelector('[name="email"]');
      const consent = form.querySelector('[name="consent"]');
      let messageEl = form.querySelector('.form-message');

      if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = 'form-message';
        form.appendChild(messageEl);
      }

      // Reset
      messageEl.className = 'form-message';
      messageEl.style.display = 'none';

      // Remove previous error states
      form.querySelectorAll('.form-group.error').forEach(g => g.classList.remove('error'));

      // Validation
      let hasErrors = false;

      if (!name || !name.value.trim()) {
        const group = name ? name.closest('.form-group') : null;
        if (group) group.classList.add('error');
        hasErrors = true;
      }

      if (!phone || !phone.value.trim()) {
        const group = phone ? phone.closest('.form-group') : null;
        if (group) group.classList.add('error');
        hasErrors = true;
      }

      if (!email || !email.value.trim()) {
        const group = email ? email.closest('.form-group') : null;
        if (group) group.classList.add('error');
        hasErrors = true;
      }

      if (hasErrors) {
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
      messageEl.textContent = 'Το μήνυμά σας στάλθηκε επιτυχώς! Θα επικοινωνήσουμε μαζί σας εντός 24 ωρών.';
      messageEl.className = 'form-message success';
      messageEl.style.display = 'block';
      form.reset();

      setTimeout(() => {
        messageEl.style.display = 'none';
      }, 5000);
    });
  });

  // ===== Smooth Scroll for Anchor Links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== Set Active Nav Link =====
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links > a, .nav-links .dropdown-toggle').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ===== Dynamic Copyright Year =====
  const yearElements = document.querySelectorAll('.footer-bottom span');
  yearElements.forEach(el => {
    if (el.textContent.includes('2024')) {
      el.innerHTML = el.innerHTML.replace('2024', new Date().getFullYear());
    }
  });

});
