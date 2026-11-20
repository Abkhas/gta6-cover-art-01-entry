// Vice Coast Cover Studio — canvas cover renderer.
// Draws the multi-panel poster: per-panel photos with a unified sunset/neon
// grade, giant gradient title, script subtitle, role labels, place captions,
// seal, stars, quote, tagline strip and fine print. No network, no libraries.

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
// above the title band. Panel 0 is the hero wherever one exists.
export const LAYOUTS = [
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

export const GRADES = [
  { id: 'vice-sunset', name: 'Vice Sunset', sat: 1.35, con: 1.12, bri: 1.0, sep: 0.22, hue: -6,
    top: '#ff9a3c', bottom: '#7b2ff7', blend: 'overlay', alpha: 0.55 },
  { id: 'neon-night', name: 'Neon Night', sat: 1.5, con: 1.16, bri: 0.96, sep: 0.05, hue: -14,
    top: '#ff2e88', bottom: '#1b2aff', blend: 'overlay', alpha: 0.6 },
  { id: 'golden-hour', name: 'Golden Hour', sat: 1.25, con: 1.08, bri: 1.04, sep: 0.42, hue: -8,
    top: '#ffd166', bottom: '#e36414', blend: 'soft-light', alpha: 0.7 },
  { id: 'pink-teal', name: 'Pink / Teal', sat: 1.42, con: 1.1, bri: 1.0, sep: 0.08, hue: 8,
    top: '#ff5e8a', bottom: '#0fb5a8', blend: 'overlay', alpha: 0.55 },
  { id: 'comic-ink', name: 'Comic Ink', sat: 1.12, con: 1.45, bri: 1.02, sep: 0.1, hue: 0,
    top: '#ffb347', bottom: '#5b21b6', blend: 'soft-light', alpha: 0.4 },
  { id: 'noir-heat', name: 'Noir Heat', sat: 0.85, con: 1.3, bri: 0.92, sep: 0.35, hue: -4,
    top: '#ff3b30', bottom: '#111111', blend: 'overlay', alpha: 0.5 },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}
export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}
export function titleBandHeight(sizeId, h) {
  return sizeId === 'landscape' ? h * 0.30 : sizeId === 'portrait' ? h * 0.24 : h * 0.27;
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

function drawArcText(ctx, text, cx, cy, radius, a0, a1) {
  const n = text.length;
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * (n === 1 ? 0.5 : i / (n - 1)));
    ctx.save();
    ctx.translate(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
}

// ---- photo panel -----------------------------------------------------------
function drawPhotoInto(ctx, img, x, y, w, h, zoom, panX, panY) {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.max(w / iw, h / ih) * (zoom / 100);
  const dw = iw * scale, dh = ih * scale;
  // panX/panY in [-50, 50] slide the crop window across the full overflow,
  // so -50 shows the top/left edge and +50 the bottom/right edge.
  const dx = x + (w - dw) / 2 + ((panX || 0) / 50) * Math.max(0, (dw - w) / 2);
  const dy = y + (h - dh) / 2 + ((panY || 0) / 50) * Math.max(0, (dh - h) / 2);
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPanel(ctx, rect, photo, grade, sliders, panelMeta) {
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
    drawPhotoInto(ctx, photo.img, x, y, w, h, photo.zoom || 100, photo.panX || 0, photo.panY || 0);
    ctx.filter = 'none';
    // Unified grade wash: warm top, purple bottom, blended over the photo.
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

  // Role label (hero panels) or place caption (scene panels), bottom-left.
  const meta = panelMeta || {};
  const label = meta.role || '';
  const place = meta.place || '';
  const sub = meta.sub || '';
  const pad = Math.max(8, w * 0.03);
  ctx.textBaseline = 'middle';
  if (label) {
    const fs = Math.max(13, Math.round(h * 0.052));
    ctx.font = `${fs}px Anton, "Arial Narrow", sans-serif`;
    const tw = ctx.measureText(label).width;
    const barH = fs * 1.7;
    const bx = x + pad * 0.6, by = y + h - pad * 0.6 - barH;
    ctx.fillStyle = 'rgba(10,4,16,.85)';
    ctx.fillRect(bx, by, tw + pad * 1.6, barH);
    ctx.fillStyle = '#fff';
    ctx.fillText(label, bx + pad * 0.8, by + barH / 2 + 1);
  } else if (place) {
    const fs = Math.max(11, Math.round(w * 0.042));
    const fs2 = Math.max(10, Math.round(fs * 0.85));
    ctx.font = `700 ${fs}px "Segoe UI", sans-serif`;
    const w1 = ctx.measureText(place).width;
    ctx.font = `${fs2}px "Segoe UI", sans-serif`;
    const w2 = sub ? ctx.measureText(sub).width : 0;
    const bw = Math.max(w1, w2) + pad * 1.6;
    const bh = fs + (sub ? fs2 : 0) + pad * 1.1;
    const bx = x + pad * 0.6, by = y + h - pad * 0.6 - bh;
    ctx.fillStyle = 'rgba(10,4,16,.82)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.textAlign = 'left';
    ctx.font = `700 ${fs}px "Segoe UI", sans-serif`;
    ctx.fillStyle = '#ffe9a8';
    ctx.fillText(place, bx + pad * 0.8, by + pad * 0.55 + fs / 2);
    if (sub) {
      ctx.font = `${fs2}px "Segoe UI", sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      ctx.fillText(sub, bx + pad * 0.8, by + pad * 0.55 + fs + fs2 / 2);
    }
  }
  ctx.textBaseline = 'alphabetic';
}

// ---- the cover ---------------------------------------------------------------
export function drawCover(canvas, state) {
  const size = SIZES[state.size] || SIZES.landscape;
  const W = size.w, H = size.h;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const layout = layoutById(state.layout);
  const grade = gradeById(state.grade);
  const sliders = state.sliders;
  const titleH = titleBandHeight(state.size, H);
  const ch = H - titleH;
  const g = Math.max(4, W * 0.006);

  // Backdrop.
  ctx.fillStyle = '#160b1e';
  ctx.fillRect(0, 0, W, H);

  const panels = layout.panels(W, ch, g);
  panels.forEach((rect, i) => {
    const slot = state.panels[i] || {};
    const photo = slot.photoIndex != null ? state.photos[slot.photoIndex] : null;
    const meta = {
      role: slot.role !== undefined ? slot.role : (photo && photo.role) || '',
      place: slot.place !== undefined ? slot.place : (photo && photo.place) || '',
      sub: slot.sub !== undefined ? slot.sub : (photo && photo.sub) || '',
    };
    // Hero panels carry the role label; scene panels carry place + sub-line.
    if (rect.hero) { meta.place = ''; meta.sub = ''; }
    else meta.role = '';
    drawPanel(ctx, rect, photo ? { ...photo, zoom: slot.zoom, panX: slot.panX, panY: slot.panY } : null,
      grade, sliders, meta);
  });

  // Halftone + grain + vignette over the whole poster.
  if (sliders.halftone > 0) {
    ctx.save();
    ctx.globalAlpha = (sliders.halftone / 100) * 0.28;
    ctx.fillStyle = halftonePattern(ctx, Math.max(6, Math.round(W / 160)));
    ctx.fillRect(0, 0, W, ch);
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

  drawTitleBand(ctx, W, H, titleH, state, grade);
  return { panels: panels.length };
}

function drawTitleBand(ctx, W, H, titleH, state, grade) {
  const y0 = H - titleH;
  const c = state.captions;
  const margin = W * 0.03;

  // Title band backdrop: deep plum with a sunset glow at the top edge.
  const bg = ctx.createLinearGradient(0, y0, 0, H);
  bg.addColorStop(0, '#1c0b28');
  bg.addColorStop(1, '#0d0512');
  ctx.fillStyle = bg;
  ctx.fillRect(0, y0, W, titleH);
  const glow = ctx.createLinearGradient(0, y0, 0, y0 + titleH * 0.35);
  glow.addColorStop(0, 'rgba(255,94,138,.35)');
  glow.addColorStop(1, 'rgba(255,94,138,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, y0, W, titleH * 0.35);

  // Reserve the HUD block (left) and the seal (right) so the title never
  // collides with them; the title centers in the free middle band.
  const sealR = titleH * 0.27;
  const hudW = W * 0.17;
  const midLeft = margin + hudW;
  const midRight = W - margin - 2 * sealR - W * 0.02;
  const cx = (midLeft + midRight) / 2;
  const maxW = Math.max(200, midRight - midLeft);
  const title = (c.title || 'PALM HEIST').toUpperCase();
  const titlePx = fitFont(ctx, title, maxW, Math.round(titleH * 0.52), 'Anton, "Arial Narrow", sans-serif');
  const titleGrad = ctx.createLinearGradient(0, y0 + titleH * 0.1, 0, y0 + titleH * 0.62);
  titleGrad.addColorStop(0, '#ffb347');
  titleGrad.addColorStop(0.5, '#ff5e8a');
  titleGrad.addColorStop(1, '#8b5cf6');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const ty = y0 + titleH * 0.34;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(20,4,28,.95)';
  ctx.lineWidth = titlePx * 0.14;
  ctx.strokeText(title, cx, ty);
  ctx.fillStyle = titleGrad;
  ctx.fillText(title, cx, ty);

  // Neon script subtitle.
  if (c.subtitle) {
    const subPx = Math.round(titlePx * 0.30);
    ctx.font = `${subPx}px Pacifico, cursive`;
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = subPx * 0.55;
    ctx.fillStyle = '#ffe3f1';
    ctx.fillText(c.subtitle, cx, y0 + titleH * 0.62);
    ctx.shadowBlur = 0;
  }

  // Press quote, small, under the subtitle, clear of the tagline strip.
  if (c.quote) {
    const stripH = Math.max(26, H * 0.038);
    const stripTop = H - stripH - Math.max(16, H * 0.016);
    const qPx = fitFont(ctx, c.quote, maxW * 0.95, Math.round(titleH * 0.085), 'Georgia, serif');
    ctx.font = `italic 600 ${qPx}px Georgia, serif`;
    ctx.fillStyle = 'rgba(245,234,217,.75)';
    ctx.fillText(c.quote, cx, Math.min(y0 + titleH * 0.78, stripTop - Math.round(titleH * 0.06)));
  }

  // Seal: original-cover-art stamp, right side of the title band.
  const sx = W - margin - sealR - W * 0.01;
  const sy = y0 + titleH * 0.36;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(-0.18);
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = Math.max(2, sealR * 0.06);
  ctx.beginPath(); ctx.arc(0, 0, sealR, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, sealR * 0.82, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.font = `${Math.round(sealR * 0.20)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  drawArcText(ctx, 'ORIGINAL COVER ART • ', 0, 0, sealR * 0.91, -Math.PI * 0.78, -Math.PI * 0.22);
  ctx.font = `${Math.round(sealR * 0.22)}px Anton, sans-serif`;
  ctx.fillText('EST. 2026', 0, sealR * 0.08);
  ctx.font = `${Math.round(sealR * 0.16)}px "Segoe UI", sans-serif`;
  ctx.fillText(c.volume || 'VOL. 06', 0, sealR * 0.38);
  ctx.restore();

  // HUD: wanted stars, left side of the title band.
  const hx = margin;
  const hy = y0 + titleH * 0.30;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff';
  ctx.font = `${Math.round(titleH * 0.11)}px Anton, sans-serif`;
  ctx.fillText(c.hud || 'WANTED', hx, hy - titleH * 0.06);
  const stars = '★'.repeat(Math.max(0, Math.min(5, c.stars || 0))) + '☆'.repeat(5 - Math.max(0, Math.min(5, c.stars || 0)));
  ctx.fillStyle = '#ffd166';
  ctx.font = `${Math.round(titleH * 0.13)}px "Segoe UI", sans-serif`;
  ctx.fillText(stars, hx, hy + titleH * 0.12);
  if (c.ribbon) {
    ctx.font = `700 ${Math.round(titleH * 0.085)}px "Segoe UI", sans-serif`;
    const rw = ctx.measureText(c.ribbon).width + titleH * 0.16;
    ctx.fillStyle = '#ff5e8a';
    ctx.fillRect(hx, hy + titleH * 0.22, rw, titleH * 0.13);
    ctx.fillStyle = '#fff';
    ctx.fillText(c.ribbon, hx + titleH * 0.08, hy + titleH * 0.315);
  }

  // Tagline strip + fine print at the very bottom.
  const stripH = Math.max(26, H * 0.038);
  ctx.fillStyle = '#ff5e8a';
  ctx.fillRect(0, H - stripH - Math.max(16, H * 0.016), W, stripH);
  ctx.fillStyle = '#fff';
  ctx.font = `700 ${Math.round(stripH * 0.42)}px Anton, "Arial Narrow", sans-serif`;
  ctx.textAlign = 'center';
  try { ctx.letterSpacing = `${Math.round(stripH * 0.12)}px`; } catch (e) { /* older canvas */ }
  ctx.fillText((c.tagline || '').toUpperCase(), W / 2, H - stripH / 2 - Math.max(16, H * 0.016) + stripH * 0.02);
  try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
  ctx.font = `${Math.round(H * 0.011)}px "Segoe UI", sans-serif`;
  ctx.fillStyle = 'rgba(245,234,217,.55)';
  ctx.fillText(`${c.badge || ''}  ·  ${c.volume || ''}  ·  VICE COAST COVER STUDIO  ·  ALL PHOTOS MODEL-MADE`,
    W / 2, H - Math.max(16, H * 0.016) / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}
