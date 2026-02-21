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
    hamburger.setAttribute('aria-expanded', 'true');
    navLinks.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('menu-open');

    // Move focus to first nav link
    const firstLink = navLinks.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('menu-open');

    // Return focus to hamburger
    if (hamburger) hamburger.focus();
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

  // ===== Mobile Menu Focus Trap =====
  if (navLinks) {
    navLinks.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !navLinks.classList.contains('active')) return;

      const focusableEls = navLinks.querySelectorAll('a, button');
      if (focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    });
  }

  // ===== Desktop Dropdown Keyboard Navigation =====
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    if (!toggle || !menu) return;

    // Enter/Space toggles dropdown on desktop
    toggle.addEventListener('keydown', (e) => {
      if (window.innerWidth <= 768) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        if (!expanded) {
          const firstItem = menu.querySelector('a');
          if (firstItem) firstItem.focus();
        }
      }
    });

    // Escape closes dropdown
    dropdown.addEventListener('keydown', (e) => {
      if (window.innerWidth <= 768) return;
      if (e.key === 'Escape') {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });

    // Update aria-expanded on hover for desktop
    dropdown.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) {
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
    dropdown.addEventListener('mouseleave', () => {
      if (window.innerWidth > 768) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
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
      if ('IntersectionObserver' in window) {
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
      } else {
        // Fallback: show all elements immediately
        animateElements.forEach(el => el.classList.add('animated'));
      }
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
    if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      counterElements.forEach(el => counterObserver.observe(el));
    } else {
      // Fallback: show final values immediately
      counterElements.forEach(el => {
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-count-suffix') || '';
        const prefix = el.getAttribute('data-count-prefix') || '';
        el.textContent = prefix + target.toLocaleString('el-GR') + suffix;
      });
    }
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

        // Close all other items and update their aria-expanded
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current
        item.classList.toggle('active', !isActive);
        question.setAttribute('aria-expanded', String(!isActive));
      });
    }
  });

  // ===== Contact Form Handling =====
  // Rate limiting: track last submission time
  let lastSubmitTime = 0;
  const SUBMIT_COOLDOWN_MS = 10000; // 10 seconds between submissions

  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Honeypot check: if hidden field is filled, silently reject (it's a bot)
      const honeypot = form.querySelector('[name="website"]');
      if (honeypot && honeypot.value) {
        return;
      }

      // Rate limit check
      const now = Date.now();
      if (now - lastSubmitTime < SUBMIT_COOLDOWN_MS) {
        return;
      }

      const name = form.querySelector('[name="name"]');
      const phone = form.querySelector('[name="phone"]');
      const email = form.querySelector('[name="email"]');
      const consent = form.querySelector('[name="consent"]');
      let messageEl = form.querySelector('.form-message');

      if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = 'form-message';
        messageEl.setAttribute('role', 'alert');
        messageEl.setAttribute('aria-live', 'assertive');
        messageEl.setAttribute('aria-atomic', 'true');
        form.appendChild(messageEl);
      }

      // Reset
      messageEl.className = 'form-message';
      messageEl.setAttribute('role', 'alert');
      messageEl.setAttribute('aria-live', 'assertive');
      messageEl.setAttribute('aria-atomic', 'true');
      messageEl.style.display = 'none';

      // Remove previous error states
      form.querySelectorAll('.form-group.error').forEach(g => g.classList.remove('error'));
      form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));

      // Validation
      let hasErrors = false;

      if (!name || !name.value.trim()) {
        const group = name ? name.closest('.form-group') : null;
        if (group) group.classList.add('error');
        if (name) name.setAttribute('aria-invalid', 'true');
        hasErrors = true;
      }

      if (!phone || !phone.value.trim()) {
        const group = phone ? phone.closest('.form-group') : null;
        if (group) group.classList.add('error');
        if (phone) phone.setAttribute('aria-invalid', 'true');
        hasErrors = true;
      }

      if (!email || !email.value.trim()) {
        const group = email ? email.closest('.form-group') : null;
        if (group) group.classList.add('error');
        if (email) email.setAttribute('aria-invalid', 'true');
        hasErrors = true;
      }

      // Input length validation
      if (name && name.value.length > 100) {
        hasErrors = true;
      }
      if (phone && phone.value.length > 30) {
        hasErrors = true;
      }
      if (email && email.value.length > 200) {
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

      lastSubmitTime = now;

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
