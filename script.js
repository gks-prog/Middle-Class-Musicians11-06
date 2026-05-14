/* ===========================================================
   MIDDLE CLASS MUSICIANS — Interactivity & Animations (Optimized)
   =========================================================== */

(() => {
  'use strict';

  /* FORCE SCROLL TO TOP */
  window.scrollTo(0, 0);

  /* PRELOADER */
  window.addEventListener('load', () => {
    setTimeout(() => {
      const pl = document.getElementById('preloader');
      if (pl) pl.classList.add('done');
    }, 1200); 
  });

  /* YEAR */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* VANILLA JS BACKGROUND NOTES */
  const notesContainer = document.getElementById('bg-notes');
  const bgNotes = [];
  if (notesContainer) {
    const symbols = ['♪', '♫', '♩', '♬', '♭', '♮'];
    for (let i = 0; i < 20; i++) {
      const span = document.createElement('span');
      span.className = 'music-note';
      span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      const left = Math.random() * 100;
      const size = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.15 + 0.05;
      const speed = Math.random() * 0.5 + 0.2;
      const baseY = Math.random() * 100;
      span.style.left = `${left}%`;
      span.style.top = `${baseY}%`;
      span.style.fontSize = `${size}rem`;
      span.style.opacity = opacity;
      notesContainer.appendChild(span);
      bgNotes.push({ el: span, speed: speed });
    }
  }

  /* CUSTOM CURSOR & RAF LOOP */
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  const hasCursor = cursor && cursorDot && window.matchMedia('(min-width: 900px)').matches;
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2, cx = mouseX, cy = mouseY, currentScrollY = window.scrollY;

  if (hasCursor) {
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
    // Updated selectors to include .btn-solution and .solution-card
    document.querySelectorAll('a, button, .studio-card, .port-item, .price-card, .channel, .btn-solution, .solution-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  const animate = () => {
    if (hasCursor) {
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      cx += (mouseX - cx) * 0.18; cy += (mouseY - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    }
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

  /* NAV SCROLL */
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

  /* MOBILE MENU */
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

  /* REVEAL ON SCROLL */
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

  /* TILT EFFECT */
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
    card.addEventListener('mouseleave', () => { cancelAnimationFrame(raf); card.style.transform = ''; });
  });

  /* ONE STOP SOLUTION ACCORDION LOGIC */
  const solBtn = document.getElementById('solutionToggleBtn');
  const solAccordion = document.getElementById('solutionAccordion');
  if (solBtn && solAccordion) {
    solBtn.addEventListener('click', () => {
      solBtn.classList.toggle('active');
      solAccordion.classList.toggle('open');
    });
  }

  /* SMOOTH SCROLL OFFSET */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 60;
          window.scrollTo({ top, behavior: 'smooth' });
          history.pushState(null, null, id);
        }
      }
    });
  });

  /* PARALLAX ORBS */
  const orbs = document.querySelectorAll('.hero-orb');
  window.addEventListener('mousemove', (e) => {
    if (window.scrollY > 700) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 30, y = (e.clientY / window.innerHeight - 0.5) * 30;
    requestAnimationFrame(() => {
      orbs.forEach((o, i) => { const factor = (i + 1) * 0.5; o.style.transform = `translate(${x * factor}px, ${y * factor}px)`; });
    });
  }, { passive: true });

  /* YOUTUBE MARQUEE TOGGLE */
  const mToggleBtn = document.getElementById('marqueeToggle');
  const mTrack = document.getElementById('marqueeTrack');
  const mToggleText = document.getElementById('marqueeToggleText');
  const mToggleIcon = document.getElementById('marqueeIcon');
  if (mToggleBtn && mTrack) {
    mToggleBtn.addEventListener('click', () => {
      const isPaused = mTrack.classList.toggle('paused');
      mToggleText.textContent = isPaused ? 'Play' : 'Pause';
      mToggleIcon.innerHTML = isPaused ? '<path d="M8 5v14l11-7z"/>' : '<path d="M6 4h4v16H6zm8 0h4v16h-4z"/>';
    });
  }
})();

/* CONTACT FORM */
function handleContact(e) {
  e.preventDefault();
  const form = e.target, btn = form.querySelector('button[type="submit"]'), orig = btn.innerHTML;
  btn.innerHTML = 'Sending…'; btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '✓ Sent — We\'ll reply on WhatsApp';
    btn.style.background = '#25d366'; btn.style.color = '#fff';
    form.reset();
    setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.color = ''; btn.disabled = false; }, 3200);
  }, 1100);
  return false;
}
