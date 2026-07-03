/* ============================================================
   NABILA'S BIRTHDAY — SCRIPT.JS
   Handles: Loading sequence, Particle canvas, Heart dots,
            Scroll reveal, Smooth section transitions
   ============================================================ */

'use strict';

/* ============================================================
   DOM REFS
   ============================================================ */
const secOpening  = document.getElementById('section-opening');
const secLoading  = document.getElementById('section-loading');
const secHero     = document.getElementById('section-hero');
const secMemories = document.getElementById('section-memories');
const secWishes   = document.getElementById('section-wishes');

const btnUnwrap   = document.getElementById('btn-unwrap');
const btnSeeMore  = document.getElementById('btn-see-more');
const btnJourney  = document.getElementById('btn-journey');

const loadingArc  = document.getElementById('loading-progress-circle');
const loadingPct  = document.getElementById('loading-percent');
const canvas      = document.getElementById('particle-canvas');
const heartDots   = document.getElementById('heart-dots');

/* ============================================================
   HELPERS
   ============================================================ */
function showSection(el) {
  el.classList.add('active-section');
}

function hideSection(el) {
  el.classList.remove('active-section');
}

function revealScrollSections() {
  [secMemories, secWishes].forEach(sec => {
    sec.classList.add('revealed');
  });
}

/* ============================================================
   SECTION 1 → 2: LOADING SEQUENCE
   ============================================================ */
const CIRCUMFERENCE = 2 * Math.PI * 50; // r=50 → 314.16

function runLoading() {
  let progress = 0;
  const duration = 3000; // 3 seconds
  const interval = 30;   // tick every 30ms
  const step = 100 / (duration / interval);

  const ticker = setInterval(() => {
    progress = Math.min(progress + step, 100);
    const pct = Math.round(progress);

    // Update percentage text
    loadingPct.textContent = pct + '%';

    // Update SVG arc
    const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;
    loadingArc.style.strokeDashoffset = offset;

    if (progress >= 100) {
      clearInterval(ticker);
      // Short pause at 100%, then reveal hero
      setTimeout(transitionToHero, 300);
    }
  }, interval);
}

function transitionToHero() {
  // Fade out loading
  hideSection(secLoading);

  // Slight delay, then show hero
  setTimeout(() => {
    secHero.classList.add('revealed');
    initParticles();
    revealScrollSections();
    initScrollReveal();
  }, 600);
}

// Kick off loading on button click
btnUnwrap.addEventListener('click', () => {
  hideSection(secOpening);
  setTimeout(() => {
    showSection(secLoading);
    runLoading();
  }, 400);
});

/* ============================================================
   HERO → MEMORIES scroll helper
   ============================================================ */
btnSeeMore.addEventListener('click', () => {
  secMemories.scrollIntoView({ behavior: 'smooth' });
});

btnJourney.addEventListener('click', () => {
  // Placeholder — scroll to top as a loop
  secOpening.scrollIntoView({ behavior: 'smooth' });
});

/* ============================================================
   SECTION 3: PARTICLE CANVAS
   ============================================================ */
function initParticles() {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height + canvas.height;
      this.size  = Math.random() * 3 + 1;
      this.speedY = -(Math.random() * 1.2 + 0.5);
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.alpha  = Math.random() * 0.7 + 0.3;
      this.decay  = Math.random() * 0.004 + 0.002;
      // random shapes: round or diamond
      this.shape  = Math.random() > 0.5 ? 'round' : 'diamond';
      // subtle color tones — all near-white
      const tones = ['255,255,255', '220,220,220', '200,200,200', '240,240,240'];
      this.color  = tones[Math.floor(Math.random() * tones.length)];
    }

    update() {
      this.y     += this.speedY;
      this.x     += this.speedX;
      this.alpha -= this.decay;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = `rgba(${this.color}, 1)`;
      ctx.beginPath();

      if (this.shape === 'round') {
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      } else {
        // diamond
        const s = this.size * 1.4;
        ctx.moveTo(this.x, this.y - s);
        ctx.lineTo(this.x + s, this.y);
        ctx.lineTo(this.x, this.y + s);
        ctx.lineTo(this.x - s, this.y);
        ctx.closePath();
      }

      ctx.fill();
      ctx.restore();
    }

    isDead() {
      return this.alpha <= 0 || this.y < -20;
    }
  }

  function spawnBurst() {
    const count = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn continuously
    if (Math.random() < 0.4) spawnBurst();

    particles = particles.filter(p => !p.isDead());
    particles.forEach(p => { p.update(); p.draw(); });

    // Cap particles to avoid memory growth
    if (particles.length > 260) particles.splice(0, 20);

    animId = requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener('resize', resize);

  // Initial burst
  for (let i = 0; i < 60; i++) {
    const p = new Particle();
    p.y = Math.random() * canvas.height;
    particles.push(p);
  }

  animate();

  // Stop animation if section hidden to save perf
  function stopParticles() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  }

  // Expose for cleanup
  window._stopParticles = stopParticles;
}

/* ============================================================
   SECTION 5: HEART DOTS
   ============================================================ */
function buildHeartDots() {
  if (!heartDots) return;

  const W = 260;
  const H = 260;
  const cx = W / 2;
  const cy = H / 2 + 10;

  // Parametric heart: x = 16 sin^3(t), y = -(13cos - 5cos2t - 2cos3t - cos4t)
  const scale = 9.5;
  const totalDots = 80;
  const dots = [];

  for (let i = 0; i < totalDots; i++) {
    const t = (i / totalDots) * 2 * Math.PI;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

    const x = cx + hx * scale;
    const y = cy + hy * scale;
    dots.push({ x, y, delay: (i / totalDots) * 2.4 });
  }

  dots.forEach(d => {
    const dot = document.createElement('div');
    dot.className = 'heart-dot';
    dot.style.left = d.x + 'px';
    dot.style.top  = d.y + 'px';
    dot.style.animationDelay = d.delay + 's';
    heartDots.appendChild(dot);
  });
}

buildHeartDots();

/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   ============================================================ */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

/* ============================================================
   KEYBOARD ACCESSIBILITY — Enter on buttons
   ============================================================ */
[btnUnwrap, btnSeeMore, btnJourney].forEach(btn => {
  if (!btn) return;
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
});
