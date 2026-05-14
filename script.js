/* ===========================================================
   MIDDLE CLASS MUSICIANS — Interactivity & Animations (Optimized)
   =========================================================== */

(() => {
  'use strict';

  window.scrollTo(0, 0);

  window.addEventListener('load', () => {
    setTimeout(() => {
      const pl = document.getElementById('preloader');
      if (pl) pl.classList.add('done');
    }, 1200); 
  });

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* VANILLA JS BACKGROUND NOTES (LINKED TO SCROLL) */
  const notesContainer = document.getElementById('bg-notes');
  const bgNotes = [];
  if (notesContainer) {
    const symbols = ['♪', '♫', '♩', '♬', '♭', '♮'];
    for (let i = 0; i < 25; i++) {
      const span = document.createElement('span');
      span.className = 'music-note';
      span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      const left = Math.random() * 100;
      const size = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.15 + 0.1; // Increased for visibility
      const speed = Math.random() * 0.6 + 0.2;
      const baseY = Math.random() * 100;
      span.style.left = `${left}%`;
      span.style.top = `${baseY}%`;
      span.style.fontSize = `${size}rem`;
      span.style.opacity = opacity;
      notesContainer.appendChild(span);
      bgNotes.push({ el: span, speed: speed });
    }
  }

  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  const hasCursor = cursor && cursorDot && window.matchMedia('(min-width: 900px)').matches;
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2, cx = mouseX, cy = mouseY;
  let currentScrollY = window.scrollY;

  if (hasCursor) {
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
    document.querySelectorAll('a, button, .studio-card, .port-item, .price-card, .btn-solution, .solution-card, .curved-loop-jacket').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  /* CURVED TAPE LOGIC */
  const curveJacket = document.getElementById('curvedLoopJacket');
  const measureText = document.getElementById('measureText');
  const curvedTextPath = document.getElementById('curvedTextPath');
  let curveOffset = 0, curveSpeed = 1.2, curveDirection = 'left', isDraggingCurve = false, lastCurveX = 0, curveVelocity = 0, curveSpacing = 0;

  document.fonts.ready.then(() => {
    if (curveJacket && measureText && curvedTextPath) {
      const baseText = measureText.textContent.trim() + ' ✦ ';
      curveSpacing = measureText.getComputedTextLength();
      if (curveSpacing > 0) {
        const repetitions = Math.ceil(2400 / curveSpacing) + 2;
        curvedTextPath.textContent = Array(repetitions).fill(baseText).join('');
        curveOffset = -curveSpacing;

        curveJacket.addEventListener('pointerdown', (e) => {
          isDraggingCurve = true; lastCurveX = e.clientX; curveVelocity = 0;
          curveJacket.setPointerCapture(e.pointerId);
          curveJacket.style.cursor = 'grabbing';
        });
        curveJacket.addEventListener('pointermove', (e) => {
          if (!isDraggingCurve) return;
          const dx = e.clientX - lastCurveX; lastCurveX = e.clientX; curveVelocity = dx;
          curveOffset += dx;
          if (curveOffset <= -curveSpacing) curveOffset += curveSpacing;
          if (curveOffset > 0) curveOffset -= curveSpacing;
          curvedTextPath.setAttribute('startOffset', curveOffset + 'px');
        });
        const endDrag = () => { isDraggingCurve = false; curveDirection = curveVelocity > 0 ? 'right' : 'left'; curveJacket.style.cursor = 'grab'; };
        curveJacket.addEventListener('pointerup', endDrag);
        curveJacket.addEventListener('pointercancel', endDrag);
      }
    }
  });

  const animate = () => {
    if (hasCursor) {
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      cx += (mouseX - cx) * 0.18; cy += (mouseY - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    }
    
    // Notes Scroll Rendering
    currentScrollY += (window.scrollY - currentScrollY) * 0.15; // Smooth scroll damping
    if (bgNotes.length > 0) {
      for (let i = 0; i < bgNotes.length; i++) {
        const yPos = -(currentScrollY * bgNotes[i].speed);
        bgNotes[i].el.style.transform = `translate3d(0, ${yPos}px, 0)`;
      }
    }

    if (!isDraggingCurve && curveSpacing > 0) {
      const delta = curveDirection === 'right' ? curveSpeed : -curveSpeed;
      curveOffset += delta;
      if (curveOffset <= -curveSpacing) curveOffset += curveSpacing;
      if (curveOffset > 0) curveOffset -= curveSpacing;
      curvedTextPath.setAttribute('startOffset', curveOffset + 'px');
    }
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);

  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 60); }, { passive: true });

  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => { toggle.classList.toggle('active'); mobileMenu.classList.toggle('open'); });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { toggle.classList.remove('active'); mobileMenu.classList.remove('open'); }));
  }

  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); } });
  }, { threshold: 0.12 });
  reveals.forEach(r => io.observe(r));

  /* SCROLL-LINKED STATS COUNTER */
  const statNumbers = document.querySelectorAll('.stat-number');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = +entry.target.getAttribute('data-count');
        let count = 0; const increment = target / 50; 
        const updateCount = () => {
          count += increment;
          if (count < target) { entry.target.innerText = Math.ceil(count); requestAnimationFrame(updateCount); } 
          else { entry.target.innerText = target; }
        };
        updateCount();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.7 });
  statNumbers.forEach(num => statsObserver.observe(num));

  const solBtn = document.getElementById('solutionToggleBtn');
  const solAccordion = document.getElementById('solutionAccordion');
  if (solBtn && solAccordion) { solBtn.addEventListener('click', () => { solBtn.classList.toggle('active'); solAccordion.classList.toggle('open'); }); }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' });
        }
      }
    });
  });

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
