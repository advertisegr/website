// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const package = formData.get('package');
            const message = formData.get('message');
            
            // Create email body
            const emailBody = `New Quote Request from advertisegr Website

Name: ${name}
Email: ${email}
Phone: ${phone}
Package: ${package}
Message: ${message}

---
Sent from advertisegr website contact form`;
            
            // Create mailto link
            const mailtoLink = `mailto:director@advertisegr.marketing?subject=Quote Request from ${name}&body=${encodeURIComponent(emailBody)}`;
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Show success message
            showMessage('Opening your email client... Please send the email to complete your request.', 'success');
        });
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe service items, steps, and pricing cards
    const animatedElements = document.querySelectorAll('.service-item, .step, .pricing-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Package selection function
function selectPackage(packageType) {
    // Smooth scroll to contact form
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    // Pre-select the package in the form
    setTimeout(() => {
        const packageSelect = document.getElementById('package');
        if (packageSelect) {
            packageSelect.value = packageType;
            packageSelect.focus();
            
            // Add a subtle highlight effect
            packageSelect.style.borderColor = '#2563eb';
            packageSelect.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            
            setTimeout(() => {
                packageSelect.style.borderColor = '';
                packageSelect.style.boxShadow = '';
            }, 2000);
        }
    }, 500);
}

// Show message function
function showMessage(message, type) {
    // Remove any existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message element
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${type}`;
    messageElement.textContent = message;
    
    // Add styles
    messageElement.style.cssText = `
        padding: 1rem 1.5rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        font-weight: 500;
        text-align: center;
        ${type === 'success' ? 
            'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;' : 
            'background: #fee2e2; color: #dc2626; border: 1px solid #fecaca;'
        }
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
    `;

    // Insert message
    const form = document.getElementById('contactForm');
    form.insertBefore(messageElement, form.firstChild);

    // Animate in
    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, 10);

    // Remove message after 5 seconds
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 300);
    }, 5000);
}


// Preload images for better performance
function preloadImages() {
    const images = ['logo.png'];
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize
preloadImages();
