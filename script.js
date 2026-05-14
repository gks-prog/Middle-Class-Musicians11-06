/* ===========================================================
   MIDDLE CLASS MUSICIANS — SFX, Haptics & Anti-Lag Logic
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

  /* =========================================================
     NEW: WEB AUDIO API & HAPTIC ENGINE
     Synthesizes a premium electric piano/rhodes click
  ========================================================= */
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  function triggerHaptic() {
    if (navigator.vibrate) navigator.vibrate(15);
  }

  function playPluck() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine'; // Smooth tone
    osc.frequency.setValueAtTime(440 + Math.random() * 220, audioCtx.currentTime); 
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  }

  // Bind SFX and Haptics to all interactive elements
  document.querySelectorAll('a, button, .studio-card, .solution-card, .marquee-tile, .testi-card').forEach(el => {
    el.addEventListener('pointerdown', () => {
      triggerHaptic();
      playPluck();
    });
  });

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

  /* =========================================================
     FIX: PREMIUM VANILLA JS NOTES (Anti-Lag + Drift Math)
  ========================================================= */
  const notesContainer = document.getElementById('bg-notes');
  const bgNotes = [];
  // Cache window height to prevent expensive DOM reads in RAF loop
  let winHeight = window.innerHeight;
  let winWidth = window.innerWidth;
  
  window.addEventListener('resize', () => {
    winHeight = window.innerHeight;
    winWidth = window.innerWidth;
  }, { passive: true });

  if (notesContainer) {
    const symbols = ['♪', '♫', '♩', '♬', '♭', '♮'];
    for (let i = 0; i < 30; i++) { // Reduced count slightly for performance overhead
      const span = document.createElement('span');
      span.className = 'music-note';
      span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      
      const left = Math.random() * 100;
      span.style.left = `${left}vw`;
      span.style.fontSize = `${Math.random() * 2 + 1}rem`;
      
      // Setup physics variables
      const speed = Math.random() * 0.4 + 0.1;
      const initialY = Math.random() * (winHeight * 1.5); 
      const driftSpeed = Math.random() * 0.02 + 0.005;
      const offsetPhase = Math.random() * Math.PI * 2;
      
      notesContainer.appendChild(span);
      bgNotes.push({ el: span, speed, initialY, driftSpeed, offsetPhase });
    }
  }

  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  const hasCursor = cursor && cursorDot && window.matchMedia('(min-width: 900px)').matches;
  let mouseX = winWidth / 2, mouseY = winHeight / 2, cx = mouseX, cy = mouseY;
  let currentScrollY = window.scrollY;

  if (hasCursor) {
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
    document.querySelectorAll('a, button, .studio-card, .btn-solution, .solution-card, .curved-loop-jacket, .marquee-container').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  /* CURVED TAPE LOGIC (HERO) */
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

    // Click router
    tiles.forEach(tile => {
      tile.addEventListener('pointerup', (e) => {
        if (!mDidDrag && tile.dataset.url) {
          window.open(tile.dataset.url, '_blank');
        }
      });
    });

    setTimeout(() => { 
      halfTrackWidth = mTrack.scrollWidth / 2; 
      tileWidth = tiles[0].getBoundingClientRect().width + 24; 
    }, 500);

    mContainer.addEventListener('pointerdown', (e) => {
      isMDragging = true; mStartX = e.clientX; mDidDrag = false;
      mContainer.setPointerCapture(e.pointerId);
      clearTimeout(mInteractionTimeout);
      mIsPaused = true;
    });
    
    mContainer.addEventListener('pointermove', (e) => {
      if (!isMDragging) return;
      const dx = e.clientX - mStartX; 
      if (Math.abs(dx) > 3) mDidDrag = true; 
      mStartX = e.clientX;
      mTargetOffset += dx * 1.5; 
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
  let animationTime = 0;

  const animate = () => {
    animationTime += 1;

    // 1. Cursor
    if (hasCursor) {
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      cx += (mouseX - cx) * 0.18; cy += (mouseY - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    }
    
    // 2. Parallax Notes (With Anti-Lag Math & Sinusoidal Drift)
    if (bgNotes.length > 0) {
      currentScrollY += (window.scrollY - currentScrollY) * 0.15; 
      const wrapHeight = winHeight * 1.5;
      
      for (let i = 0; i < bgNotes.length; i++) {
        let note = bgNotes[i];
        let currentY = note.initialY - (currentScrollY * note.speed);
        let loopedY = ((currentY % wrapHeight) + wrapHeight) % wrapHeight;
        loopedY -= winHeight * 0.25; 
        
        // Horizontal drift calculation
        let driftX = Math.sin((animationTime * note.driftSpeed) + note.offsetPhase) * 20;
        
        note.el.style.transform = `translate3d(${driftX}px, ${loopedY - note.initialY}px, 0)`;
      }
    }

    // 3. Curved Hero Text
    if (!isDraggingCurve && curveSpacing > 0) {
      const delta = curveDirection === 'right' ? curveSpeed : -curveSpeed;
      curveOffset += delta;
      if (curveOffset <= -curveSpacing) curveOffset += curveSpacing;
      if (curveOffset > 0) curveOffset -= curveSpacing;
      curvedTextPath.setAttribute('startOffset', curveOffset + 'px');
    }

    // 4. Parabolic 3D Video Slider
    if (mTrack && halfTrackWidth > 0) {
      if (!isMDragging && !mIsPaused) { mTargetOffset -= mAutoVelocity; }
      
      mCurrentOffset += (mTargetOffset - mCurrentOffset) * 0.1;
      
      if (mCurrentOffset <= -halfTrackWidth) {
        mCurrentOffset += halfTrackWidth; mTargetOffset += halfTrackWidth;
      } else if (mCurrentOffset > 0) {
        mCurrentOffset -= halfTrackWidth; mTargetOffset -= halfTrackWidth;
      }
      
      mTrack.style.transform = `translate3d(${mCurrentOffset}px, 0, 0)`;

      const containerWidth = mContainer.offsetWidth; // Use local width instead of heavy BoundingRect
      const centerX = containerWidth / 2;
      
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
