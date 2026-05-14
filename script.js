/* ===========================================================
   MIDDLE CLASS MUSICIANS — Interactivity & Animations (V3)
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ----- FORCE SCROLL TO TOP ON REFRESH ----- */
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  /* ----- PRELOADER ----- */
  setTimeout(() => {
    const pl = document.getElementById('preloader');
    if (pl) pl.classList.add('done');
  }, 1200);

  /* ----- YEAR ----- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- VANILLA JS BACKGROUND NOTES (WITH DEPTH OF FIELD) ----- */
  const notesContainer = document.getElementById('bg-notes');
  const bgNotes = [];
  
  if (notesContainer) {
    const symbols = ['♪', '♫', '♩', '♬', '♭', '♮'];
    const numNotes = window.innerWidth < 768 ? 10 : 25; // Less notes on mobile

    for (let i = 0; i < numNotes; i++) {
      const span = document.createElement('span');
      span.className = 'music-note';
      span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      
      const left = Math.random() * 100;
      const size = Math.random() * 2.5 + 0.5; // Size between 0.5rem and 3rem
      const opacity = Math.random() * 0.15 + 0.03;
      const speed = size * 0.2; // Parallax: larger notes move faster
      const baseY = Math.random() * 100;

      // Depth of Field calculation
      let blurAmount = '0px';
      if (size > 2.2) blurAmount = '3px'; // Foreground out of focus
      else if (size < 1) blurAmount = '1.5px'; // Background slightly out of focus

      span.style.left = `${left}%`;
      span.style.top = `${baseY}%`;
      span.style.fontSize = `${size}rem`;
      span.style.opacity = opacity;
      span.style.filter = `blur(${blurAmount})`;

      notesContainer.appendChild(span);
      bgNotes.push({ el: span, speed: speed });
    }
  }

  /* ----- CUSTOM CURSOR & MAIN RAF LOOP ----- */
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  const hasCursor = cursor && cursorDot && window.matchMedia('(min-width: 900px)').matches;
  
  let mouseX = window.innerWidth / 2; 
  let mouseY = window.innerHeight / 2; 
  let cx = mouseX, cy = mouseY;
  let currentScrollY = window.scrollY;

  if (hasCursor) {
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX; 
      mouseY = e.clientY;
    }, { passive: true });

    document.querySelectorAll('a, button, .studio-card, .port-item, .service-row, .price-card, .channel').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  const animate = () => {
    // 1. Update Cursor
    if (hasCursor) {
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      cx += (mouseX - cx) * 0.18;
      cy += (mouseY - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    }

    // 2. Update Background Notes
    if (bgNotes.length > 0) {
      currentScrollY += (window.scrollY - currentScrollY) * 0.2; 
      for (let i = 0; i < bgNotes.length; i++) {
        const yPos = -(currentScrollY * bgNotes[i].speed);
        bgNotes[i].el.style.transform = `translate3d(0, ${yPos}px, 0)`;
      }
    }

    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);

  /* ----- NAV SCROLL ----- */
  const nav = document.getElementById('nav');
  let isNavScrolled = false;
  
  const onScroll = () => {
    const shouldScroll = window.scrollY > 60;
    if (shouldScroll !== isNavScrolled) {
      isNavScrolled = shouldScroll;
      nav.classList.toggle('scrolled', isNavScrolled);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- MOBILE MENU ----- */
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ----- REVEAL ON SCROLL ----- */
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  reveals.forEach(r => io.observe(r));

  /* ----- TILT EFFECT ON STUDIO CARDS ----- */
  document.querySelectorAll('[data-tilt]').forEach(card => {
    let raf;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(0)`;
      });
    }, { passive: true });
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      card.style.transform = '';
    });
  });

  /* ----- YOUTUBE MARQUEE TOGGLE ----- */
  const mToggleBtn = document.getElementById('marqueeToggle');
  const mTrack = document.getElementById('marqueeTrack');
  const mToggleText = document.getElementById('marqueeToggleText');
  const mToggleIcon = document.getElementById('marqueeIcon');

  if (mToggleBtn && mTrack) {
    mToggleBtn.addEventListener('click', () => {
      const isPaused = mTrack.classList.toggle('paused');
      mToggleText.textContent = isPaused ? 'Play' : 'Pause';
      mToggleIcon.innerHTML = isPaused 
        ? '<path d="M8 5v14l11-7z"/>'
        : '<path d="M6 4h4v16H6zm8 0h4v16h-4z"/>';
    });
  }
});

/* ----- CONTACT FORM (exposed) ----- */
function handleContact(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const orig = btn.innerHTML;
  btn.innerHTML = 'Sending…';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '✓ Sent — We\'ll reply on WhatsApp';
    btn.style.background = '#25d366';
    btn.style.color = '#fff';
    form.reset();
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 3200);
  }, 1100);
  return false;
}
