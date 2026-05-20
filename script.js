/* ===========================================================
   MIDDLE CLASS MUSICIANS — SFX, Haptics & Anti-Lag Logic
   (Deployment & Minifier Safe Version)
   =========================================================== */

(() => {
  'use strict';

  window.scrollTo(0, 0);

  window.addEventListener('load', () => {
    setTimeout(() => {
      const pl = document.getElementById('preloader');
      if (pl) {
        pl.classList.add('done');
      }
    }, 1500); 
  });

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* =========================================================
     WEB AUDIO API & HAPTIC ENGINE
  ========================================================= */
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContextClass();
  
  function triggerHaptic() {
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
  }

  function playSound(type) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    if (type === 'hover') {
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); 
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } 
    else if (type === 'type') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300 + Math.random() * 50, audioCtx.currentTime);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    }
    else if (type === 'tick') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, audioCtx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    }
    else if (type === 'theme') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    }
    else if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.1); // C#
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2); // E
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    }
    else {
      // Default Click
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(440 + Math.random() * 220, audioCtx.currentTime); 
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    }
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
  }

  // Bind SFX to elements
  document.querySelectorAll('[data-sound="hover"]').forEach(el => {
    el.addEventListener('mouseenter', () => { playSound('hover'); });
    el.addEventListener('pointerdown', () => { triggerHaptic(); playSound('click'); });
  });

  document.querySelectorAll('[data-sound="click"]').forEach(el => {
    el.addEventListener('pointerdown', () => { triggerHaptic(); playSound('click'); });
  });

  document.querySelectorAll('.haptic-input').forEach(el => {
    el.addEventListener('input', () => { playSound('type'); });
  });

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('pointerdown', () => {
      triggerHaptic(); 
      playSound('send');
    });
  }

  /* THEME TOGGLE ENGINE */
  const themeBtn = document.getElementById('themeToggle');
  const themes = ['theme-night', 'theme-day', 'theme-realm'];
  let currentThemeIndex = 0;

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      playSound('theme');
      document.body.classList.remove(themes[currentThemeIndex]);
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      document.body.classList.add(themes[currentThemeIndex]);
    });
  }

  /* =========================================================
     PREMIUM VANILLA JS NOTES (Anti-Lag + Drift Math)
  ========================================================= */
  const notesContainer = document.getElementById('bg-notes');
  const bgNotes = [];
  let winHeight = window.innerHeight;
  let winWidth = window.innerWidth;
  
  window.addEventListener('resize', () => {
    winHeight = window.innerHeight;
    winWidth = window.innerWidth;
  }, { passive: true });

  if (notesContainer) {
    const symbols = ['♪', '♫', '♩', '♬', '♭', '♮'];
    for (let i = 0; i < 30; i++) { 
      const span = document.createElement('span');
      span.className = 'music-note';
      span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      
      const left = Math.random() * 100;
      span.style.left = `${left}vw`;
      span.style.fontSize = `${Math.random() * 2 + 1}rem`;
      
      const speed = Math.random() * 0.4 + 0.1;
      const initialY = Math.random() * (winHeight * 1.5); 
      const driftSpeed = Math.random() * 0.02 + 0.005;
      const offsetPhase = Math.random() * Math.PI * 2;
      
      notesContainer.appendChild(span);
      bgNotes.push({ el: span, speed: speed, initialY: initialY, driftSpeed: driftSpeed, offsetPhase: offsetPhase });
    }
  }

  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  const hasCursor = cursor && cursorDot && window.matchMedia('(min-width: 900px)').matches;
  let mouseX = winWidth / 2, mouseY = winHeight / 2, cx = mouseX, cy = mouseY;
  let currentScrollY = window.scrollY;

  if (hasCursor) {
    document.addEventListener('mousemove', e => { 
      mouseX = e.clientX; 
      mouseY = e.clientY; 
    }, { passive: true });
    
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

  if (document.fonts && document.fonts.ready) {
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
          const endDrag = () => { 
            isDraggingCurve = false; 
            curveDirection = curveVelocity > 0 ? 'right' : 'left'; 
            curveJacket.style.cursor = 'grab'; 
          };
          curveJacket.addEventListener('pointerup', endDrag);
          curveJacket.addEventListener('pointercancel', endDrag);
        }
      }
    });
  }

  /* 3D PARABOLIC YOUTUBE SLIDER (FIXED) */
  const mTrack = document.getElementById('marqueeTrack');
  const mContainer = document.getElementById('marqueeContainer');
  const mPrevBtn = document.getElementById('marqueePrev');
  const mNextBtn = document.getElementById('marqueeNext');
  
  let mTargetOffset = 0, mCurrentOffset = 0;
  let isMDragging = false, mDidDrag = false, mStartX = 0;
  let mAutoVelocity = 1;
  let mIsPaused = false;
  let tileWidth = 0, halfTrackWidth = 0;
  let tiles = [];
  let mInteractionTimeout;

  const resetAutoPlay = () => {
    clearTimeout(mInteractionTimeout);
    mIsPaused = true;
    mInteractionTimeout = setTimeout(() => {
      if (!isMDragging) mIsPaused = false;
    }, 1000); 
  };

  if (mTrack && mContainer) {
    mTrack.innerHTML += mTrack.innerHTML;
    tiles = Array.from(mTrack.children);

    // FIX: Only prevent native <a> routing if the user dragged
    tiles.forEach(tile => {
      tile.addEventListener('click', (e) => {
        if (mDidDrag) {
          e.preventDefault();
        }
      });
    });

    setTimeout(() => { 
      halfTrackWidth = mTrack.scrollWidth / 2; 
      if (tiles.length > 0) tileWidth = tiles[0].getBoundingClientRect().width + 24; 
    }, 500);

    mContainer.addEventListener('pointerdown', (e) => {
      if(e.target.closest('.side-control')) return; 
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

    if (mPrevBtn) {
      mPrevBtn.addEventListener('click', () => { mTargetOffset += (tileWidth || 384); resetAutoPlay(); });
    }
    if (mNextBtn) {
      mNextBtn.addEventListener('click', () => { mTargetOffset -= (tileWidth || 384); resetAutoPlay(); });
    }
  }

  /* UNIFIED RENDER LOOP */
  let animationTime = 0;

  const animate = () => {
    animationTime += 1;

    if (hasCursor && cursorDot && cursor) {
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      cx += (mouseX - cx) * 0.18; 
      cy += (mouseY - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    }
    
    if (bgNotes.length > 0) {
      currentScrollY += (window.scrollY - currentScrollY) * 0.15; 
      const wrapHeight = winHeight * 1.5;
      
      for (let i = 0; i < bgNotes.length; i++) {
        let note = bgNotes[i];
        let currentY = note.initialY - (currentScrollY * note.speed);
        let loopedY = ((currentY % wrapHeight) + wrapHeight) % wrapHeight;
        loopedY -= winHeight * 0.25; 
        
        let driftX = Math.sin((animationTime * note.driftSpeed) + note.offsetPhase) * 20;
        
        note.el.style.transform = `translate3d(${driftX}px, ${loopedY - note.initialY}px, 0)`;
      }
    }

    if (!isDraggingCurve && curveSpacing > 0 && curvedTextPath) {
      const delta = curveDirection === 'right' ? curveSpeed : -curveSpeed;
      curveOffset += delta;
      if (curveOffset <= -curveSpacing) curveOffset += curveSpacing;
      if (curveOffset > 0) curveOffset -= curveSpacing;
      curvedTextPath.setAttribute('startOffset', curveOffset + 'px');
    }

    if (mTrack && halfTrackWidth > 0 && mContainer) {
      if (!isMDragging && !mIsPaused) { 
        mTargetOffset -= mAutoVelocity; 
      }
      
      mCurrentOffset += (mTargetOffset - mCurrentOffset) * 0.1;
      
      if (mCurrentOffset <= -halfTrackWidth) {
        mCurrentOffset += halfTrackWidth; 
        mTargetOffset += halfTrackWidth;
      } else if (mCurrentOffset > 0) {
        mCurrentOffset -= halfTrackWidth; 
        mTargetOffset -= halfTrackWidth;
      }
      
      mTrack.style.transform = `translate3d(${mCurrentOffset}px, 0, 0)`;

      const containerWidth = mContainer.offsetWidth; 
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
  if (nav) {
    window.addEventListener('scroll', () => { 
      nav.classList.toggle('scrolled', window.scrollY > 60); 
    }, { passive: true });
  }

  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => { 
      toggle.classList.toggle('active'); 
      mobileMenu.classList.toggle('open'); 
    });
    const mobileLinks = mobileMenu.querySelectorAll('a');
    for (let i = 0; i < mobileLinks.length; i++) {
      mobileLinks[i].addEventListener('click', () => { 
        toggle.classList.remove('active'); 
        mobileMenu.classList.remove('open'); 
      });
    }
  }

  const reveals = document.querySelectorAll('.reveal');
  if (window.IntersectionObserver) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => { 
        if (entry.isIntersecting) { 
          entry.target.classList.add('visible'); 
          io.unobserve(entry.target); 
        } 
      });
    }, { threshold: 0.12 });
    reveals.forEach(r => io.observe(r));
  } else {
    reveals.forEach(r => r.classList.add('visible'));
  }

  // FIX: AUDIO THROTTLED STATS OBSERVER
  const statNumbers = document.querySelectorAll('.stat-number');
  if (window.IntersectionObserver) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = +entry.target.getAttribute('data-count');
          let count = 0; 
          const increment = target / 50; 
          let lastTick = 0; 

          const updateCount = () => {
            count += increment;
            
            if (audioCtx.state === 'running' && audioCtx.currentTime - lastTick > 0.04) {
                playSound('tick');
                lastTick = audioCtx.currentTime;
            }

            if (count < target) { 
              entry.target.innerText = Math.ceil(count); 
              requestAnimationFrame(updateCount); 
            } else { 
              entry.target.innerText = target; 
              setTimeout(() => playSound('send'), 100); 
            }
          };
          updateCount();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.7 });
    statNumbers.forEach(num => statsObserver.observe(num));
  }

  const solBtn = document.getElementById('solutionToggleBtn');
  const solAccordion = document.getElementById('solutionAccordion');
  if (solBtn && solAccordion) { 
    solBtn.addEventListener('click', () => { 
      solBtn.classList.toggle('active'); 
      solAccordion.classList.toggle('open'); 
    }); 
  }

  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  for (let i = 0; i < anchorLinks.length; i++) {
    anchorLinks[i].addEventListener('click', (e) => {
      const id = anchorLinks[i].getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' });
        }
      }
    });
  }

})();

// Global function for the form
window.handleContact = function(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return false;
  
  const orig = btn.innerHTML;
  const inputs = form.querySelectorAll('input, select, textarea');
  
  if (inputs.length < 4) return false;

  const name = inputs[0].value.trim();
  const contact = inputs[1].value.trim();
  const service = inputs[2].value;
  const message = inputs[3].value.trim();

  if (!name || !contact) {
    btn.innerHTML = 'Please fill required fields';
    btn.style.background = '#ea4335';
    setTimeout(() => { 
      btn.innerHTML = orig; 
      btn.style.background = ''; 
    }, 2000);
    return false;
  }

  btn.innerHTML = 'Opening WhatsApp…'; 
  btn.disabled = true;

  setTimeout(() => {
    const waText = '*New Studio Enquiry*\n\n*Name:* ' + name + '\n*Contact:* ' + contact + '\n*Service Required:* ' + (service || 'Not Specified') + '\n*Message:* ' + (message || 'No additional details provided.');
    const encodedText = encodeURIComponent(waText);
    const mcmPhone = "919315778147"; 
    const waURL = 'https://wa.me/' + mcmPhone + '?text=' + encodedText;

    btn.innerHTML = '✓ Redirecting...';
    btn.style.background = '#25d366'; 
    btn.style.color = '#fff';

    window.open(waURL, '_blank');

    form.reset();
    setTimeout(() => { 
      btn.innerHTML = orig; 
      btn.style.background = ''; 
      btn.style.color = ''; 
      btn.disabled = false; 
    }, 3200);
  }, 800);

  return false;
};
