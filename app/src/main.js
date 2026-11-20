// Vice Coast Cover Studio — editor wiring: photos, layouts, grades, captions,
// per-panel editing, undo, Surprise me, PNG export and ?shot= screenshot mode.
import { SIZES, LAYOUTS, GRADES, TITLE_STYLES, layoutById, gradeById, titleStyleById, drawCover, panelRects } from './cover.js';

const SAMPLES = [
  // face: vertical position of the face inside the photo (0..1) — the
  // renderer keeps it in frame (face-aware crop). zoom: default zoom
  // (slightly zoomed out for portraits so nothing is cut).
  { file: 'hero-driver.webp', name: 'The Driver', role: 'THE DRIVER', place: 'OCEAN DRIVE', sub: '7:40 PM — ENGINE RUNNING', face: 0.38, zoom: 92 },
  { file: 'hero-queen.webp', name: 'The Queen', role: 'THE QUEEN', place: 'MARINA BAY', sub: '8:12 PM — NEON HOUR', face: 0.47, zoom: 90 },
  { file: 'hero-fixer.webp', name: 'The Fixer', role: 'THE FIXER', place: 'THE PIER', sub: '5:47 PM — LAST CAST', face: 0.44, zoom: 90 },
  { file: 'hero-angler.webp', name: 'The Angler', role: 'THE ANGLER', place: 'SUNSET PIER', sub: '6:03 PM — CATCH OF THE DAY', face: 0.38, zoom: 90 },
  { file: 'scene-pier.webp', name: 'Pier', role: '', place: 'THE PIER', sub: '5:47 PM — LAST LIGHT' },
  { file: 'scene-boulevard.webp', name: 'Boulevard', role: '', place: 'OCEAN DRIVE', sub: '8:12 PM — NEON HOUR' },
  { file: 'scene-car.webp', name: 'Getaway Car', role: '', place: 'PARKING LOT 6', sub: '6:03 PM — GETAWAY READY' },
  { file: 'scene-skyline.webp', name: 'Skyline', role: '', place: 'SKYLINE ROW', sub: '9:03 PM — CITY NEVER SLEEPS' },
  { file: 'scene-rooftop.webp', name: 'Rooftop Bar', role: '', place: 'ROOFTOP BAR', sub: '9:03 PM — GOLDEN HOUR' },
];

const TITLES = ['GOLDEN SHORE', 'NIGHT SHIFT', 'VICE HEAT', 'GETAWAY', 'LAST LIGHT BAY', 'PALM ROW', 'TROPIC BAY', 'SUNSET DOCK'];
const SUBTITLES = ['where the sun never sets', 'one shift till dawn', 'chasing the last light', 'one last job before dawn', 'the coast belongs to us', 'born under neon signs'];
const TAGLINES = ['EVERY SUNSET HAS A PRICE', 'ONE COAST · NO RULES · COMING SOON', 'DRIVE FAST · SHINE BRIGHT', 'THE CITY NEVER SLEEPS', 'GOLDEN HOUR IS OURS'];

// Full-cover presets for the screenshot shots: each is a different cover
// (different title, grade, hero and panel set), never a re-crop of cover A.
// Panel entries are photo indices into SAMPLES (load order).
const PRESETS = {
  A: { size: 'landscape', layout: 'harbor', grade: 'golden-hour', titleStyle: 'chrome',
    captions: { title: 'GOLDEN SHORE', subtitle: 'where the sun never sets', tagline: 'EVERY SUNSET HAS A PRICE',
      ribbon: 'FOUR FRIENDS · ONE SHORE · NO WAY BACK', quote: '“SUNSET HAS NEVER LOOKED THIS GUILTY” — THE PALM POST',
      volume: 'VOL. 06', badge: 'ORIGINAL COVER ART', stars: 5, cast: 'THE QUEEN, THE FIXER, THE ANGLER, THE DRIVER' },
    panels: [1, 2, 3, 0, 4, 5, 8] },
  B: { size: 'landscape', layout: 'hero', grade: 'neon-night', titleStyle: 'chrome',
    captions: { title: 'NIGHT SHIFT', subtitle: 'one shift till dawn', tagline: 'THE CITY NEVER SLEEPS',
      ribbon: 'THREE FRIENDS · ONE NIGHT · NO WAY BACK', quote: '“SUNSET HAS NEVER LOOKED THIS GUILTY” — THE PALM POST',
      volume: 'VOL. 07', badge: 'ORIGINAL COVER ART', stars: 5, cast: 'THE FIXER, THE QUEEN, THE ANGLER' },
    panels: [2, 1, 3, 6] },
  C: { size: 'portrait', layout: 'hero-left', grade: 'golden-hour', titleStyle: 'chrome',
    captions: { title: 'VICE HEAT', subtitle: 'chasing the last light', tagline: 'DRIVE FAST · SHINE BRIGHT',
      ribbon: 'FOUR FRIENDS · ONE HEAT · NO WAY BACK', quote: '“SUNSET HAS NEVER LOOKED THIS GUILTY” — THE PALM POST',
      volume: 'VOL. 08', badge: 'ORIGINAL COVER ART', stars: 5, cast: 'THE ANGLER, THE QUEEN, THE DRIVER' },
    panels: [3, 1, 0, 8, 5] },
  D: { size: 'square', layout: 'mosaic', grade: 'neon-night', titleStyle: 'chrome',
    captions: { title: 'GETAWAY', subtitle: 'one last job before dawn', tagline: 'ONE COAST · NO RULES · COMING SOON',
      ribbon: 'FIVE FRIENDS · ONE GETAWAY', quote: '“SUNSET HAS NEVER LOOKED THIS GUILTY” — THE PALM POST',
      volume: 'VOL. 09', badge: 'ORIGINAL COVER ART', stars: 5, cast: 'THE QUEEN, THE FIXER, THE ANGLER, THE DRIVER' },
    panels: [6, 1, 2, 3, 0, 4, 5, 7, 8] },
};

const $ = (id) => document.getElementById(id);
const canvas = $('coverCanvas');
const fullCanvas = $('coverCanvasFull');

const state = {
  size: 'landscape',
  layout: 'harbor',
  grade: 'golden-hour',
  titleStyle: 'chrome',
  sliders: { strength: 80, contrast: 112, saturation: 135, grain: 35, vignette: 55, halftone: 0, glow: 30 },
  captions: {
    title: 'GOLDEN SHORE', subtitle: 'where the sun never sets', tagline: 'EVERY SUNSET HAS A PRICE',
    badge: 'ORIGINAL COVER ART', volume: 'VOL. 06', ribbon: 'FOUR FRIENDS · ONE SHORE · NO WAY BACK',
    stars: 5, quote: '“SUNSET HAS NEVER LOOKED THIS GUILTY” — THE PALM POST',
    cast: 'THE QUEEN, THE FIXER, THE ANGLER, THE DRIVER',
  },
  photos: [],          // { id, name, src, img, role, place, sub, face, zoom }
  panels: [],          // { photoIndex, zoom, panX, panY, role, place, sub }
  selected: 0,
  activePhoto: 0,
  exported: false,
};

const undoStack = [];
function snapshot() {
  return JSON.stringify({
    size: state.size, layout: state.layout, grade: state.grade, titleStyle: state.titleStyle,
    sliders: state.sliders, captions: state.captions, panels: state.panels, selected: state.selected,
  });
}
function pushUndo() {
  undoStack.push(snapshot());
  if (undoStack.length > 50) undoStack.shift();
}
function undo() {
  const prev = undoStack.pop();
  if (!prev) return;
  const s = JSON.parse(prev);
  Object.assign(state, s);
  syncControls();
  render();
}
$('undoBtn').addEventListener('click', undo);

// ---- rendering ---------------------------------------------------------------
function render() {
  const target = document.body.classList.contains('shot-cover') ? fullCanvas : canvas;
  drawCover(target, state);
  // Selection overlay on the editor preview: numbered badge + pink outline
  // on the selected panel, so the per-panel editing is visible at a glance.
  if (target === canvas) {
    const rects = panelRects(state);
    const r = rects[state.selected];
    if (r) {
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.strokeStyle = '#ff5e8a';
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 8]);
      ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
      ctx.setLineDash([]);
      const bx = r.x + 10, by = r.y + 10, br = 15;
      ctx.fillStyle = '#ff5e8a';
      ctx.beginPath();
      ctx.arc(bx + br, by + br, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `700 ${Math.round(br * 1.1)}px "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(state.selected + 1), bx + br, by + br + 1);
      ctx.restore();
    }
  }
  $('step1').classList.toggle('done', state.photos.length > 0);
  $('step2').classList.toggle('done', true);
  $('step3').classList.toggle('done', state.exported);
}

function ensureSlot(i) {
  if (!state.panels[i]) state.panels[i] = {};
  return state.panels[i];
}
function slotPhoto(i) {
  const slot = state.panels[i];
  if (slot && slot.photoIndex != null) return slot.photoIndex;
  if (state.photos.length === 0) return null;
  return i % state.photos.length;
}
function autoFill() {
  const layout = layoutById(state.layout);
  const rects = panelRects(state);
  for (let i = 0; i < rects.length; i++) {
    const slot = ensureSlot(i);
    if (slot.photoIndex == null) slot.photoIndex = slotPhoto(i);
  }
  render();
}

// ---- photos ------------------------------------------------------------------
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadSamples() {
  for (const s of SAMPLES) {
    if (state.photos.some((p) => p.src === `samples/${s.file}`)) continue;
    try {
      const img = await loadImage(`samples/${s.file}`);
      state.photos.push({ id: `sample-${s.file}`, name: s.name, src: `samples/${s.file}`, img, role: s.role, place: s.place, sub: s.sub, face: s.face, zoom: s.zoom });
    } catch (e) { /* a missing sample just stays out */ }
  }
  state.activePhoto = 0;
  autoFill();
  refreshPhotoUI();
}

function refreshPhotoUI() {
  const strip = $('photoStrip');
  strip.innerHTML = '';
  state.photos.forEach((p, i) => {
    const d = document.createElement('div');
    d.className = 'thumb';
    const img = document.createElement('img');
    img.src = p.src;
    img.alt = p.name;
    if (i === state.activePhoto) img.classList.add('picked');
    img.addEventListener('click', () => { state.activePhoto = i; refreshPhotoUI(); });
    const label = document.createElement('span');
    label.textContent = p.name;
    d.append(img, label);
    strip.append(d);
  });
  const lib = $('libraryGrid');
  lib.innerHTML = '';
  state.photos.forEach((p, i) => {
    const img = document.createElement('img');
    img.src = p.src;
    img.alt = p.name;
    if (i === state.activePhoto) img.classList.add('picked');
    img.addEventListener('click', () => { state.activePhoto = i; refreshPhotoUI(); });
    lib.append(img);
  });
  const sel = $('pPhoto');
  sel.innerHTML = '';
  state.photos.forEach((p, i) => {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = p.name;
    sel.append(o);
  });
  syncPanelEditor();
}

$('samplesBtn').addEventListener('click', () => loadSamples());
$('autofillBtn').addEventListener('click', () => { pushUndo(); autoFill(); });
$('fileInput').addEventListener('change', async (ev) => {
  const files = [...ev.target.files];
  for (const f of files) {
    const src = URL.createObjectURL(f);
    try {
      const img = await loadImage(src);
      state.photos.push({ id: `upload-${Date.now()}-${state.photos.length}`, name: f.name.replace(/\.[^.]+$/, ''), src, img, role: '', place: '', sub: '' });
    } catch (e) { /* unreadable file skipped */ }
  }
  ev.target.value = '';
  autoFill();
  refreshPhotoUI();
});

// ---- layout + grade controls -------------------------------------------------
function buildLayoutGrid() {
  const grid = $('layoutGrid');
  LAYOUTS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'layout-btn';
    b.dataset.layout = l.id;
    const mini = document.createElement('span');
    mini.className = 'mini';
    mini.style.position = 'relative';
    const rects = l.panels(100, 100, 2);
    rects.forEach((r) => {
      const i = document.createElement('i');
      i.style.position = 'absolute';
      i.style.left = `${r.x}%`;
      i.style.top = `${r.y}%`;
      i.style.width = `${r.w}%`;
      i.style.height = `${r.h}%`;
      mini.append(i);
    });
    const label = document.createElement('span');
    label.textContent = l.name;
    b.append(mini, label);
    b.addEventListener('click', () => {
      if (state.layout === l.id) return;
      pushUndo();
      state.layout = l.id;
      state.selected = 0;
      autoFill();
      syncControls();
    });
    grid.append(b);
  });
}
function buildGradeChips() {
  const wrap = $('gradeChips');
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.grade = g.id;
    b.textContent = g.name;
    b.addEventListener('click', () => {
      if (state.grade === g.id) return;
      pushUndo();
      state.grade = g.id;
      syncControls();
      render();
    });
    wrap.append(b);
  });
}
function buildTitleStyleButtons() {
  const wrap = $('titleStyleBtns');
  TITLE_STYLES.forEach((t) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.titleStyle = t.id;
    b.textContent = t.name;
    b.addEventListener('click', () => {
      if (state.titleStyle === t.id) return;
      pushUndo();
      state.titleStyle = t.id;
      syncControls();
      render();
    });
    wrap.append(b);
  });
}
function syncControls() {
  document.querySelectorAll('.layout-btn').forEach((b) => b.classList.toggle('active', b.dataset.layout === state.layout));
  document.querySelectorAll('.chip').forEach((b) => b.classList.toggle('active', b.dataset.grade === state.grade));
  document.querySelectorAll('[data-title-style]').forEach((b) => b.classList.toggle('active', b.dataset.titleStyle === state.titleStyle));
  document.querySelectorAll('.size-btn').forEach((b) => b.classList.toggle('active', b.dataset.size === state.size));
  const s = state.sliders;
  const set = (id, v) => { $(id).value = v; $(id + 'V').textContent = v; };
  set('slStrength', s.strength); set('slContrast', s.contrast); set('slSaturation', s.saturation);
  set('slGrain', s.grain); set('slVignette', s.vignette); set('slHalftone', s.halftone); set('slGlow', s.glow);
  $('sizeNote').textContent = SIZES[state.size].label;
  const c = state.captions;
  $('fTitle').value = c.title; $('fSubtitle').value = c.subtitle; $('fTagline').value = c.tagline;
  $('fBadge').value = c.badge; $('fVolume').value = c.volume; $('fRibbon').value = c.ribbon;
  $('fStars').value = c.stars; $('fQuote').value = c.quote; $('fCast').value = c.cast;
  syncPanelEditor();
}

function syncPanelEditor() {
  const i = state.selected;
  const slot = state.panels[i] || {};
  const photoIndex = slotPhoto(i);
  $('pPhoto').value = photoIndex == null ? '' : String(photoIndex);
  $('pZoom').value = slot.zoom || 100;
  $('pZoomV').textContent = `${slot.zoom || 100}%`;
  $('pPanX').value = slot.panX || 0;
  $('pPanXV').textContent = slot.panX || 0;
  $('pPanY').value = slot.panY || 0;
  $('pPanYV').textContent = slot.panY || 0;
  const photo = photoIndex != null ? state.photos[photoIndex] : null;
  $('pRole').value = slot.role !== undefined ? slot.role : (photo ? photo.role : '');
  $('pPlace').value = slot.place !== undefined ? slot.place : (photo ? photo.place : '');
  $('pSub').value = slot.sub !== undefined ? slot.sub : (photo ? photo.sub : '');
}

// ---- sliders + caption fields -----------------------------------------------
const SLIDER_KEYS = { slStrength: 'strength', slContrast: 'contrast', slSaturation: 'saturation', slGrain: 'grain', slVignette: 'vignette', slHalftone: 'halftone', slGlow: 'glow' };
Object.entries(SLIDER_KEYS).forEach(([id, key]) => {
  $(id).addEventListener('input', () => {
    state.sliders[key] = Number($(id).value);
    $(id + 'V').textContent = $(id).value;
    render();
  });
  $(id).addEventListener('change', pushUndo);
});
const CAPTION_FIELDS = { fTitle: 'title', fSubtitle: 'subtitle', fTagline: 'tagline', fBadge: 'badge', fVolume: 'volume', fRibbon: 'ribbon', fQuote: 'quote', fCast: 'cast' };
Object.entries(CAPTION_FIELDS).forEach(([id, key]) => {
  $(id).addEventListener('input', () => { state.captions[key] = $(id).value; render(); });
  $(id).addEventListener('change', pushUndo);
});
$('fStars').addEventListener('input', () => {
  state.captions.stars = Math.max(0, Math.min(5, Number($('fStars').value) || 0));
  render();
});
$('fStars').addEventListener('change', pushUndo);

// ---- size buttons --------------------------------------------------------------
document.querySelectorAll('.size-btn').forEach((b) => {
  b.addEventListener('click', () => {
    if (state.size === b.dataset.size) return;
    pushUndo();
    state.size = b.dataset.size;
    syncControls();
    render();
  });
});

// ---- panel editor ---------------------------------------------------------------
$('pPhoto').addEventListener('change', () => {
  pushUndo();
  ensureSlot(state.selected).photoIndex = Number($('pPhoto').value);
  render();
});
$('pZoom').addEventListener('input', () => {
  ensureSlot(state.selected).zoom = Number($('pZoom').value);
  $('pZoomV').textContent = `${$('pZoom').value}%`;
  render();
});
$('pZoom').addEventListener('change', pushUndo);
$('pPanX').addEventListener('input', () => {
  ensureSlot(state.selected).panX = Number($('pPanX').value);
  $('pPanXV').textContent = $('pPanX').value;
  render();
});
$('pPanX').addEventListener('change', pushUndo);
$('pPanY').addEventListener('input', () => {
  ensureSlot(state.selected).panY = Number($('pPanY').value);
  $('pPanYV').textContent = $('pPanY').value;
  render();
});
$('pPanY').addEventListener('change', pushUndo);
[['pRole', 'role'], ['pPlace', 'place'], ['pSub', 'sub']].forEach(([id, key]) => {
  $(id).addEventListener('input', () => { ensureSlot(state.selected)[key] = $(id).value; render(); });
  $(id).addEventListener('change', pushUndo);
});
$('pSwapBtn').addEventListener('click', () => {
  pushUndo();
  const n = layoutById(state.layout).panels(100, 100, 1).length;
  const a = state.selected, b = (a + 1) % n;
  const pa = state.panels[a] || {}, pb = state.panels[b] || {};
  [pa.photoIndex, pb.photoIndex] = [pb.photoIndex, pa.photoIndex];
  state.panels[a] = pa; state.panels[b] = pb;
  render();
});
$('pClearBtn').addEventListener('click', () => {
  pushUndo();
  const slot = ensureSlot(state.selected);
  slot.role = ''; slot.place = ''; slot.sub = '';
  syncPanelEditor();
  render();
});

// Click the preview canvas to pick a panel (and drop the active photo into it).
canvas.addEventListener('click', (ev) => {
  const r = canvas.getBoundingClientRect();
  const px = (ev.clientX - r.left) * (canvas.width / r.width);
  const py = (ev.clientY - r.top) * (canvas.height / r.height);
  const rects = panelRects(state);
  const hit = rects.findIndex((rc) => px >= rc.x && px <= rc.x + rc.w && py >= rc.y && py <= rc.y + rc.h);
  if (hit >= 0) {
    state.selected = hit;
    if (state.photos.length && state.activePhoto != null) {
      pushUndo();
      ensureSlot(hit).photoIndex = state.activePhoto;
    }
    syncPanelEditor();
    render();
  }
});

// ---- surprise me + export ---------------------------------------------------------
$('surpriseBtn').addEventListener('click', () => {
  pushUndo();
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  state.layout = pick(LAYOUTS).id;
  state.grade = pick(GRADES).id;
  state.captions.title = pick(TITLES);
  state.captions.subtitle = pick(SUBTITLES);
  state.captions.tagline = pick(TAGLINES);
  state.sliders.strength = 60 + Math.floor(Math.random() * 40);
  state.sliders.grain = Math.floor(Math.random() * 60);
  state.sliders.halftone = Math.random() < 0.3 ? 20 + Math.floor(Math.random() * 50) : 0;
  const n = layoutById(state.layout).panels(100, 100, 1).length;
  for (let i = 0; i < n; i++) {
    ensureSlot(i).photoIndex = Math.floor(Math.random() * Math.max(1, state.photos.length));
  }
  state.selected = 0;
  syncControls();
  render();
});

function exportPNG() {
  const size = SIZES[state.size];
  const off = document.createElement('canvas');
  drawCover(off, state);
  off.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-coast-cover-${state.size}-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    state.exported = true;
    render();
  }, 'image/png');
}
$('exportBtn').addEventListener('click', exportPNG);

// Export all 3 sizes at once: the current cover re-rendered at 1080×1080,
// 1080×1350 and 1920×1080, one PNG download per size.
function exportAll() {
  const keep = state.size;
  ['square', 'portrait', 'landscape'].forEach((sizeId, i) => {
    const size = SIZES[sizeId];
    state.size = sizeId;
    const off = document.createElement('canvas');
    drawCover(off, state);
    off.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-coast-cover-${sizeId}-${size.w}x${size.h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    }, 'image/png');
  });
  state.size = keep;
  state.exported = true;
  syncControls();
  render();
}
$('exportAllBtn').addEventListener('click', exportAll);
$('exportAllBtn2').addEventListener('click', exportAll);

// ---- screenshot mode (?shot=cover|editor) -----------------------------------------
async function runShot() {
  const q = new URLSearchParams(location.search);
  const shot = q.get('shot');
  if (!shot) return false;
  await document.fonts.ready;
  // A ?preset=A|B|C|D applies a whole cover (size, layout, grade, title
  // style, captions) before samples load; its panel set is applied after,
  // once the photo indices exist.
  const preset = PRESETS[q.get('preset')] || null;
  if (preset) {
    state.size = preset.size;
    state.layout = preset.layout;
    state.grade = preset.grade;
    state.titleStyle = preset.titleStyle;
    Object.assign(state.captions, preset.captions);
  } else {
    if (q.get('size') && SIZES[q.get('size')]) state.size = q.get('size');
    if (q.get('layout') && layoutById(q.get('layout'))) state.layout = q.get('layout');
    if (q.get('grade') && gradeById(q.get('grade'))) state.grade = q.get('grade');
    if (q.get('title')) state.captions.title = q.get('title');
  }
  await loadSamples();
  if (preset) {
    state.panels = preset.panels.map((photoIndex) => ({ photoIndex }));
    state.selected = 0;
  }
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    $('coverOnly').hidden = false;
    render();
  } else {
    document.body.classList.add('shot-editor');
    syncControls();
    render();
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__shotReady = true;
  return true;
}

// ---- boot -------------------------------------------------------------------------
buildLayoutGrid();
buildGradeChips();
buildTitleStyleButtons();
syncControls();
document.fonts.load('100px Anton').catch(() => {});
document.fonts.load('100px Pacifico').catch(() => {});
runShot().then((isShot) => {
  if (!isShot) render();
});
