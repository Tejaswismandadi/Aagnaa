/* ═══════════════════════════════════════════════
   AGNA — Main JavaScript
═══════════════════════════════════════════════ */

// ─── Scroll animations ────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up, .fade-in, .scale-in, .slide-in-left')
  .forEach(el => observer.observe(el));

// ─── Nav scroll effect ────────────────────────
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ─── Active nav link ──────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
});

// ─── Chapter nav active ───────────────────────
const chapterItems = document.querySelectorAll('.chapter-nav-item[href^="#"]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  chapterItems.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
});

// ─── Tabs ─────────────────────────────────────
function initTabs(containerSelector) {
  document.querySelectorAll(containerSelector || '.tabs-container').forEach(container => {
    const btns = container.querySelectorAll('.tab-btn');
    const panels = container.querySelectorAll('.tab-panel');
    btns.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        panels[i].classList.add('active');
      });
    });
  });
}
initTabs();

// ─── Accordion ────────────────────────────────
function initAccordion(selector) {
  document.querySelectorAll(selector || '.accordion-item').forEach(item => {
    const header = item.querySelector('.accordion-header');
    const body = item.querySelector('.accordion-body');
    const icon = item.querySelector('.accordion-icon');
    if (!header || !body) return;
    header.addEventListener('click', () => {
      const open = body.style.display === 'block';
      body.style.display = open ? 'none' : 'block';
      if (icon) icon.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  });
}
initAccordion();

// ─── Counter animation ────────────────────────
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1500;
  const start = Date.now();
  const timer = setInterval(() => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = target * ease;
    el.textContent = prefix + (Number.isInteger(target) ? Math.round(current).toLocaleString() : current.toFixed(1)) + suffix;
    if (progress >= 1) clearInterval(timer);
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = '1';
      animateCounter(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ─── Bar chart animation ──────────────────────
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.bar-fill[data-width]').forEach(bar => {
        setTimeout(() => {
          bar.style.width = bar.dataset.width;
        }, 100);
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.bar-chart-wrap').forEach(el => barObserver.observe(el));

// ─── Network canvas ───────────────────────────
function drawSupplierNetwork(canvasId, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight || 340;
  canvas.width = W * 2;
  canvas.height = H * 2;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(2, 2);

  const {
    suppliers = [],
    animated = true,
    showLabels = true,
    filter = null
  } = options;

  // Draw connections
  suppliers.forEach(s => {
    ctx.beginPath();
    ctx.moveTo(W / 2, H / 2);
    ctx.lineTo(s.x, s.y);
    ctx.strokeStyle = s.critical
      ? 'rgba(163,45,45,0.3)'
      : s.conv
        ? 'rgba(83,74,183,0.25)'
        : 'rgba(255,255,255,0.06)';
    ctx.lineWidth = s.critical ? 1.2 : 0.6;
    ctx.stroke();
  });

  // Draw nodes
  suppliers.forEach(s => {
    const r = Math.max(6, Math.min(18, Math.sqrt(s.spend || 10) * 2.2));
    const color = s.priority === 'P1' ? '#A32D2D'
                : s.priority === 'P2' ? '#EF9F27'
                : '#1D9E75';

    if (s.conv) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, r + 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#534AB7';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (s.single) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, r + 2, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;

    if (showLabels) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = `${r < 10 ? 8 : 9}px Inter,sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`T${s.tier}`, s.x, s.y + 3);
    }
  });

  // OEM center
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#534AB7';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 9px Inter,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OEM', W / 2, H / 2);
  ctx.textBaseline = 'alphabetic';
}

// ─── Risk taxonomy toggle ─────────────────────
function initRiskTaxonomy() {
  document.querySelectorAll('.risk-cat-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.closest('.risk-cat').querySelector('.risk-cat-body');
      const icon = btn.querySelector('.toggle-icon');
      const open = body.style.display !== 'none';
      body.style.display = open ? 'none' : 'block';
      if (icon) icon.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  });

  document.querySelectorAll('.risk-row-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.closest('.risk-row').querySelector('.risk-detail');
      const icon = btn.querySelector('.row-icon');
      const open = body.classList.contains('open');
      body.classList.toggle('open', !open);
      if (icon) icon.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  });
}
initRiskTaxonomy();

// ─── Maturity assessment ──────────────────────
window.selectAnswer = function(qi, oi, score) {
  if (!window.assessmentAnswers) window.assessmentAnswers = {};
  window.assessmentAnswers[qi] = score;

  document.querySelectorAll(`.q-${qi} .q-option`).forEach(o => o.classList.remove('selected'));
  document.getElementById(`q${qi}o${oi}`).classList.add('selected');

  const totalQs = document.querySelectorAll('.question-block').length;
  if (Object.keys(window.assessmentAnswers).length === totalQs) {
    showAssessmentResult();
  }
};

function showAssessmentResult() {
  const scores = Object.values(window.assessmentAnswers);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const level = avg <= 1.5 ? 1 : avg <= 2.5 ? 2 : avg <= 3.5 ? 3 : 4;
  const result = document.getElementById('assessmentResult');
  if (result) {
    result.classList.remove('hidden');
    result.scrollIntoView({ behavior: 'smooth' });
    const levelEl = result.querySelector('.result-level');
    const levelNames = { 1: 'Level 1 — Reactive', 2: 'Level 2 — Aware', 3: 'Level 3 — Structured', 4: 'Level 4 — Embedded' };
    if (levelEl) levelEl.textContent = levelNames[level];
    const bar = result.querySelector('.result-bar');
    const pcts = { 1: '10%', 2: '35%', 3: '65%', 4: '95%' };
    const colors = { 1: '#A32D2D', 2: '#EF9F27', 3: '#378ADD', 4: '#1D9E75' };
    if (bar) { bar.style.width = pcts[level]; bar.style.background = colors[level]; }
    result.querySelectorAll('.level-content').forEach((el, i) => {
      el.classList.toggle('hidden', i + 1 !== level);
    });
  }
}

// ─── Smooth scroll for anchor links ──────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});

// ─── Mobile menu ──────────────────────────────
const mobileBtn = document.querySelector('.nav-mobile-btn');
const navLinksEl = document.querySelector('.nav-links');
if (mobileBtn && navLinksEl) {
  mobileBtn.addEventListener('click', () => {
    const open = navLinksEl.style.display === 'flex';
    navLinksEl.style.display = open ? 'none' : 'flex';
    navLinksEl.style.flexDirection = 'column';
    navLinksEl.style.position = 'fixed';
    navLinksEl.style.top = '60px';
    navLinksEl.style.left = '0';
    navLinksEl.style.right = '0';
    navLinksEl.style.background = 'white';
    navLinksEl.style.padding = '16px';
    navLinksEl.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
  });
}

// ─── Export for use in page scripts ──────────
window.AGNA = { drawSupplierNetwork, initTabs, initAccordion };
