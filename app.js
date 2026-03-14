/* =============================================================
   DUNLEVON � app.js
   All interactive behaviour for the corporate website.

   VIDEO CONFIGURATION
   ---------------------------------------------------------------
   When your demo .mp4 is ready, set placeholder to false and
   provide the relative path in src.

   Example:
     src:         'videos/perception-demo.mp4',
     placeholder: false
   ============================================================= */
const VIDEOS = {
  visionpilot: {
    id:          'visionpilot',
    src:         '',          // e.g. 'videos/perception-demo.mp4'
    placeholder: true,
    label:       'Perception Engine Demo � 60FPS',
  },
};

/* =============================================================
   VIDEO LOADER
   If placeholder is false and src is set, replaces the frame
   div with an autoplaying muted <video> element while keeping
   the teal border styling of .tech-video-frame.
   ============================================================= */
function loadVideos() {
  Object.values(VIDEOS).forEach(({ id, src, placeholder, label }) => {
    if (placeholder || !src) return;

    const frame = document.querySelector(`[data-video="${id}"]`);
    if (!frame) return;

    const video         = document.createElement('video');
    video.src           = src;
    video.autoplay      = true;
    video.muted         = true;
    video.loop          = true;
    video.playsInline   = true;
    video.setAttribute('aria-label', label);

    // Preserve frame's border and styling by replacing only inner content
    frame.innerHTML = '';
    video.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;';
    frame.appendChild(video);
  });
}

/* =============================================================
   STICKY NAVBAR
   Adds a frosted-glass background once the user scrolls past 20px.
   ============================================================= */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* =============================================================
   ACTIVE NAV LINK (section highlighting)
   Marks the link whose target section is currently in view.
   ============================================================= */
function initActiveNavLink() {
  const links    = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(l => l.classList.remove('active'));
        const active = links.find(l => l.getAttribute('href') === `#${entry.target.id}`);
        if (active) active.classList.add('active');
      });
    },
    { threshold: 0.35, rootMargin: '-72px 0px 0px 0px' }
  );

  sections.forEach(s => observer.observe(s));
}

/* =============================================================
   MOBILE NAV TOGGLE
   ============================================================= */
function initMobileNav() {
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.querySelector('.nav-links');
  if (!navToggle || !navLinks) return;

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.dataset.open === 'true';
    const open   = !isOpen;

    navLinks.dataset.open = String(open);
    navToggle.setAttribute('aria-expanded', String(open));

    if (open) {
      Object.assign(navLinks.style, {
        display:        'flex',
        flexDirection:  'column',
        position:       'absolute',
        top:            '72px',
        left:           '0',
        right:          '0',
        background:     'rgba(245, 245, 245, 0.97)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        padding:        '14px 24px 22px',
        borderBottom:   '1px solid rgba(0, 0, 0, 0.07)',
        gap:            '2px',
        zIndex:         '999',
      });
    } else {
      navLinks.removeAttribute('style');
    }
  });

  // Close menu when a link is clicked
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.dataset.open = 'false';
      navLinks.removeAttribute('style');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* =============================================================
   SCROLL FADE-IN
   Elements with class .fade-up become visible when they enter
   the viewport.
   ============================================================= */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.10, rootMargin: '0px 0px -36px 0px' }
  );

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

/* =============================================================
   CONTACT FORM
   Simple submit handler with visual confirmation.
   ============================================================= */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn          = form.querySelector('[type="submit"]');
    const originalHTML = btn.innerHTML;

    btn.innerHTML  = '&#10003; Message Sent!';
    btn.style.background = '#0A8A7E';
    btn.disabled   = true;

    setTimeout(() => {
      btn.innerHTML        = originalHTML;
      btn.style.background = '';
      btn.disabled         = false;
      form.reset();
    }, 3800);
  });
}

/* =============================================================
   SMOOTH SCROLL � Safari polyfill
   ============================================================= */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* =============================================================
   BOOT
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  loadVideos();
  initNavbar();
  initActiveNavLink();
  initMobileNav();
  initScrollAnimations();
  initContactForm();
  initSmoothScroll();
});
