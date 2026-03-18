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
   TECH VIDEO BOX  (page 2 – scene3d.mp4)
   Play/pause button + draggable timeline scrubber.
   ============================================================= */
function initTechVideo() {
  const video    = document.getElementById('tech-main-video');
  const playBtn  = document.getElementById('tech-play-btn');
  const fill     = document.getElementById('tech-timeline-fill');
  const range    = document.getElementById('tech-timeline-range');
  const timeEl   = document.getElementById('tech-timeline-time');
  if (!video || !playBtn) return;

  const frame     = video.closest('.tech-video-frame');
  const PLAY_SVG  = `<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  const PAUSE_SVG = `<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

  function fmtTime(s) {
    const m = Math.floor(s / 60);
    return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  }

  playBtn.addEventListener('click', () => {
    if (video.paused) { video.play().catch(() => {}); playBtn.innerHTML = PAUSE_SVG; if (frame) frame.classList.add('is-playing'); }
    else              { video.pause();                 playBtn.innerHTML = PLAY_SVG;  if (frame) frame.classList.remove('is-playing'); }
  });

  // Click anywhere on the video frame (outside the button/timeline) while playing → pause + reveal controls
  if (frame) {
    frame.addEventListener('click', (e) => {
      if (e.target.closest('#tech-play-btn') || e.target.closest('.vid-timeline')) return;
      if (!video.paused) {
        video.pause();
        playBtn.innerHTML = PLAY_SVG;
        frame.classList.remove('is-playing');
      }
    });
  }

  video.addEventListener('ended', () => { playBtn.innerHTML = PLAY_SVG; if (frame) frame.classList.remove('is-playing'); });

  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    if (fill)   fill.style.width = pct + '%';
    if (range)  range.value      = pct;
    if (timeEl) timeEl.textContent = fmtTime(video.currentTime);
  });

  if (range) {
    range.addEventListener('input', () => {
      if (!video.duration) return;
      video.currentTime = (range.value / 100) * video.duration;
    });
  }
}

/* =============================================================
   PRODUCT VIDEO CAROUSEL
   4-up stepped-transparent video showcase at end of Products.
   Active card is front/full; others cascade diagonally behind.
   Click a non-active card to select it. Click active to play.
   Left / Right buttons and dot indicators for navigation.
   ============================================================= */
function initProductVideoCarousel() {
  const stage   = document.getElementById('pvcarousel-stage');
  if (!stage) return;

  const items   = Array.from(stage.querySelectorAll('.pvc-item'));
  const dots    = Array.from(document.querySelectorAll('.pvc-dot'));
  const prevBtn = document.getElementById('pvc-prev');
  const nextBtn = document.getElementById('pvc-next');
  const total   = items.length;
  let   current = 0;

  const PLAY_ICON  = `<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  const PAUSE_ICON = `<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

  function syncPlayBtn(item, isPaused) {
    const btn = item.querySelector('.pvc-play');
    if (btn) btn.innerHTML = isPaused ? PLAY_ICON : PAUSE_ICON;
    item.classList.toggle('is-playing', !isPaused);
  }

  function setPositions() {
    items.forEach((item, i) => {
      const pos = ((i - current) % total + total) % total;
      item.dataset.pos = pos;
      const video = item.querySelector('.pvc-video');
      if (video && pos !== 0 && !video.paused) {
        video.pause();
        syncPlayBtn(item, true);
      }
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('pvc-dot--active', i === current);
      dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  function goTo(index) {
    current = ((index % total) + total) % total;
    setPositions();
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      if (item.dataset.pos !== '0') {
        goTo(i);
        return;
      }
      const video = item.querySelector('.pvc-video');
      if (!video) return;
      if (video.paused) {
        video.play().catch(() => {});
        syncPlayBtn(item, false);
      } else {
        video.pause();
        syncPlayBtn(item, true);
      }
    });
  });

  items.forEach(item => {
    const video = item.querySelector('.pvc-video');
    if (!video) return;
    video.addEventListener('ended', () => syncPlayBtn(item, true));

    // Timeline scrubber wiring
    const fill   = item.querySelector('.pvc-timeline-fill');
    const range  = item.querySelector('.pvc-timeline-range');
    const timeEl = item.querySelector('.pvc-timeline-time');

    function fmtTime(s) {
      const m = Math.floor(s / 60);
      return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    }

    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      const pct = (video.currentTime / video.duration) * 100;
      if (fill)   fill.style.width      = pct + '%';
      if (range)  range.value           = pct;
      if (timeEl) timeEl.textContent    = fmtTime(video.currentTime);
    });

    if (range) {
      range.addEventListener('input', (e) => {
        e.stopPropagation(); // don't bubble to card click
        if (!video.duration) return;
        video.currentTime = (range.value / 100) * video.duration;
      });
    }
  });

  stage.setAttribute('tabindex', '0');
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  setPositions();
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
  initTechVideo();
  initProductVideoCarousel();
});
