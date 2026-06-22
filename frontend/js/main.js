/* ============================================
   SHRINGAR - Main JavaScript
   ============================================ */

// ---- Loading Screen ----
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }
  }, 1600);
});

// ---- Navbar Scroll ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNav();
});

// ---- Active Nav Link ----
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

// ---- Mobile Menu ----
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    spans.forEach(s => s.style.background = navLinks.classList.contains('open') ? '#b5427a' : 'white');
  });
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ---- Smooth Scroll ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Tab System (Stitching Types) ----
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.stitching-content');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const targetContent = document.getElementById(`tab-${tab}`);
    if (targetContent) {
      targetContent.classList.add('active');
    }
  });
});

// ---- Scroll Reveal ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---- Counter Animation ----
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      el.textContent = target + (el.dataset.suffix || '');
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start) + (el.dataset.suffix || '');
    }
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCounter(el, parseInt(el.dataset.count), 2000);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ---- Floating Particles ----
function createParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (4 + Math.random() * 4) + 's';
    particle.style.width = particle.style.height = (2 + Math.random() * 4) + 'px';
    const colors = ['#d4af37', '#b5427a', '#d4709a', '#e8c84b'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    container.appendChild(particle);
  }
}
createParticles();

// ---- Booking Form ----
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = bookingForm.querySelector('.form-submit');
    const successMsg = document.getElementById('successMsg');
    const formData = {
      name: document.getElementById('bName')?.value,
      phone: document.getElementById('bPhone')?.value,
      service: document.getElementById('bService')?.value,
      date: document.getElementById('bDate')?.value,
      time: document.getElementById('bTime')?.value,
      notes: document.getElementById('bNotes')?.value,
    };

    submitBtn.textContent = 'Booking...';
    submitBtn.disabled = true;

    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        successMsg.style.display = 'block';
        successMsg.textContent = `✦ Thank you ${formData.name}! Your appointment has been booked. We'll confirm shortly.`;
        bookingForm.reset();
      } else {
        successMsg.style.display = 'block';
        successMsg.textContent = '⚠ Something went wrong. Please call us directly.';
        successMsg.style.borderColor = '#ff6b6b';
      }
    } catch (err) {
      // Fallback if backend is not running
      successMsg.style.display = 'block';
      successMsg.textContent = `✦ Thank you ${formData.name}! We received your request. We'll contact you at ${formData.phone} to confirm.`;
      bookingForm.reset();
    }

    submitBtn.textContent = 'Book Appointment';
    submitBtn.disabled = false;
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

// ---- Contact Form ----
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try {
      await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('cName')?.value,
          email: document.getElementById('cEmail')?.value,
          message: document.getElementById('cMessage')?.value,
        }),
      });
    } catch (_) {}
    btn.textContent = '✦ Message Sent!';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      contactForm.reset();
    }, 3000);
  });
}

// ---- WhatsApp Float ----
const waBtn = document.getElementById('whatsappFloat');
if (waBtn) {
  waBtn.addEventListener('click', () => {
    const phone = '917990702494'; // Rahi Tailors - Mehsana
    const msg = encodeURIComponent('Hello! I\'d like to book an appointment at Shringar Parlour.');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  });
}

// ---- Gallery Hover ----
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.style.zIndex = '2';
  });
  item.addEventListener('mouseleave', () => {
    item.style.zIndex = '1';
  });
});

// ---- Back to Top on hero button ----
document.querySelectorAll('[data-scroll-to]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.scrollTo);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
