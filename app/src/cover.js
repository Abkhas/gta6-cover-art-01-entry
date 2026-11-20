// Vice Coast Cover Studio — canvas cover renderer (v2).
// Draws the multi-panel poster: per-panel photos with a unified warm
// golden-hour grade, a chrome-stripes title overlapping the photos, a
// script subtitle, a press-quote top strip, a gold VOL chip, a starburst
// seal, a billing block, a palm tagline strip, a barcode and a gold frame.
// Every panel carries a two-line caption (role/place + place/time/quip)
// so each panel reads on its own. No network, no libraries.

export const SIZES = {
  square: { w: 1080, h: 1080, label: 'Square · 1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: 'Portrait · 1080 × 1350' },
  landscape: { w: 1920, h: 1080, label: 'Landscape · 1920 × 1080' },
};

function rows(cw, ch, g, n, y, h) {
  const w = (cw - g * (n - 1)) / n;
  const out = [];
  for (let i = 0; i < n; i++) out.push({ x: i * (w + g), y, w, h });
  return out;
}
function cols(cw, ch, g, n, x, w) {
  const h = (ch - g * (n - 1)) / n;
  const out = [];
  for (let i = 0; i < n; i++) out.push({ x, y: i * (h + g), w, h });
  return out;
}

// Each layout returns panels inside the content area (cw × ch), the part
// below the top strip. Panel 0 is the hero wherever one exists.
export const LAYOUTS = [
  { id: 'harbor', name: 'Harbor 7', panels(cw, ch, g) {
    const hw = cw * 0.46, rx = hw + g, rw = cw - rx;
    const out = [{ x: 0, y: 0, w: hw, h: ch, hero: true }];
    const w = (rw - g) / 2, h = (ch - 2 * g) / 3;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++)
      out.push({ x: rx + c * (w + g), y: r * (h + g), w, h });
    return out;
  } },
  { id: 'hero', name: 'Hero', panels(cw, ch, g) {
    const hw = cw * 0.62, rx = hw + g, rw = cw - rx;
    return [{ x: 0, y: 0, w: hw, h: ch, hero: true }, ...cols(cw, ch, g, 3, rx, rw)];
  } },
  { id: 'comic', name: 'Comic Strip', panels(cw, ch, g) {
    const th = ch * 0.52, by = th + g, bh = ch - by;
    return [{ x: 0, y: 0, w: cw, h: th, hero: true }, ...rows(cw, ch, g, 4, by, bh)];
  } },
  { id: 'nine', name: 'Nine Panel', panels(cw, ch, g) {
    const out = [];
    const w = (cw - 2 * g) / 3, h = (ch - 2 * g) / 3;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
      out.push({ x: c * (w + g), y: r * (h + g), w, h, hero: r === 0 && c === 1 });
    return out;
  } },
  { id: 'mosaic', name: 'Mosaic', panels(cw, ch, g) {
    const w = (cw - 3 * g) / 4, h = (ch - 2 * g) / 3;
    const cell = (c, r) => ({ x: c * (w + g), y: r * (h + g), w, h });
    return [
      { x: 0, y: 0, w: 2 * w + g, h: 2 * h + g, hero: true },
      cell(2, 0), cell(3, 0), cell(2, 1), cell(3, 1),
      cell(0, 2), cell(1, 2), cell(2, 2), cell(3, 2),
    ];
  } },
  { id: 'hero-left', name: 'Hero Left', panels(cw, ch, g) {
    const hw = cw * 0.45, rx = hw + g, rw = cw - rx;
    const out = [{ x: 0, y: 0, w: hw, h: ch, hero: true }];
    const w = (rw - g) / 2, h = (ch - g) / 2;
    out.push({ x: rx, y: 0, w, h }, { x: rx + w + g, y: 0, w, h });
    out.push({ x: rx, y: h + g, w, h }, { x: rx + w + g, y: h + g, w, h });
    return out;
  } },
  { id: 'hero-right', name: 'Hero Right', panels(cw, ch, g) {
    const hw = cw * 0.45, rx = 0, rw = cw - hw - g;
    const out = [];
    const w = (rw - g) / 2, h = (ch - g) / 2;
    out.push({ x: 0, y: 0, w, h }, { x: w + g, y: 0, w, h });
    out.push({ x: 0, y: h + g, w, h }, { x: w + g, y: h + g, w, h });
    out.push({ x: cw - hw, y: 0, w: hw, h: ch, hero: true });
    return out;
  } },
  { id: 'center-stage', name: 'Center Stage', panels(cw, ch, g) {
    const cw2 = cw * 0.25, cx = cw2 + g, chw = cw - 2 * cw2 - 2 * g;
    return [
      ...cols(cw, ch, g, 2, 0, cw2),
      { x: cx, y: 0, w: chw, h: ch, hero: true },
      ...cols(cw, ch, g, 2, cx + chw + g, cw2),
    ];
  } },
  { id: 'skyline', name: 'Skyline Strip', panels(cw, ch, g) {
    const th = ch * 0.42, by = th + g, bh = ch - by;
    return [...rows(cw, ch, g, 5, 0, th), { x: 0, y: by, w: cw, h: bh, hero: true }];
  } },
  { id: 'duo', name: 'Duo Split', panels(cw, ch, g) {
    const th = ch * 0.58, by = th + g, bh = ch - by;
    const w = (cw - g) / 2;
    return [
      { x: 0, y: 0, w, h: th, hero: true }, { x: w + g, y: 0, w, h: th },
      ...rows(cw, ch, g, 3, by, bh),
    ];
  } },
];

// Default grade is Golden Hour now: warm gold/orange/teal, much less
// magenta than the old Vice Sunset default. Vice Sunset itself was also
// re-warmed (purple bottom -> burnt orange) for the same reason.
export const GRADES = [
  { id: 'golden-hour', name: 'Golden Hour', sat: 1.25, con: 1.08, bri: 1.04, sep: 0.42, hue: -8,
    top: '#ffd166', bottom: '#e36414', blend: 'soft-light', alpha: 0.7 },
  { id: 'vice-sunset', name: 'Vice Sunset', sat: 1.35, con: 1.12, bri: 1.0, sep: 0.22, hue: -6,
    top: '#ff9a3c', bottom: '#c2410c', blend: 'overlay', alpha: 0.55 },
  { id: 'neon-night', name: 'Neon Night', sat: 1.5, con: 1.16, bri: 0.96, sep: 0.05, hue: -14,
    top: '#ff2e88', bottom: '#1b2aff', blend: 'overlay', alpha: 0.6 },
  { id: 'pink-teal', name: 'Pink / Teal', sat: 1.42, con: 1.1, bri: 1.0, sep: 0.08, hue: 8,
    top: '#ff5e8a', bottom: '#0fb5a8', blend: 'overlay', alpha: 0.55 },
  { id: 'comic-ink', name: 'Comic Ink', sat: 1.12, con: 1.45, bri: 1.02, sep: 0.1, hue: 0,
    top: '#ffb347', bottom: '#5b21b6', blend: 'soft-light', alpha: 0.4 },
  { id: 'noir-heat', name: 'Noir Heat', sat: 0.85, con: 1.3, bri: 0.92, sep: 0.35, hue: -4,
    top: '#ff3b30', bottom: '#111111', blend: 'overlay', alpha: 0.5 },
];

export const TITLE_STYLES = [
  { id: 'chrome', name: 'Chrome Stripes' },
  { id: 'smooth', name: 'Sunset Smooth' },
  { id: 'neon', name: 'Neon Outline' },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}
export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}
export function titleStyleById(id) {
  return TITLE_STYLES.find((t) => t.id === id) || TITLE_STYLES[0];
}

// Poster geometry, as fractions of the poster height. The title overlaps
// the bottom of the photo panels; everything below the title is poster
// furniture (subtitle, ribbon, billing, tagline strip, footer).
export function frameWidth(sizeId) {
  const { w } = SIZES[sizeId] || SIZES.landscape;
  return Math.max(6, Math.round(w * 0.006));
}
export function panelsArea(sizeId) {
  const size = SIZES[sizeId] || SIZES.landscape;
  const g = Math.max(4, size.w * 0.006);
  return { top: size.h * 0.052 + g, height: size.h * 0.575 };
}
// Absolute panel rects (including the frame offset) for a state.
export function panelRects(state) {
  const size = SIZES[state.size] || SIZES.landscape;
  const W = size.w;
  const g = Math.max(4, W * 0.006);
  const frame = frameWidth(state.size);
  const pa = panelsArea(state.size);
  const layout = layoutById(state.layout);
  return layout.panels(W - 2 * frame, pa.height, g)
    .map((r) => ({ ...r, x: r.x + frame, y: r.y + pa.top }));
}

// ---- pattern helpers -------------------------------------------------------
let grainCanvas = null;
function grainPattern(ctx) {
  if (!grainCanvas) {
    grainCanvas = document.createElement('canvas');
    grainCanvas.width = grainCanvas.height = 128;
    const g = grainCanvas.getContext('2d');
    const img = g.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  return ctx.createPattern(grainCanvas, 'repeat');
}
let halftoneCanvas = null;
function halftonePattern(ctx, spacing) {
  const key = spacing;
  if (!halftoneCanvas || halftoneCanvas._s !== key) {
    halftoneCanvas = document.createElement('canvas');
    halftoneCanvas.width = halftoneCanvas.height = spacing;
    halftoneCanvas._s = key;
    const g = halftoneCanvas.getContext('2d');
    g.fillStyle = '#000';
    g.beginPath();
    g.arc(spacing / 2, spacing / 2, spacing * 0.22, 0, Math.PI * 2);
    g.fill();
  }
  return ctx.createPattern(halftoneCanvas, 'repeat');
}

// ---- text helpers ----------------------------------------------------------
function fitFont(ctx, text, maxW, startPx, family, weight) {
  let px = startPx;
  ctx.font = `${weight || ''} ${px}px ${family}`.trim();
  while (px > 12 && ctx.measureText(text).width > maxW) {
    px -= 2;
    ctx.font = `${weight || ''} ${px}px ${family}`.trim();
  }
  return px;
}

// ---- photo panel -----------------------------------------------------------
// faceY (0..1) is the vertical position of the face inside the photo.
// When set, the crop window is placed so the face lands at 42% of the
// panel height — a face is never cut at the top of a panel.
function drawPhotoInto(ctx, img, x, y, w, h, zoom, panX, panY, faceY) {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.max(w / iw, h / ih) * ((zoom || 100) / 100);
  const dw = iw * scale, dh = ih * scale;
  const dx = x + (w - dw) / 2 + ((panX || 0) / 50) * Math.max(0, (dw - w) / 2);
  let dy;
  if (faceY != null && dh > h) {
    dy = (y + h * 0.42) - faceY * dh;
    dy = Math.max(y + h - dh, Math.min(y, dy));
  } else {
    dy = y + (h - dh) / 2 + ((panY || 0) / 50) * Math.max(0, (dh - h) / 2);
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPanel(ctx, rect, photo, grade, sliders, panelMeta, lift = 0) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (photo && photo.img) {
    const s = sliders.strength / 100;
    const sat = 1 + (grade.sat - 1) * s;
    const con = 1 + (grade.con - 1) * s;
    const bri = 1 + (grade.bri - 1) * s;
    ctx.filter = `saturate(${sat * sliders.saturation / 100}) contrast(${con * sliders.contrast / 100}) brightness(${bri}) sepia(${grade.sep * s}) hue-rotate(${grade.hue * s}deg)`;
    drawPhotoInto(ctx, photo.img, x, y, w, h, photo.zoom, photo.panX, photo.panY, photo.face);
    ctx.filter = 'none';
    // Unified grade wash: warm top, deep bottom, blended over the photo.
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, grade.top);
    grad.addColorStop(1, grade.bottom);
    ctx.globalCompositeOperation = grade.blend;
    ctx.globalAlpha = grade.alpha * s;
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  } else {
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, '#3b1d4e');
    grad.addColorStop(1, '#120a18');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(245,234,217,.65)';
    ctx.font = `600 ${Math.max(14, w * 0.05)}px "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', x + w / 2, y + h / 2);
    ctx.textAlign = 'left';
  }
  ctx.restore();

  // Thin light border, dark outer line — the poster-panel look.
  ctx.strokeStyle = 'rgba(255,255,255,.9)';
  ctx.lineWidth = Math.max(2, w * 0.006);
  ctx.strokeRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(0,0,0,.55)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);

  // Two-line caption on EVERY panel so each panel reads on its own:
  // line 1 = role (or place), line 2 = place · time — quip.
  // `lift` raises the caption box clear of the chrome title, which overlaps
  // the bottom of the panels — a caption struck through by the title reads
  // as a defect. Long lines are ellipsised to the panel width, never cut.
  const meta = panelMeta || {};
  const line1raw = meta.role || meta.place || '';
  const line2raw = meta.role
    ? [meta.place, meta.sub].filter(Boolean).join(' · ')
    : (meta.sub || '');
  if (!line1raw && !line2raw) return;
  const pad = Math.max(8, w * 0.025);
  const fs1 = Math.max(11, Math.round(Math.min(w * 0.045, h * 0.11, 34)));
  const fs2 = Math.max(10, Math.round(fs1 * 0.8));
  const fitLine = (text, px, bold) => {
    ctx.font = `${bold ? '700 ' : ''}${px}px "Segoe UI", sans-serif`;
    const maxW = w - pad * 2.6;
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
    return `${t}…`;
  };
  const line1 = fitLine(line1raw, fs1, true);
  const line2 = line2raw ? fitLine(line2raw, fs2, false) : '';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = `700 ${fs1}px "Segoe UI", sans-serif`;
  const w1 = ctx.measureText(line1).width;
  ctx.font = `${fs2}px "Segoe UI", sans-serif`;
  const w2 = line2 ? ctx.measureText(line2).width : 0;
  const bw = Math.max(w1, w2) + pad * 1.8;
  const bh = fs1 + (line2 ? fs2 + pad * 0.3 : 0) + pad * 1.1;
  const bx = x + pad * 0.7, by = y + h - pad * 0.7 - bh - lift;
  ctx.fillStyle = 'rgba(10,4,16,.85)';
  ctx.fillRect(bx, by, bw, bh);
  ctx.font = `700 ${fs1}px "Segoe UI", sans-serif`;
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText(line1, bx + pad * 0.9, by + pad * 0.55 + fs1 / 2);
  if (line2) {
    ctx.font = `${fs2}px "Segoe UI", sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.fillText(line2, bx + pad * 0.9, by + pad * 0.55 + fs1 + pad * 0.3 + fs2 / 2);
  }
  ctx.textBaseline = 'alphabetic';
}

// ---- poster furniture ------------------------------------------------------
// Top strip: five gold stars + press quote in caps + gold VOL chip.
function drawTopStrip(ctx, W, H, state, frame) {
  const topH = H * 0.052;
  const margin = frame + W * 0.012;
  ctx.textBaseline = 'middle';
  const starPx = Math.round(topH * 0.52);
  ctx.font = `${starPx}px "Segoe UI", sans-serif`;
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'left';
  ctx.fillText('★'.repeat(Math.max(0, Math.min(5, state.captions.stars || 0))), margin, topH / 2 + 1);
  const q = (state.captions.quote || '').toUpperCase();
  const qPx = fitFont(ctx, q, W * 0.58, Math.round(topH * 0.40), 'Georgia, serif', '700');
  ctx.font = `700 ${qPx}px Georgia, serif`;
  ctx.fillStyle = '#f5ead9';
  ctx.fillText(q, margin + starPx * 5.4, topH / 2 + 1);
  const chipText = (state.captions.volume || 'VOL. 06').toUpperCase();
  ctx.font = `700 ${Math.round(topH * 0.42)}px Anton, "Arial Narrow", sans-serif`;
  const tw = ctx.measureText(chipText).width;
  const cw = tw + topH * 0.8, chh = topH * 0.74;
  const cx = W - margin - cw, cy = (topH - chh) / 2;
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(cx, cy, cw, chh, chh / 2);
  else ctx.rect(cx, cy, cw, chh);
  ctx.fill();
  ctx.fillStyle = '#1c0b28';
  ctx.textAlign = 'center';
  ctx.fillText(chipText, cx + cw / 2, topH / 2 + 1);
  ctx.textAlign = 'left';
}

// Chrome-stripes title: horizontal sunset bands, thick dark outline,
// drop shadow. Falls back to a warm gradient (smooth) or a neon outline.
function drawChromeTitle(ctx, text, cx, cy, maxW, startPx, style, glow) {
  const px = fitFont(ctx, text, maxW, startPx, 'Anton, "Arial Narrow", sans-serif');
  ctx.font = `${px}px Anton, "Arial Narrow", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.save();
  const glowAmt = (glow || 0) / 100;
  if (style === 'neon') {
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = px * (0.18 + glowAmt * 0.35);
    ctx.strokeStyle = '#ff2e88';
    ctx.lineWidth = px * 0.06;
    ctx.strokeText(text, cx, cy);
    ctx.fillStyle = '#ffe3f1';
    ctx.fillText(text, cx, cy);
  } else if (style === 'smooth') {
    ctx.shadowColor = 'rgba(0,0,0,.6)';
    ctx.shadowBlur = px * 0.06;
    ctx.shadowOffsetY = px * 0.04;
    const grad = ctx.createLinearGradient(0, cy - px * 0.5, 0, cy + px * 0.5);
    grad.addColorStop(0, '#ffd166');
    grad.addColorStop(0.55, '#ff8c42');
    grad.addColorStop(1, '#e36414');
    ctx.strokeStyle = 'rgba(20,4,28,.95)';
    ctx.lineWidth = px * 0.12;
    ctx.strokeText(text, cx, cy);
    ctx.fillStyle = grad;
    ctx.fillText(text, cx, cy);
  } else {
    // chrome: hard sunset bands + sheen + heavy outline + shadow
    ctx.shadowColor = 'rgba(0,0,0,.65)';
    ctx.shadowBlur = px * (0.05 + glowAmt * 0.2);
    ctx.shadowOffsetY = px * 0.045;
    const grad = ctx.createLinearGradient(0, cy - px * 0.5, 0, cy + px * 0.5);
    grad.addColorStop(0.00, '#fff7d6');
    grad.addColorStop(0.22, '#ffe08a');
    grad.addColorStop(0.38, '#ffb347');
    grad.addColorStop(0.52, '#ff8c42');
    grad.addColorStop(0.68, '#ff5e8a');
    grad.addColorStop(0.85, '#c084fc');
    grad.addColorStop(1.00, '#8b5cf6');
    ctx.strokeStyle = '#1c0b28';
    ctx.lineWidth = px * 0.16;
    ctx.strokeText(text, cx, cy);
    ctx.fillStyle = grad;
    ctx.fillText(text, cx, cy);
    ctx.save();
    ctx.globalAlpha = 0.32;
    const sheen = ctx.createLinearGradient(0, cy - px * 0.5, 0, cy - px * 0.08);
    sheen.addColorStop(0, '#ffffff');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillText(text, cx, cy - px * 0.02);
    ctx.restore();
  }
  ctx.restore();
  return px;
}

// Gold starburst seal with straight, legible text (no arc text — the old
// seal's rim glyphs garbled at full size).
function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const N = 16;
  for (let i = 0; i < N * 2; i++) {
    const rr = i % 2 === 0 ? r : r * 0.82;
    const a = (i / (N * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.strokeStyle = '#8a5a00';
  ctx.lineWidth = Math.max(2, r * 0.05);
  ctx.stroke();
  ctx.fillStyle = '#1c0b28';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(r * 0.2)}px Anton, sans-serif`;
  ctx.fillText('ORIGINAL', 0, -r * 0.2);
  ctx.fillText('COVER ART', 0, r * 0.06);
  ctx.font = `${Math.round(r * 0.17)}px "Segoe UI", sans-serif`;
  ctx.fillText('★ ★ ★', 0, r * 0.38);
  ctx.restore();
}

// Deterministic pseudo-barcode (LCG, no Math.random — renders are stable).
function drawBarcode(ctx, x, y, w, h) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#111111';
  let bx = x + 3;
  let seed = 1234567;
  while (bx < x + w - 4) {
    seed = (seed * 16807) % 2147483647;
    const bw = 1 + (seed % 3);
    if (seed % 3 !== 0) ctx.fillRect(bx, y + 2, bw, h - 9);
    bx += bw + 1 + (seed % 2);
  }
  ctx.font = `${Math.max(8, Math.round(h * 0.16))}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('002113 122620', x + w / 2, y + h - 4);
  ctx.textBaseline = 'alphabetic';
}

function drawPalm(ctx, x, yBottom, height, color) {
  const s = height / 55;
  ctx.save();
  ctx.translate(x, yBottom);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -30, 2, -52);
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI * (0.12 + i * 0.19);
    ctx.beginPath();
    ctx.moveTo(2, -52);
    ctx.quadraticCurveTo(
      2 + Math.cos(a) * 28, -52 + Math.sin(a) * 22 - 8,
      2 + Math.cos(a) * 44, -52 + Math.sin(a) * 34 + 10,
    );
    ctx.stroke();
  }
  ctx.restore();
}

// ---- the cover ---------------------------------------------------------------
export function drawCover(canvas, state) {
  const size = SIZES[state.size] || SIZES.landscape;
  const W = size.w, H = size.h;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const grade = gradeById(state.grade);
  const sliders = state.sliders;
  const c = state.captions;
  const g = Math.max(4, W * 0.006);
  const frame = frameWidth(state.size);
  const pa = panelsArea(state.size);

  // Backdrop.
  ctx.fillStyle = '#160b1e';
  ctx.fillRect(0, 0, W, H);

  drawTopStrip(ctx, W, H, state, frame);

  // Chrome title metrics FIRST: the title overlaps the bottom of the photo
  // panels, so the caption boxes are lifted clear of its top edge before
  // any panel is drawn. (fitFont is idempotent — drawChromeTitle re-fits
  // with the same numbers and draws at the size computed here.)
  const panelsBottom = pa.top + pa.height;
  const title = (state.captions.title || 'GOLDEN SHORE').toUpperCase();
  const titlePx = fitFont(ctx, title, W * 0.92, Math.round(H * 0.135), 'Anton, "Arial Narrow", sans-serif');
  const titleY = panelsBottom + H * 0.015;
  const titleTop = titleY - (titlePx * 0.72 * 1.12) / 2;
  // Lift clears the glyphs plus their outline + drop shadow (about 0.1em
  // above the cap) — a caption the title even grazes reads as a defect.
  const captionLift = Math.max(0, panelsBottom - titleTop) + H * 0.028;

  const rects = panelRects(state);
  rects.forEach((rect, i) => {
    const slot = state.panels[i] || {};
    const photo = slot.photoIndex != null ? state.photos[slot.photoIndex] : null;
    const meta = {
      role: slot.role !== undefined ? slot.role : (photo && photo.role) || '',
      place: slot.place !== undefined ? slot.place : (photo && photo.place) || '',
      sub: slot.sub !== undefined ? slot.sub : (photo && photo.sub) || '',
    };
    drawPanel(ctx, rect,
      photo ? { ...photo, zoom: slot.zoom ?? photo.zoom, panX: slot.panX, panY: slot.panY } : null,
      grade, sliders, meta, captionLift);
  });

  // Halftone + grain over the panels; vignette over the whole poster.
  if (sliders.halftone > 0) {
    ctx.save();
    ctx.globalAlpha = (sliders.halftone / 100) * 0.28;
    ctx.fillStyle = halftonePattern(ctx, Math.max(6, Math.round(W / 160)));
    ctx.fillRect(frame, pa.top, W - 2 * frame, pa.height);
    ctx.restore();
  }
  if (sliders.grain > 0) {
    ctx.save();
    ctx.globalAlpha = (sliders.grain / 100) * 0.10;
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (sliders.vignette > 0) {
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, `rgba(0,0,0,${0.45 * (sliders.vignette / 100)})`);
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }

  // Chrome title, overlapping the bottom of the photo panels.
  // (titleY / titlePx were measured above, before the panels were drawn.)
  const titlePxDrawn = drawChromeTitle(ctx, title, W / 2, titleY, W * 0.92,
    titlePx, state.titleStyle || 'chrome', sliders.glow || 0);

  // Neon script subtitle (warm gold glow, not pink).
  const subY = titleY + titlePxDrawn * 0.52;
  if (c.subtitle) {
    const subPx = Math.round(titlePxDrawn * 0.27);
    ctx.font = `${subPx}px Pacifico, cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ffb347';
    ctx.shadowBlur = subPx * 0.5;
    ctx.fillStyle = '#fff3d6';
    ctx.fillText(c.subtitle, W / 2, subY);
    ctx.shadowBlur = 0;
    ctx.textBaseline = 'alphabetic';
  }

  // Ribbon line under the subtitle — clear of the billing block below it.
  const ribbonY = subY + titlePxDrawn * 0.30 + H * 0.014;
  if (c.ribbon) {
    const rPx = Math.max(13, Math.round(H * 0.017));
    ctx.font = `${rPx}px Anton, "Arial Narrow", sans-serif`;
    try { ctx.letterSpacing = `${Math.round(rPx * 0.25)}px`; } catch (e) { /* older canvas */ }
    ctx.fillStyle = '#ffe9a8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.ribbon.toUpperCase(), W / 2, ribbonY);
    try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
    ctx.textBaseline = 'alphabetic';
  }

  // Gold starburst seal, overlapping the bottom-right of the panels.
  drawSeal(ctx, W - frame - W * 0.055, panelsBottom - H * 0.01, H * 0.058);

  // Billing block — spaced below the ribbon, above the tagline strip.
  const billPx = Math.max(13, Math.round(H * 0.0165));
  ctx.font = `700 ${billPx}px "Segoe UI", sans-serif`;
  ctx.fillStyle = 'rgba(245,234,217,.92)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cast = (c.cast || '').toUpperCase();
  const billY1 = ribbonY + H * 0.026;
  ctx.fillText(`A VICE COAST PICTURE · STARRING ${cast}`, W / 2, billY1);
  ctx.fillText('SHOT ON YOUR OWN CAMERA · GRADED BY HAND', W / 2, billY1 + H * 0.028);
  ctx.textBaseline = 'alphabetic';

  // Tagline strip (warm amber) with palm silhouettes at both ends.
  const stripY = H * 0.878, stripH = H * 0.042;
  const tgrad = ctx.createLinearGradient(0, stripY, W, stripY);
  tgrad.addColorStop(0, '#ffb347');
  tgrad.addColorStop(0.5, '#ff8c42');
  tgrad.addColorStop(1, '#ffb347');
  ctx.fillStyle = tgrad;
  ctx.fillRect(frame, stripY, W - 2 * frame, stripH);
  drawPalm(ctx, frame + W * 0.022, stripY + stripH, stripH * 1.05, 'rgba(28,11,40,.35)');
  drawPalm(ctx, W - frame - W * 0.022, stripY + stripH, stripH * 1.05, 'rgba(28,11,40,.35)');
  ctx.font = `700 ${Math.round(stripH * 0.44)}px Anton, "Arial Narrow", sans-serif`;
  try { ctx.letterSpacing = `${Math.round(stripH * 0.12)}px`; } catch (e) { /* older canvas */ }
  ctx.fillStyle = '#1c0b28';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((c.tagline || '').toUpperCase(), W / 2, stripY + stripH / 2 + 1);
  try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
  ctx.textBaseline = 'alphabetic';

  // Footer: COMING SOON left, fine print centre, barcode right.
  const footY = H * 0.958;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff8c42';
  ctx.font = `700 ${Math.max(13, Math.round(H * 0.017))}px Anton, "Arial Narrow", sans-serif`;
  ctx.fillText('COMING SOON', frame + W * 0.012, footY);
  ctx.textAlign = 'center';
  ctx.font = `${Math.round(H * 0.011)}px "Segoe UI", sans-serif`;
  ctx.fillStyle = 'rgba(245,234,217,.6)';
  ctx.fillText(`STARRING YOU · SHOT ON YOUR OWN CAMERA · VICE COAST COVER STUDIO · ${(c.volume || '').toUpperCase()}`,
    W / 2, footY);
  ctx.textBaseline = 'alphabetic';
  drawBarcode(ctx, W - frame - W * 0.075, H * 0.925, W * 0.062, H * 0.055);

  // Gold outer frame + inner dark line.
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = Math.max(2, W * 0.002);
  ctx.strokeRect(frame / 2, frame / 2, W - frame, H - frame);
  ctx.strokeStyle = 'rgba(0,0,0,.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(frame + 3, frame + 3, W - 2 * frame - 6, H - 2 * frame - 6);

  return { panels: rects.length };
}
