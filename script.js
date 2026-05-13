/* ===========================================================
   MIDDLE CLASS MUSICIANS — Interactivity & Animations
   =========================================================== */

(() => {
  'use strict';

  /* ----- PRELOADER ----- */
  window.addEventListener('load', () => {
    setTimeout(() => {
      const pl = document.getElementById('preloader');
      if (pl) pl.classList.add('done');
    }, 900);
  });

  /* ----- YEAR ----- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- CUSTOM CURSOR ----- */
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  if (cursor && cursorDot && window.matchMedia('(min-width: 900px)').matches) {
    let mouseX = 0, mouseY = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });
    const animate = () => {
      cx += (mouseX - cx) * 0.18;
      cy += (mouseY - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(animate);
    };
    animate();
    document.querySelectorAll('a, button, .studio-card, .port-item, .service-row, .price-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  /* ----- NAV SCROLL ----- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
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
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ----- PORTFOLIO FILTER ----- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portItems = document.querySelectorAll('.port-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      portItems.forEach(item => {
        const show = filter === 'all' || item.dataset.cat === filter;
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
          if (show) {
            item.classList.remove('hidden');
            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            });
          } else {
            item.classList.add('hidden');
          }
        }, 200);
      });
    });
  });

  /* ----- SMOOTH SCROLL OFFSET ----- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 60;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  /* ----- PARALLAX ORBS ----- */
  const orbs = document.querySelectorAll('.hero-orb');
  window.addEventListener('mousemove', (e) => {
    if (window.scrollY > 700) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    orbs.forEach((o, i) => {
      const factor = (i + 1) * 0.5;
      o.style.translate = `${x * factor}px ${y * factor}px`;
    });
  });

})();

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
