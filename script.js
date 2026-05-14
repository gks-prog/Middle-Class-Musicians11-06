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

  /* FIX: WRAPPING BACKGROUND NOTES */
  const notesContainer = document.getElementById('bg-notes');
  const bgNotes = [];
  if (notesContainer) {
    const symbols = ['♪', '♫', '♩', '♬', '♭', '♮'];
    for (let i = 0; i < 40; i++) { // Increased count
      const span = document.createElement('span');
      span.className = 'music-note';
      span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      span.style.left = `${Math.random() * 100}vw`;
      span.style.fontSize = `${Math.random() * 2 + 1}rem`;
      
      const speed = Math.random() * 0.4 + 0.1;
      const initialY = Math.random() * (window.innerHeight * 1.5); // Spread over 1.5 screens
      
      notesContainer.appendChild(span);
      bgNotes.push({ el: span, speed: speed, initialY: initialY });
    }
  }

  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  const hasCursor = cursor && cursorDot && window.matchMedia('(min-width: 900px)').matches;
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2, cx = mouseX, cy = mouseY;
  let currentScrollY = window.scrollY;

  if (hasCursor) {
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
    document.querySelectorAll('a, button, .studio-card, .btn-solution, .solution-card, .curved-loop-jacket, .marquee-container').forEach(el => {
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

  /* FIX: DRAGGABLE YOUTUBE MARQUEE JS PHYSICS */
  const mTrack = document.getElementById('marqueeTrack');
  const mContainer = document.querySelector('.marquee-container');
  const mToggleBtn = document.getElementById('marqueeToggle');
  const mToggleText = document.getElementById('marqueeToggleText');
  const mToggleIcon = document.getElementById('marqueeIcon');
  
  let mOffset = 0;
  let isMDragging = false;
  let mStartX = 0;
  let mAutoVelocity = 0.8;
  let mCurrentVelocity = mAutoVelocity;
  let mIsPaused = false;
  let halfTrackWidth = 0;

  if (mTrack && mContainer) {
    // Clone tiles purely in JS so we have infinite scroll width
    mTrack.innerHTML += mTrack.innerHTML;
    
    // Calculate width after images render
    setTimeout(() => {
      halfTrackWidth = mTrack.scrollWidth / 2;
    }, 500);

    mContainer.addEventListener('pointerdown', (e) => {
      isMDragging = true;
      mStartX = e.clientX;
      mContainer.setPointerCapture(e.pointerId);
      mCurrentVelocity = 0; // Stop auto-scroll during drag
    });
    
    mContainer.addEventListener('pointermove', (e) => {
      if (!isMDragging) return;
      const dx = e.clientX - mStartX;
      mStartX = e.clientX;
      mOffset += dx;
    });

    const endMDrag = () => {
      isMDragging = false;
      mCurrentVelocity = mIsPaused ? 0 : mAutoVelocity;
    };

    mContainer.addEventListener('pointerup', endMDrag);
    mContainer.addEventListener('pointercancel', endMDrag);

    // Toggle Button Logic
    if(mToggleBtn) {
      mToggleBtn.addEventListener('click', () => {
        mIsPaused = !mIsPaused;
        mCurrentVelocity = mIsPaused ? 0 : mAutoVelocity;
        mToggleText.textContent = mIsPaused ? 'Play' : 'Pause';
        mToggleIcon.innerHTML = mIsPaused ? '<path d="M8 5v14l11-7z"/>' : '<path d="M6 4h4v16H6zm8 0h4v16h-4z"/>';
      });
    }
  }

  /* UNIFIED RENDER LOOP */
  const animate = () => {
    // 1. Cursor Physics
    if (hasCursor) {
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      cx += (mouseX - cx) * 0.18; cy += (mouseY - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    }
    
    // 2. Wrap-Around Notes Physics
    if (bgNotes.length > 0) {
      currentScrollY += (window.scrollY - currentScrollY) * 0.15; 
      const wrapHeight = window.innerHeight * 1.5;
      
      for (let i = 0; i < bgNotes.length; i++) {
        let note = bgNotes[i];
        let currentY = note.initialY - (currentScrollY * note.speed);
        
        // Modulo math to perfectly loop notes top to bottom
        let loopedY = ((currentY % wrapHeight) + wrapHeight) % wrapHeight;
        loopedY -= window.innerHeight * 0.25; // Offset so they spawn off-screen
        
        note.el.style.transform = `translate3d(0, ${loopedY - note.initialY}px, 0)`;
      }
    }

    // 3. Curved Loop Physics
    if (!isDraggingCurve && curveSpacing > 0) {
      const delta = curveDirection === 'right' ? curveSpeed : -curveSpeed;
      curveOffset += delta;
      if (curveOffset <= -curveSpacing) curveOffset += curveSpacing;
      if (curveOffset > 0) curveOffset -= curveSpacing;
      curvedTextPath.setAttribute('startOffset', curveOffset + 'px');
    }

    // 4. Horizontal Marquee Physics
    if (mTrack && halfTrackWidth > 0) {
      if (!isMDragging) {
        mOffset -= mCurrentVelocity;
      }
      // Wrap logic
      if (mOffset <= -halfTrackWidth) mOffset += halfTrackWidth;
      if (mOffset > 0) mOffset -= halfTrackWidth;
      
      mTrack.style.transform = `translate3d(${mOffset}px, 0, 0)`;
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
