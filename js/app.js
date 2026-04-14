/* ═══════════════════════════════════
   CANVAS DRAWING ENGINE
   ═══════════════════════════════════ */

// ── FIX 1: ctx.roundRect polyfill for Safari <15.4 and older browsers ──
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (typeof r === 'object') {
      // handle {topLeft, topRight, ...} shorthand — treat as uniform radius
      r = Object.values(r)[0] || 0;
    }
    r = Math.min(r || 0, Math.abs(w) / 2, Math.abs(h) / 2);
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.arcTo(x + w, y, x + w, y + r, r);
    this.lineTo(x + w, y + h - r);
    this.arcTo(x + w, y + h, x + w - r, y + h, r);
    this.lineTo(x + r, y + h);
    this.arcTo(x, y + h, x, y + h - r, r);
    this.lineTo(x, y + r);
    this.arcTo(x, y, x + r, y, r);
    this.closePath();
    return this;
  };
}

// Utility
function noise(x, y, scale) { return (Math.sin(x * scale) * Math.cos(y * scale * 1.3) + 1) / 2; }

// ── DRAW SINGLE CHURRO on canvas context
function drawChurro(ctx, x, y, len, thick, angle, fillColor, shadowColor, drizzleColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Shadow
  ctx.shadowColor = 'rgba(30,13,2,0.35)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 6;

  // Main body gradient
  const grd = ctx.createLinearGradient(-thick, 0, thick, 0);
  grd.addColorStop(0, shadowColor);
  grd.addColorStop(0.2, fillColor);
  grd.addColorStop(0.5, lighten(fillColor, 30));
  grd.addColorStop(0.8, fillColor);
  grd.addColorStop(1, shadowColor);

  ctx.beginPath();
  ctx.roundRect(-thick / 2, -len / 2, thick, len, thick / 2);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

  // Ridges
  ctx.strokeStyle = shadowColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  for (let i = -len / 2 + 8; i < len / 2 - 4; i += 10) {
    ctx.beginPath();
    ctx.moveTo(-thick / 2 + 2, i);
    ctx.bezierCurveTo(-thick / 2 + 2, i + 2, thick / 2 - 2, i + 2, thick / 2 - 2, i);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Sugar dusting
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  for (let i = 0; i < 20; i++) {
    const px = (Math.random() - 0.5) * thick * 0.7;
    const py = (Math.random() - 0.5) * len * 0.8;
    ctx.beginPath();
    ctx.arc(px, py, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Drizzle
  if (drizzleColor) {
    ctx.strokeStyle = drizzleColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.9;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(-2, -len / 2 + 10);
    ctx.bezierCurveTo(-8, -len / 4, 8, 0, -4, len / 4);
    ctx.bezierCurveTo(-10, len / 3, 2, len / 2 - 10, 0, len / 2 - 8);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

function lighten(hex, pct) {
  let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  r = Math.min(255, r + pct); g = Math.min(255, g + pct); b = Math.min(255, b + pct);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ── DRAW DONUT
function drawDonut(ctx, cx, cy, outerR, innerR, fillColor, glazeColor, sprinkles) {
  ctx.save();
  // Shadow
  ctx.shadowColor = 'rgba(30,13,2,0.3)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 8;

  // Body gradient
  const grd = ctx.createRadialGradient(cx - outerR * 0.3, cy - outerR * 0.3, innerR * 0.2, cx, cy, outerR);
  grd.addColorStop(0, lighten(fillColor, 25));
  grd.addColorStop(0.7, fillColor);
  grd.addColorStop(1, '#8B4513');

  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // Glaze
  const glazeGrd = ctx.createRadialGradient(cx - outerR * 0.2, cy - outerR * 0.2, innerR, cx, cy, outerR * 0.9);
  glazeGrd.addColorStop(0, lighten(glazeColor, 20) + 'dd');
  glazeGrd.addColorStop(1, glazeColor + '99');
  ctx.beginPath();
  ctx.arc(cx, cy, outerR * 0.95, 0, Math.PI * 2);
  ctx.arc(cx, cy, innerR * 1.05, 0, Math.PI * 2, true);
  ctx.fillStyle = glazeGrd;
  ctx.fill();

  // Glaze shine
  ctx.beginPath();
  ctx.arc(cx - outerR * 0.25, cy - outerR * 0.3, outerR * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fill();

  // Sprinkles
  if (sprinkles) {
    const sColors = ['#F25C7A', '#F5E642', '#3D1F0A', '#2196F3', '#4CAF50'];
    for (let i = 0; i < 16; i++) {
      const ang = (Math.PI * 2 / 16) * i + 0.3;
      const r = outerR * 0.6;
      const sx = cx + Math.cos(ang) * r, sy = cy + Math.sin(ang) * r;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(ang + Math.PI / 4);
      ctx.fillStyle = sColors[i % sColors.length];
      ctx.beginPath();
      ctx.roundRect(-5, -2, 10, 4, 2);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

// ── DRAW CHOCOLATE POOL
function drawChocolatePool(ctx, cx, cy, rx, ry, color) {
  ctx.save();
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
  grd.addColorStop(0, color + 'ff');
  grd.addColorStop(0.6, color + 'cc');
  grd.addColorStop(1, color + '00');
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.restore();
}

// ── PRODUCT CANVAS CHURRO ──────────────────────────────────
function drawProductChurro(canvasId, drizzleColor, fillColor) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = 160, H = 160;
  ctx.clearRect(0, 0, W, H);

  // Soft bg circle
  const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 70);
  bg.addColorStop(0, 'rgba(245,230,66,0.15)'); bg.addColorStop(1, 'transparent');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Shadow pool
  drawChocolatePool(ctx, W / 2, H - 20, 45, 14, '#3D1F0A');

  // Churro
  drawChurro(ctx, W / 2, H / 2, 120, 20, -0.05, fillColor || '#C8691A', '#7A3B08', drizzleColor);
}

function drawProductDonut(canvasId, fillColor, glazeColor, sprinkles) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 160, 160);
  const bg = ctx.createRadialGradient(80, 80, 0, 80, 80, 70);
  bg.addColorStop(0, 'rgba(245,230,66,0.15)'); bg.addColorStop(1, 'transparent');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 160, 160);
  drawDonut(ctx, 80, 80, 54, 22, fillColor || '#C8691A', glazeColor || '#F25C7A', sprinkles);
}



// ── INSTAGRAM WALL CANVASES ──────────────────────────────────
function drawInstaGrid() {
  const scenes = [
    // Scene 1: Multiple churros on dark background
    function (ctx, W, H) {
      ctx.fillStyle = '#1A0A02'; ctx.fillRect(0, 0, W, H);
      drawChurro(ctx, 60, 100, 160, 18, -0.2, '#C8691A', '#7A3B08', '#3D1F0A');
      drawChurro(ctx, 100, 110, 155, 18, 0.1, '#D47520', '#8B4513', null);
      drawChurro(ctx, 140, 105, 158, 18, -0.05, '#B85E15', '#6B3508', '#2A1505');
      ctx.fillStyle = 'rgba(245,230,66,0.9)'; ctx.font = 'bold 14px serif'; ctx.textAlign = 'center';
      ctx.fillText('Churn', 100, 185);
    },
    // Scene 2: Yellow bg with single churro
    function (ctx, W, H) {
      ctx.fillStyle = '#F5E642'; ctx.fillRect(0, 0, W, H);
      drawChocolatePool(ctx, 100, 170, 65, 18, '#2A1505');
      drawChurro(ctx, 100, 80, 130, 24, 0, '#C8691A', '#7A3B08', '#3D1F0A');
      ctx.fillStyle = '#1E0D02'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('CLÁSICO', 100, 192);
    },
    // Scene 3: Coral background brand
    function (ctx, W, H) {
      ctx.fillStyle = '#F25C7A'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'white'; ctx.font = 'bold 18px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Churn', 100, 70);
      ctx.font = '12px sans-serif';
      ctx.fillText('Churros de verdad', 100, 95);
      ctx.fillStyle = 'white'; ctx.globalAlpha = 0.7;
      drawChurro(ctx, 100, 150, 100, 16, 0.1, '#FFD580', '#E8A020', null);
      ctx.globalAlpha = 1;
    },
    // Scene 4: Dark with donut
    function (ctx, W, H) {
      ctx.fillStyle = '#2A1505'; ctx.fillRect(0, 0, W, H);
      drawDonut(ctx, 100, 100, 52, 21, '#C8691A', '#F25C7A', true);
      ctx.fillStyle = 'rgba(245,230,66,0.85)'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('DONAS', 100, 170);
    },
    // Scene 5: Churn storefront feel
    function (ctx, W, H) {
      // Night/warm lighting
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#1A0A02'); bg.addColorStop(1, '#3D1F0A');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      // Neon sign
      ctx.save();
      ctx.shadowColor = '#F5E642'; ctx.shadowBlur = 20;
      ctx.fillStyle = '#F5E642'; ctx.font = 'bold 22px serif'; ctx.textAlign = 'center';
      ctx.fillText('churn', 100, 80);
      ctx.shadowBlur = 0;
      ctx.restore();
      ctx.fillStyle = '#F5E642'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('CHURRERÍA', 100, 100);
      // Window glow
      ctx.fillStyle = 'rgba(245,230,66,0.08)';
      ctx.beginPath(); ctx.roundRect(30, 120, 140, 60, 8); ctx.fill();
    },
    // Scene 6: Churros group
    function (ctx, W, H) {
      ctx.fillStyle = '#FAF3E0'; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 5; i++) {
        const x = 40 + i * 32, angle = (i - 2) * 0.15;
        drawChurro(ctx, x, 100, 160, 14, angle, '#C8691A', '#7A3B08', i === 2 ? '#3D1F0A' : null);
      }
      drawChocolatePool(ctx, 100, 175, 70, 15, '#3D1F0A');
    }
  ];

  scenes.forEach((sceneFn, i) => {
    const c = document.getElementById('ig' + (i + 1));
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 200, 200);
    sceneFn(ctx, 200, 200);
  });
}

// ── PRODUCT DATA ──────────────────────────────────
// Para agregar/quitar/editar un producto, solo modificar este array.
const PRODUCTOS = [
  { nombre: "Clásico", cat: "churros", img: "images/productosSinFondo/churroClasico.png" },
  { nombre: "Relleno de DDL", cat: "churros", img: "images/productosSinFondo/churroDDLGemini.png" },
  { nombre: "Chocolate", cat: "churros", img: "images/productosSinFondo/ChurroChocolateGemini.png" },
  { nombre: "Chocolate Blanco", cat: "churros", img: "images/productosSinFondo/churroBlancoGemini.png" },
  { nombre: "Crema Pastelera", cat: "churros", img: "images/productosSinFondo/cremapastelera.png" },
  { nombre: "Chipa", cat: "otros", img: "images/productosSinFondo/chipaGemini.png" },
  { nombre: "Berlinesa", cat: "otros", img: "images/productosSinFondo/berlinesaGemini.png" },
  { nombre: "Dona Pink", cat: "donas", img: "images/productosSinFondo/donaPink.png" },
  { nombre: "Dona Oreo", cat: "donas", img: "images/productosSinFondo/donaOreo.png" },
  { nombre: "Dona Chocotorta", cat: "donas", img: "images/productosSinFondo/donaChocotorta.png" },
];

// Genera las tarjetas de producto dinámicamente en el carrusel
function renderProductCards() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  track.innerHTML = '';
  PRODUCTOS.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.cat = prod.cat;
    card.innerHTML = `
      <div class="prod-canvas-wrap"><img src="${prod.img}" alt="${prod.nombre}"></div>
      <div class="prod-name">${prod.nombre}</div>
    `;
    track.appendChild(card);
  });
}

// ── INIT ──────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Generar tarjetas del menú desde el array de datos
  renderProductCards();

  drawInstaGrid();
  // FIX F: drawBentoBgs inside setTimeout — card.offsetWidth/offsetHeight are 0
  // at DOMContentLoaded if the browser hasn't performed layout yet.
  // The 60ms delay matches the carousel init and ensures a full paint cycle.
  setTimeout(() => {
    drawBentoBgs();
    CAROUSEL.render();
    CAROUSEL.initTouch();
  }, 60);
});

// ── BENTO BACKGROUND PHOTOS ──────────────────────────────────
function drawBentoBgs() {

  // ── BG 1: La masa — harina, masa, manos amasando
  (function () {
    const c = document.getElementById('bentoBg1'); if (!c) return;
    const card = c.parentElement;
    c.width = card.offsetWidth || 600;
    c.height = card.offsetHeight || 260;
    const ctx = c.getContext('2d'), W = c.width, H = c.height;

    // Warm wooden table surface
    const tableGrd = ctx.createLinearGradient(0, 0, W, H);
    tableGrd.addColorStop(0, '#C8A878'); tableGrd.addColorStop(0.5, '#B89060'); tableGrd.addColorStop(1, '#A07848');
    ctx.fillStyle = tableGrd; ctx.fillRect(0, 0, W, H);

    // Wood grain lines
    ctx.save(); ctx.globalAlpha = 0.18;
    for (let i = 0; i < 18; i++) {
      const y = i * (H / 14);
      ctx.strokeStyle = '#7A5030'; ctx.lineWidth = Math.random() * 3 + 1;
      ctx.beginPath(); ctx.moveTo(0, y + Math.random() * 12);
      ctx.bezierCurveTo(W * 0.3, y - 8, W * 0.7, y + 10, W, y + Math.random() * 8);
      ctx.stroke();
    }
    ctx.restore();

    // Flour dust clouds (scattered white puffs)
    [[W * 0.6, H * 0.25, 80], [W * 0.75, H * 0.6, 60], [W * 0.85, H * 0.35, 45], [W * 0.5, H * 0.7, 50]].forEach(([fx, fy, fr]) => {
      const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
      g.addColorStop(0, 'rgba(255,255,255,0.70)'); g.addColorStop(0.5, 'rgba(255,255,255,0.40)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(fx, fy, fr, fr * 0.65, Math.random() * 0.5, 0, Math.PI * 2); ctx.fill();
    });

    // Large dough ball (right side)
    const dx = W * 0.72, dy = H * 0.55, dr = Math.min(W, H) * 0.28;
    ctx.save();
    ctx.shadowColor = 'rgba(60,30,5,0.35)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 12;
    const doughGrd = ctx.createRadialGradient(dx - dr * 0.25, dy - dr * 0.3, dr * 0.05, dx, dy, dr);
    doughGrd.addColorStop(0, '#FFF8EE'); doughGrd.addColorStop(0.45, '#F0E8D8'); doughGrd.addColorStop(0.8, '#D8C8B0'); doughGrd.addColorStop(1, '#C0A888');
    ctx.beginPath(); ctx.arc(dx, dy, dr, 0, Math.PI * 2); ctx.fillStyle = doughGrd; ctx.fill();
    ctx.shadowBlur = 0;
    // Dough surface bumps
    [[dx - dr * 0.2, dy - dr * 0.15, dr * 0.18], [dx + dr * 0.1, dy + dr * 0.08, dr * 0.14], [dx - dr * 0.05, dy + dr * 0.2, dr * 0.12]].forEach(([bx, by, br]) => {
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fill();
    });
    ctx.restore();

    // Hands outline (left side, reaching in)
    ctx.save(); ctx.translate(W * 0.35, H * 0.5); ctx.rotate(-0.15);
    // Left hand
    const handGrd = ctx.createLinearGradient(-40, 0, 40, 80);
    handGrd.addColorStop(0, '#D4956A'); handGrd.addColorStop(1, '#B07840');
    ctx.shadowColor = 'rgba(40,20,5,0.3)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
    // Palm
    ctx.beginPath(); ctx.ellipse(0, 40, 40, 55, 0, 0, Math.PI * 2); ctx.fillStyle = handGrd; ctx.fill();
    // Fingers
    [[-28, 0, 12, 46, 0.15], [-10, -5, 11, 50, 0.05], [9, -5, 11, 50, -0.05], [27, 0, 12, 46, -0.15]].forEach(([fx, fy, fw, fh, fr]) => {
      ctx.save(); ctx.translate(fx, fy); ctx.rotate(fr);
      ctx.beginPath(); ctx.ellipse(0, -fh / 2, fw / 2, fh / 2, 0, 0, Math.PI * 2); ctx.fillStyle = handGrd; ctx.fill();
      ctx.restore();
    });
    ctx.shadowBlur = 0; ctx.restore();

    // Scattered flour particles
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 60; i++) {
      ctx.beginPath(); ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2.5 + 0.5, 0, Math.PI * 2); ctx.fill();
    }
  })();

  // ── BG 2: La fritura — aceite caliente, burbujas, vapor
  (function () {
    const c = document.getElementById('bentoBg2'); if (!c) return;
    const card = c.parentElement;
    c.width = card.offsetWidth || 280;
    c.height = card.offsetHeight || 260;
    const ctx = c.getContext('2d'), W = c.width, H = c.height;

    // Deep fryer dark metal background
    const bgGrd = ctx.createLinearGradient(0, 0, 0, H);
    bgGrd.addColorStop(0, '#2A1A08'); bgGrd.addColorStop(0.4, '#3D2210'); bgGrd.addColorStop(1, '#1A0D04');
    ctx.fillStyle = bgGrd; ctx.fillRect(0, 0, W, H);

    // Hot oil surface (amber/golden)
    const oilTop = H * 0.30;
    const oilGrd = ctx.createLinearGradient(0, oilTop, 0, H);
    oilGrd.addColorStop(0, '#C87808'); oilGrd.addColorStop(0.3, '#A05806'); oilGrd.addColorStop(1, '#6A3804');
    ctx.fillStyle = oilGrd; ctx.fillRect(0, oilTop, W, H - oilTop);

    // Oil shimmer/sheen on surface
    const sheen = ctx.createLinearGradient(0, oilTop, 0, oilTop + 40);
    sheen.addColorStop(0, 'rgba(255,200,60,0.55)'); sheen.addColorStop(1, 'rgba(255,200,60,0)');
    ctx.fillStyle = sheen; ctx.fillRect(0, oilTop, W, 40);

    // Fryer basket rim (metal)
    const rimGrd = ctx.createLinearGradient(0, oilTop - 22, 0, oilTop + 4);
    rimGrd.addColorStop(0, '#888'); rimGrd.addColorStop(0.5, '#555'); rimGrd.addColorStop(1, '#333');
    ctx.fillStyle = rimGrd; ctx.fillRect(0, oilTop - 18, W, 20);
    ctx.fillStyle = '#666'; ctx.fillRect(0, oilTop - 22, W, 6);

    // Bubbles in oil
    const bubbleColors = ['rgba(220,150,30,0.75)', 'rgba(240,180,50,0.6)', 'rgba(200,120,20,0.5)'];
    [[W * 0.15, oilTop + 30, 8], [W * 0.30, oilTop + 55, 6], [W * 0.50, oilTop + 35, 9], [W * 0.68, oilTop + 60, 7],
    [W * 0.82, oilTop + 40, 5], [W * 0.22, oilTop + 80, 6], [W * 0.60, oilTop + 90, 8], [W * 0.78, oilTop + 70, 5],
    [W * 0.40, oilTop + 110, 7], [W * 0.12, oilTop + 100, 4], [W * 0.90, oilTop + 95, 6]].forEach(([bx, by, br], i) => {
      ctx.fillStyle = bubbleColors[i % 3];
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,220,80,0.45)';
      ctx.beginPath(); ctx.arc(bx - br * 0.3, by - br * 0.3, br * 0.38, 0, Math.PI * 2); ctx.fill();
    });

    // Churro submerging in oil (horizontal, half in/half out)
    ctx.save(); ctx.translate(W * 0.5, oilTop); ctx.rotate(-0.08);
    // Part above oil
    ctx.save(); ctx.beginPath(); ctx.rect(-W * 0.42, -H * 0.22, W * 0.84, H * 0.22); ctx.clip();
    const aboveGrd = ctx.createLinearGradient(-12, 0, 12, 0);
    aboveGrd.addColorStop(0, '#8B4810'); aboveGrd.addColorStop(0.5, '#D4820A'); aboveGrd.addColorStop(1, '#8B4810');
    ctx.beginPath(); ctx.roundRect(-W * 0.4, -16, W * 0.8, 28, 14); ctx.fillStyle = aboveGrd; ctx.fill();
    ctx.strokeStyle = 'rgba(100,50,5,0.4)'; ctx.lineWidth = 1;
    for (let x = -W * 0.35; x < W * 0.35; x += 12) { ctx.beginPath(); ctx.moveTo(x, -14); ctx.lineTo(x, 12); ctx.stroke(); }
    ctx.restore();
    // Part below oil (darker)
    ctx.save(); ctx.beginPath(); ctx.rect(-W * 0.42, 0, W * 0.84, H * 0.5); ctx.clip();
    const belowGrd = ctx.createLinearGradient(-12, 0, 12, 0);
    belowGrd.addColorStop(0, '#5A2E05'); belowGrd.addColorStop(0.5, '#8A5008'); belowGrd.addColorStop(1, '#5A2E05');
    ctx.beginPath(); ctx.roundRect(-W * 0.4, -14, W * 0.8, 28, 14); ctx.fillStyle = belowGrd; ctx.fill();
    ctx.restore();
    ctx.restore();

    // Steam wisps above oil
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    [[W * 0.2, oilTop - 8], [W * 0.45, oilTop - 5], [W * 0.70, oilTop - 10], [W * 0.88, oilTop - 6]].forEach(([sx, sy]) => {
      ctx.beginPath(); ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(sx - 10, sy - 20, sx + 10, sy - 36, sx - 5, sy - 52);
      ctx.stroke();
    });
    ctx.restore();

    // Heat glow at bottom
    const glow = ctx.createRadialGradient(W / 2, H, 5, W / 2, H, W * 0.7);
    glow.addColorStop(0, 'rgba(255,100,0,0.3)'); glow.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, H * 0.6, W, H * 0.4);
  })();

  // ── BG 3: El relleno — dulce de leche dorado derramándose
  (function () {
    const c = document.getElementById('bentoBg3'); if (!c) return;
    const card = c.parentElement;
    c.width = card.offsetWidth || 280;
    c.height = card.offsetHeight || 260;
    const ctx = c.getContext('2d'), W = c.width, H = c.height;

    // Warm terracotta background
    const bgGrd = ctx.createLinearGradient(0, 0, W, H);
    bgGrd.addColorStop(0, '#C85040'); bgGrd.addColorStop(1, '#A03020');
    ctx.fillStyle = bgGrd; ctx.fillRect(0, 0, W, H);

    // Dulce de leche pool / puddle (bottom)
    const ddlGrd = ctx.createRadialGradient(W * 0.6, H * 0.8, 10, W * 0.6, H * 0.85, W * 0.55);
    ddlGrd.addColorStop(0, '#E8A830'); ddlGrd.addColorStop(0.4, '#C88020'); ddlGrd.addColorStop(1, 'rgba(160,90,10,0)');
    ctx.fillStyle = ddlGrd; ctx.beginPath(); ctx.ellipse(W * 0.6, H * 0.9, W * 0.52, H * 0.22, 0, 0, Math.PI * 2); ctx.fill();

    // DDL drizzle streams flowing diagonally
    const streams = [
      { x1: W * 0.55, y1: 0, cp1x: W * 0.5, cp1y: H * 0.3, cp2x: W * 0.65, cp2y: H * 0.55, x2: W * 0.62, y2: H * 0.8, w: 14 },
      { x1: W * 0.70, y1: 0, cp1x: W * 0.68, cp1y: H * 0.25, cp2x: W * 0.72, cp2y: H * 0.5, x2: W * 0.70, y2: H * 0.75, w: 9 },
      { x1: W * 0.80, y1: 0, cp1x: W * 0.75, cp1y: H * 0.35, cp2x: W * 0.78, cp2y: H * 0.55, x2: W * 0.76, y2: H * 0.78, w: 6 },
    ];
    streams.forEach(({ x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2, w }) => {
      const sGrd = ctx.createLinearGradient(x1, y1, x2, y2);
      sGrd.addColorStop(0, 'rgba(240,180,40,0.9)'); sGrd.addColorStop(0.5, 'rgba(210,150,20,0.8)'); sGrd.addColorStop(1, 'rgba(180,120,10,0.6)');
      ctx.save();
      ctx.strokeStyle = sGrd; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(120,70,0,0.4)'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2); ctx.stroke();
      ctx.restore();
      // Drip drop at end
      ctx.save();
      ctx.shadowColor = 'rgba(120,70,0,0.4)'; ctx.shadowBlur = 6;
      ctx.fillStyle = '#C88020';
      ctx.beginPath(); ctx.arc(x2, y2 + w * 0.7, w * 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // Caramel texture dots (bubbles)
    ctx.fillStyle = 'rgba(255,200,60,0.35)';
    for (let i = 0; i < 18; i++) {
      const bx = W * 0.4 + Math.random() * W * 0.5, by = Math.random() * H * 0.7;
      const br = Math.random() * 5 + 2;
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
    }

    // Churro tip on right edge
    ctx.save(); ctx.translate(W * 0.92, H * 0.35); ctx.rotate(0.3);
    const churroGrd = ctx.createLinearGradient(-10, 0, 10, 0);
    churroGrd.addColorStop(0, '#8B4A10'); churroGrd.addColorStop(0.5, '#D4820A'); churroGrd.addColorStop(1, '#8B4A10');
    ctx.beginPath(); ctx.roundRect(-12, -H * 0.28, 24, H * 0.36, 12); ctx.fillStyle = churroGrd; ctx.fill();
    ctx.restore();
  })();

  // ── BG 4: Tu pedido — manos con phone, chat abierto
  (function () {
    const c = document.getElementById('bentoBg4'); if (!c) return;
    const card = c.parentElement;
    c.width = card.offsetWidth || 600;
    c.height = card.offsetHeight || 260;
    const ctx = c.getContext('2d'), W = c.width, H = c.height;

    // Deep dark background with subtle texture
    const bgGrd = ctx.createLinearGradient(0, 0, W, H);
    bgGrd.addColorStop(0, '#0D0604'); bgGrd.addColorStop(0.5, '#180C06'); bgGrd.addColorStop(1, '#0A0402');
    ctx.fillStyle = bgGrd; ctx.fillRect(0, 0, W, H);

    // Subtle pattern dots
    ctx.fillStyle = 'rgba(245,230,66,0.04)';
    for (let x = 0; x < W; x += 28) for (let y = 0; y < H; y += 28) {
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    }

    // Phone device (right side)
    const px = W * 0.65, py = H * 0.5, ph = H * 0.85, pw = ph * 0.46;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 32; ctx.shadowOffsetY = 12;
    // Phone shell
    const phoneGrd = ctx.createLinearGradient(px - pw / 2, 0, px + pw / 2, 0);
    phoneGrd.addColorStop(0, '#282828'); phoneGrd.addColorStop(0.5, '#383838'); phoneGrd.addColorStop(1, '#242424');
    ctx.beginPath(); ctx.roundRect(px - pw / 2, py - ph / 2, pw, ph, pw * 0.14); ctx.fillStyle = phoneGrd; ctx.fill();
    ctx.shadowBlur = 0;
    // Screen
    ctx.beginPath(); ctx.roundRect(px - pw / 2 + 4, py - ph / 2 + 6, pw - 8, ph - 12, pw * 0.12);
    const screenGrd = ctx.createLinearGradient(0, py - ph / 2, 0, py + ph / 2);
    screenGrd.addColorStop(0, '#0D1D0D'); screenGrd.addColorStop(1, '#0A1A0A');
    ctx.fillStyle = screenGrd; ctx.fill();
    // WA header
    ctx.fillStyle = '#128C7E';
    ctx.beginPath(); ctx.roundRect(px - pw / 2 + 4, py - ph / 2 + 6, pw - 8, ph * 0.26, { topLeft: pw * 0.12, topRight: pw * 0.12, bottomLeft: 0, bottomRight: 0 }); ctx.fill();
    // Header text
    ctx.fillStyle = 'white'; ctx.font = `bold ${pw * 0.15}px Poppins,sans-serif`; ctx.textAlign = 'center';
    ctx.fillText('Churn', px, py - ph * 0.26);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = `${pw * 0.10}px Poppins,sans-serif`;
    ctx.fillText('en línea', px, py - ph * 0.18);
    // WA icon
    ctx.fillStyle = '#25D366'; ctx.beginPath(); ctx.arc(px - pw * 0.28, py - ph * 0.28, pw * 0.13, 0, Math.PI * 2); ctx.fill();
    // Chat bubbles
    const bw = pw * 0.75;
    // Received
    ctx.fillStyle = 'rgba(255,255,255,0.09)';
    ctx.beginPath(); ctx.roundRect(px - pw * 0.43, py - ph * 0.08, bw * 0.85, ph * 0.1, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = `${pw * 0.095}px Poppins,sans-serif`; ctx.textAlign = 'left';
    ctx.fillText('Quiero pedir!', px - pw * 0.40, py - ph * 0.02);
    // Sent (green)
    ctx.fillStyle = 'rgba(37,211,102,0.22)';
    ctx.beginPath(); ctx.roundRect(px - pw * 0.43, py + ph * 0.06, bw * 0.78, ph * 0.1, 4); ctx.fill();
    ctx.fillStyle = 'rgba(37,211,102,0.85)'; ctx.font = `${pw * 0.095}px Poppins,sans-serif`;
    ctx.fillText('¡Listo!', px - pw * 0.40, py + ph * 0.12);
    ctx.restore();

    // Hands holding phone (left)
    ctx.save(); ctx.translate(W * 0.25, H * 0.6); ctx.rotate(-0.12);
    const hGrd = ctx.createLinearGradient(-50, -60, 50, 80);
    hGrd.addColorStop(0, '#C8784A'); hGrd.addColorStop(1, '#A05828');
    ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 20;
    // Thumb
    ctx.beginPath(); ctx.ellipse(38, -20, 16, 36, 0.4, 0, Math.PI * 2); ctx.fillStyle = hGrd; ctx.fill();
    // Palm
    ctx.beginPath(); ctx.ellipse(0, 30, 40, 52, 0, 0, Math.PI * 2); ctx.fillStyle = hGrd; ctx.fill();
    // Fingers
    [[-22, -18, 11, 42, 0.12], [-7, -22, 10, 46, 0.03], [10, -22, 10, 46, -0.03], [25, -16, 11, 40, -0.1]].forEach(([fx, fy, fw, fh, fr]) => {
      ctx.save(); ctx.translate(fx, fy); ctx.rotate(fr);
      ctx.beginPath(); ctx.ellipse(0, -fh / 2, fw / 2, fh / 2, 0, 0, Math.PI * 2); ctx.fillStyle = hGrd; ctx.fill();
      ctx.restore();
    });
    ctx.restore();

    // WhatsApp glow behind phone
    const glow = ctx.createRadialGradient(W * 0.65, H * 0.5, 0, W * 0.65, H * 0.5, W * 0.3);
    glow.addColorStop(0, 'rgba(37,211,102,0.12)'); glow.addColorStop(1, 'rgba(37,211,102,0)');
    ctx.fillStyle = glow; ctx.fillRect(W * 0.3, 0, W * 0.7, H);
  })();

  // FIX 2: Guard against ResizeObserver infinite loop caused by canvas resize inside drawBentoBgs
  if (window.ResizeObserver) {
    let _bentoBgPending = false;
    new ResizeObserver(() => {
      if (_bentoBgPending) return;
      _bentoBgPending = true;
      requestAnimationFrame(() => { _bentoBgPending = false; drawBentoBgs(); });
    }).observe(document.querySelector('.bento-grid'));
  }
}

/* ═══════════════════════════════════
   INTERACTIONS
   ═══════════════════════════════════ */

// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('in'), i * 90); observer.unobserve(e.target); } });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Counter animation
function animNum(el) {
  const t = parseInt(el.dataset.target); if (!t) return;
  let cur = 0; const step = t / 80;
  const r = setInterval(() => {
    cur += step;
    if (cur >= t) { cur = t; clearInterval(r); }
    el.textContent = Math.floor(cur).toLocaleString('es-AR') + '+';
  }, 25);
}
const cObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animNum(e.target); cObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => cObs.observe(el));

// ── 2D CAROUSEL ENGINE ──────────────────────────────
const CAROUSEL = {
  index: 0,
  cat: 'all',

  cards: () => [...document.querySelectorAll('.product-card')],
  visible() { return this.cards().filter(c => this.cat === 'all' || c.dataset.cat === this.cat); },
  perPage() { return window.innerWidth > 900 ? 4 : window.innerWidth > 560 ? 3 : 1; },
  max() { return Math.max(0, this.visible().length - this.perPage()); },

  render() {
    const track = document.getElementById('carouselTrack');
    const dotsEl = document.getElementById('carouselDots');
    if (!track || !dotsEl) return;

    // Re-attach all cards to track
    this.cards().forEach(c => { c.style.display = ''; track.appendChild(c); });

    // Apply visibility filter & reset inline styles from any previous state
    this.cards().forEach(c => {
      c.style.display = (this.cat === 'all' || c.dataset.cat === this.cat) ? '' : 'none';
      c.style.transform = '';
      c.style.opacity = '';
      c.style.zIndex = '';
    });

    // FIX 5: cache visible() — was called 3 times, now called once
    const vis = this.visible();
    const maxI = Math.max(0, vis.length - this.perPage());

    // Clamp index
    this.index = Math.max(0, Math.min(this.index, maxI));

    // Compute translateX offset
    const gap = parseInt(getComputedStyle(track).gap) || 32;
    const mask = track.closest('.carousel-mask');

    // En móvil (1 card por vez), usar el ancho del contenedor completo
    // En desktop, usar el ancho real de la card
    let cardW;
    if (this.perPage() === 1) {
      cardW = mask ? mask.offsetWidth : 0;
    } else {
      const cardEl = vis[0];
      cardW = cardEl ? cardEl.getBoundingClientRect().width : 0;
    }

    track.style.transform = `translateX(-${this.index * (cardW + gap)}px)`;

    // Dots
    dotsEl.innerHTML = '';
    for (let i = 0; i <= maxI; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === this.index ? ' active' : '');
      dot.setAttribute('aria-label', `Ir a producto ${i + 1}`);
      dot.onclick = () => { this.index = i; this.render(); };
      dotsEl.appendChild(dot);
    }
    dotsEl.style.display = maxI < 1 ? 'none' : 'flex';

    // Arrows
    const prev = document.getElementById('cPrev');
    const next = document.getElementById('cNext');
    if (prev) prev.disabled = this.index === 0;
    if (next) next.disabled = this.index >= maxI;
  },

  initTouch() {
    const mask = document.querySelector('.carousel-mask');
    let startX = 0;
    mask.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    mask.addEventListener('touchend', e => {
      const delta = e.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 40) {
        this.index += delta < 0 ? 1 : -1;
        this.index = Math.max(0, Math.min(this.index, this.max()));
        this.render();
      }
    }, { passive: true });
  }
};

function filterMenu(btn, cat) {
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  CAROUSEL.cat = cat;
  CAROUSEL.index = 0;
  CAROUSEL.render();
}

function carouselMove(dir) {
  CAROUSEL.index = Math.max(0, Math.min(CAROUSEL.index + dir, CAROUSEL.max()));
  CAROUSEL.render();
}

window.addEventListener('resize', () => CAROUSEL.render());

// ── MOBILE DRAWER ──────────────────────────────
function openDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  backdrop.style.display = 'block';
  // FIX 3: double rAF ensures display:block is painted before transition starts
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      drawer.classList.add('open');
      backdrop.classList.add('open');
    });
  });
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  drawer.classList.remove('open');
  backdrop.classList.remove('open');
  // FIX 4: setTimeout as reliable fallback — transitionend may not fire on reduced-motion
  // or when display is toggled. 420ms matches the CSS transition duration + buffer.
  setTimeout(() => { backdrop.style.display = ''; }, 420);
  document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

// Nav shadow on scroll
window.addEventListener('scroll', () => {
  document.getElementById('mainNav').style.boxShadow = window.scrollY > 40 ? '0 4px 28px rgba(30,13,2,.1)' : 'none';
});