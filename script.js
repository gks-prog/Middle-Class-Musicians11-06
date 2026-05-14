/* ===========================================================
   MIDDLE CLASS MUSICIANS — Interactivity & Themes
   =========================================================== */

(() => {
  'use strict';

  window.scrollTo(0, 0);

  window.addEventListener('load', () => {
    setTimeout(() => {
      const pl = document.getElementById('preloader');
      if (pl) pl.classList.add('done');
    }, 1500); 
  });

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* THEME TOGGLE ENGINE */
  const themeBtn = document.getElementById('themeToggle');
  const themes = ['theme-night', 'theme-day', 'theme-realm'];
  let currentThemeIndex = 0;

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.remove(themes[currentThemeIndex]);
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      document.body.classList.add(themes[currentThemeIndex]);
    });
  }

  /* BACKGROUND NOTES */
  const notesContainer = document.getElementById('bg-notes');
  const bgNotes = [];
  if (notesContainer) {
    const symbols = ['♪', '♫', '♩', '♬', '♭', '♮'];
    for (let i = 0; i < 40; i++) {
      const span = document.createElement('span');
      span.className = 'music-note';
      span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      span.style.left = `${Math.random() * 100}vw`;
      span.style.fontSize = `${Math.random() * 2 + 1}rem`;
      const speed = Math.random() * 0.4 + 0.1;
      const initialY = Math.random() * (window.innerHeight * 1.5); 
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

  /* 3D PARABOLIC YOUTUBE SLIDER (Enhanced Touch/Swipe) */
  const mTrack = document.getElementById('marqueeTrack');
  const mContainer = document.getElementById('marqueeContainer');
  const mPrevBtn = document.getElementById('marqueePrev');
  const mNextBtn = document.getElementById('marqueeNext');
  const mToggleBtn = document.getElementById('marqueeToggle');
  const mToggleText = document.getElementById('marqueeToggleText');
  const mToggleIcon = document.getElementById('marqueeIcon');
  
  let mTargetOffset = 0;
  let mCurrentOffset = 0;
  let isMDragging = false;
  let mDidDrag = false;
  let mStartX = 0;
  let mAutoVelocity = 1;
  let mIsPaused = false;
  let tileWidth = 0;
  let halfTrackWidth = 0;
  let tiles = [];
  let mInteractionTimeout;

  const resetAutoPlay = () => {
    clearTimeout(mInteractionTimeout);
    mIsPaused = true;
    mInteractionTimeout = setTimeout(() => {
      if (!isMDragging) mIsPaused = false;
    }, 2000); 
  };

  if (mTrack && mContainer) {
    mTrack.innerHTML += mTrack.innerHTML;
    tiles = Array.from(mTrack.children);

    tiles.forEach(tile => {
      tile.addEventListener('pointerup', (e) => {
        if (!mDidDrag && tile.dataset.href) {
          window.open(tile.dataset.href, '_blank');
        }
      });
    });

    setTimeout(() => { 
      halfTrackWidth = mTrack.scrollWidth / 2; 
      tileWidth = tiles[0].getBoundingClientRect().width + 24; 
    }, 500);

    // Using pointer events handles both Mouse and Touch naturally
    mContainer.addEventListener('pointerdown', (e) => {
      isMDragging = true; mStartX = e.clientX; mDidDrag = false;
      mContainer.setPointerCapture(e.pointerId);
      clearTimeout(mInteractionTimeout);
      mIsPaused = true;
    });
    
    mContainer.addEventListener('pointermove', (e) => {
      if (!isMDragging) return;
      const dx = e.clientX - mStartX; 
      if (Math.abs(dx) > 3) mDidDrag = true; // Lowered threshold for mobile sensitivity
      mStartX = e.clientX;
      mTargetOffset += dx * 1.5; // Multiplier for faster swipe feel
    });

    const endMDrag = () => { isMDragging = false; resetAutoPlay(); };
    mContainer.addEventListener('pointerup', endMDrag);
    mContainer.addEventListener('pointercancel', endMDrag);

    mContainer.addEventListener('mouseenter', () => { mIsPaused = true; clearTimeout(mInteractionTimeout); });
    mContainer.addEventListener('mouseleave', () => { if (!isMDragging) resetAutoPlay(); });

    mContainer.addEventListener('click', (e) => { if (mDidDrag) { e.preventDefault(); e.stopPropagation(); } }, true); 

    if(mToggleBtn) {
      mToggleBtn.addEventListener('click', () => {
        mIsPaused = !mIsPaused;
        mToggleText.textContent = mIsPaused ? 'Play' : 'Pause';
        mToggleIcon.innerHTML = mIsPaused ? '<path d="M8 5v14l11-7z"/>' : '<path d="M6 4h4v16H6zm8 0h4v16h-4z"/>';
      });
    }

    if(mPrevBtn) mPrevBtn.addEventListener('click', () => { mTargetOffset += (tileWidth || 384); resetAutoPlay(); });
    if(mNextBtn) mNextBtn.addEventListener('click', () => { mTargetOffset -= (tileWidth || 384); resetAutoPlay(); });
  }

  /* UNIFIED RENDER LOOP */
  const animate = () => {
    if (hasCursor) {
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      cx += (mouseX - cx) * 0.18; cy += (mouseY - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    }
    
    if (bgNotes.length > 0) {
      currentScrollY += (window.scrollY - currentScrollY) * 0.15; 
      const wrapHeight = window.innerHeight * 1.5;
      for (let i = 0; i < bgNotes.length; i++) {
        let note = bgNotes[i];
        let currentY = note.initialY - (currentScrollY * note.speed);
        let loopedY = ((currentY % wrapHeight) + wrapHeight) % wrapHeight;
        loopedY -= window.innerHeight * 0.25; 
        note.el.style.transform = `translate3d(0, ${loopedY - note.initialY}px, 0)`;
      }
    }

    if (!isDraggingCurve && curveSpacing > 0) {
      const delta = curveDirection === 'right' ? curveSpeed : -curveSpeed;
      curveOffset += delta;
      if (curveOffset <= -curveSpacing) curveOffset += curveSpacing;
      if (curveOffset > 0) curveOffset -= curveSpacing;
      curvedTextPath.setAttribute('startOffset', curveOffset + 'px');
    }

    if (mTrack && halfTrackWidth > 0) {
      if (!isMDragging && !mIsPaused) { mTargetOffset -= mAutoVelocity; }
      
      mCurrentOffset += (mTargetOffset - mCurrentOffset) * 0.1;
      
      if (mCurrentOffset <= -halfTrackWidth) {
        mCurrentOffset += halfTrackWidth; mTargetOffset += halfTrackWidth;
      } else if (mCurrentOffset > 0) {
        mCurrentOffset -= halfTrackWidth; mTargetOffset -= halfTrackWidth;
      }
      
      mTrack.style.transform = `translate3d(${mCurrentOffset}px, 0, 0)`;

      const containerRect = mContainer.getBoundingClientRect();
      const centerX = containerRect.width / 2;
      
      for (let i = 0; i < tiles.length; i++) {
        let absolutePos = mCurrentOffset + (i * tileWidth);
        let tileCenter = absolutePos + (tileWidth / 2);
        let distFromCenter = tileCenter - centerX;
        
        let yOffset = Math.pow(distFromCenter * 0.002, 2) * 15; 
        let scale = Math.max(0.85, 1 - Math.abs(distFromCenter) * 0.00015);
        
        tiles[i].style.transform = `translateY(${yOffset}px) scale(${scale})`;
      }
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
  
  const inputs = form.querySelectorAll('input, select, textarea');
  const name = inputs[0].value.trim();
  const contact = inputs[1].value.trim();
  const service = inputs[2].value;
  const message = inputs[3].value.trim();

  if(!name || !contact) {
    btn.innerHTML = 'Please fill required fields';
    btn.style.background = '#ea4335';
    setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 2000);
    return false;
  }

  btn.innerHTML = 'Opening WhatsApp…'; 
  btn.disabled = true;

  setTimeout(() => {
    const waText = `*New Studio Enquiry*\n\n*Name:* ${name}\n*Contact:* ${contact}\n*Service Required:* ${service || 'Not Specified'}\n*Message:* ${message || 'No additional details provided.'}`;
    const encodedText = encodeURIComponent(waText);
    const mcmPhone = "919315778147"; 
    const waURL = `https://wa.me/${mcmPhone}?text=${encodedText}`;

    btn.innerHTML = '✓ Redirecting...';
    btn.style.background = '#25d366'; 
    btn.style.color = '#fff';

    window.open(waURL, '_blank');

    form.reset();
    setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.color = ''; btn.disabled = false; }, 3200);
  }, 800);

  return false;
}
