const drawCanvas = document.getElementById('drawCanvas');
const guideCanvas = document.getElementById('guideCanvas');
const drawCtx = drawCanvas.getContext('2d');
const guideCtx = guideCanvas.getContext('2d');

const modeSelect = document.getElementById('mode');
const brushInput = document.getElementById('brush');
const clearBtn = document.getElementById('clearBtn');
const nextBtn = document.getElementById('nextBtn');
const hint = document.getElementById('hint');
const stars = document.getElementById('stars');

const heroPhoto = document.getElementById('heroPhoto');
const heroFallback = document.getElementById('heroFallback');
const photoInput = document.getElementById('photoInput');

const SHAPES = ['circle', 'triangle', 'square', 'heart', 'star'];
const STORY_WORDS = [
  'Dragon', 'moon', 'Rocket', 'forest', 'Treasure', 'castle', 'Wizard', 'river', 'Pirate', 'planet',
  'comet', 'Map', 'Mermaid', 'dinosaur', 'volcano', 'Galaxy', 'jungle', 'Knight', 'Phoenix', 'adventure',
  'cave', 'Lantern', 'island', 'Robot', 'rainbow', 'Meteor', 'Ninja', 'crystal', 'griffin', 'spaceship',
  'magic', 'Quest', 'thunder', 'tornado', 'Captain', 'fossil', 'diamond', 'canyon', 'starlight', 'whisper',
  'puzzle', 'Secret', 'campfire', 'waterfall', 'otter', 'owl', 'falcon', 'safari', 'horizon', 'marvel',
  'harbor', 'legend', 'beacon', 'echo', 'voyage', 'courage', 'harvest', 'meadow', 'summit', 'wonder',
];
const STORY_SETTINGS = [
  'in the whispering forest',
  'on the moon bridge',
  'under the crystal cave',
  'beside the dragon river',
  'behind the pirate waterfall',
  'near the wizard tower',
  'above the rainbow canyon',
  'in the glowing jungle',
];

let state = {
  drawing: false,
  brush: 8,
  color: '#4B7BEC',
  points: [],
  score: 0,
  challenge: null,
  guidePixels: null,
  audioCtx: null,
};

function resetDrawLayer() {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  state.points = [];
}

function clearGuide() {
  guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
  state.guidePixels = null;
}

function configureBrush() {
  drawCtx.lineCap = 'round';
  drawCtx.lineJoin = 'round';
  drawCtx.lineWidth = state.brush;
  drawCtx.strokeStyle = state.color;
}

function canvasPos(evt) {
  const rect = drawCanvas.getBoundingClientRect();
  return {
    x: ((evt.clientX - rect.left) / rect.width) * drawCanvas.width,
    y: ((evt.clientY - rect.top) / rect.height) * drawCanvas.height,
  };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(items) {
  return items[randomInt(0, items.length - 1)];
}

function mixedCaseWord(word) {
  return word
    .split('')
    .map((ch) => (Math.random() > 0.5 ? ch.toUpperCase() : ch.toLowerCase()))
    .join('');
}

function cacheGuidePixels() {
  const data = guideCtx.getImageData(0, 0, guideCanvas.width, guideCanvas.height).data;
  const pixels = [];
  for (let y = 0; y < guideCanvas.height; y += 3) {
    for (let x = 0; x < guideCanvas.width; x += 3) {
      const idx = (y * guideCanvas.width + x) * 4;
      if (data[idx + 3] > 20) pixels.push({ x, y });
    }
  }
  state.guidePixels = pixels;
}

function drawTraceGuide() {
  clearGuide();
  guideCtx.strokeStyle = '#99b8e6';
  guideCtx.lineWidth = 16;
  guideCtx.setLineDash([15, 10]);
  guideCtx.beginPath();

  const nodes = Array.from({ length: 6 }, (_, i) => ({
    x: 120 + i * 150,
    y: randomInt(140, 490),
  }));

  guideCtx.moveTo(nodes[0].x, nodes[0].y);
  nodes.slice(1).forEach((node) => guideCtx.lineTo(node.x, node.y));
  guideCtx.stroke();
  guideCtx.setLineDash([]);

  state.challenge = { type: 'trace' };
  hint.textContent = 'Trace right on top of the dotted road for best accuracy.';
  cacheGuidePixels();
}

function drawShapeGuide() {
  clearGuide();
  const shape = randomItem(SHAPES);

  guideCtx.strokeStyle = '#8bb0e4';
  guideCtx.lineWidth = 8;
  guideCtx.setLineDash([10, 8]);
  guideCtx.beginPath();
  const cx = 500;
  const cy = 310;
  const size = 160;

  if (shape === 'circle') {
    guideCtx.arc(cx, cy, size, 0, Math.PI * 2);
  } else if (shape === 'triangle') {
    guideCtx.moveTo(cx, cy - size);
    guideCtx.lineTo(cx - size, cy + size * 0.8);
    guideCtx.lineTo(cx + size, cy + size * 0.8);
    guideCtx.closePath();
  } else if (shape === 'square') {
    guideCtx.rect(cx - size, cy - size, size * 2, size * 2);
  } else if (shape === 'heart') {
    guideCtx.moveTo(cx, cy + size * 0.65);
    guideCtx.bezierCurveTo(cx + size * 1.2, cy - size * 0.2, cx + size * 0.7, cy - size * 1.2, cx, cy - size * 0.5);
    guideCtx.bezierCurveTo(cx - size * 0.7, cy - size * 1.2, cx - size * 1.2, cy - size * 0.2, cx, cy + size * 0.65);
  } else {
    const spikes = 5;
    const outer = size;
    const inner = size * 0.45;
    let rot = Math.PI / 2 * 3;
    guideCtx.moveTo(cx, cy - outer);
    for (let i = 0; i < spikes; i++) {
      guideCtx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
      rot += Math.PI / spikes;
      guideCtx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
      rot += Math.PI / spikes;
    }
    guideCtx.closePath();
  }

  guideCtx.stroke();
  guideCtx.setLineDash([]);

  state.challenge = { type: 'shape', shape };
  hint.textContent = `Trace the ${shape} shape carefully.`;
  cacheGuidePixels();
}

function drawWordGuide() {
  clearGuide();
  const word = mixedCaseWord(randomItem(STORY_WORDS));
  const setting = randomItem(STORY_SETTINGS);

  guideCtx.strokeStyle = '#8aaee0';
  guideCtx.lineWidth = 4;
  guideCtx.setLineDash([6, 5]);
  guideCtx.font = 'italic 118px "Comic Sans MS", "Segoe Script", cursive';
  guideCtx.textAlign = 'center';
  guideCtx.textBaseline = 'middle';
  guideCtx.strokeText(word, 500, 340);
  guideCtx.setLineDash([]);

  guideCtx.strokeStyle = '#cad9ef';
  guideCtx.lineWidth = 2;
  guideCtx.beginPath();
  guideCtx.moveTo(170, 390);
  guideCtx.lineTo(830, 390);
  guideCtx.stroke();

  state.challenge = { type: 'words', word };
  hint.textContent = `Story word: "${word}" ${setting}. Trace right on the guide letters.`;
  cacheGuidePixels();
}

function drawFreeGuide() {
  clearGuide();
  state.challenge = { type: 'free' };
  hint.textContent = 'Free Draw: Draw a hero, a place, and one action!';
}

function refreshChallenge() {
  resetDrawLayer();
  const mode = modeSelect.value;

  if (mode === 'trace') drawTraceGuide();
  if (mode === 'shape') drawShapeGuide();
  if (mode === 'words') drawWordGuide();
  if (mode === 'free') drawFreeGuide();
}

function startDraw(evt) {
  evt.preventDefault();
  state.drawing = true;
  const p = canvasPos(evt);
  state.points.push(p);
  configureBrush();
  drawCtx.beginPath();
  drawCtx.moveTo(p.x, p.y);
}

function moveDraw(evt) {
  if (!state.drawing) return;
  evt.preventDefault();
  const p = canvasPos(evt);
  state.points.push(p);
  drawCtx.lineTo(p.x, p.y);
  drawCtx.stroke();
}

function finishDraw() {
  if (!state.drawing) return;
  state.drawing = false;
  checkProgress();
}

function addStars(n) {
  state.score += n;
  stars.textContent = state.score;
}

function distanceSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function computeAccuracy() {
  if (!state.guidePixels || state.points.length < 25) return 0;

  const nearRadiusSq = 34 * 34;
  let onGuideCount = 0;
  for (const p of state.points) {
    let close = false;
    for (let i = 0; i < state.guidePixels.length; i += 5) {
      if (distanceSq(p, state.guidePixels[i]) <= nearRadiusSq) {
        close = true;
        break;
      }
    }
    if (close) onGuideCount += 1;
  }

  const pointAccuracy = onGuideCount / state.points.length;

  let covered = 0;
  for (let i = 0; i < state.guidePixels.length; i += 10) {
    const gp = state.guidePixels[i];
    let hit = false;
    for (let j = 0; j < state.points.length; j += 4) {
      if (distanceSq(gp, state.points[j]) <= nearRadiusSq) {
        hit = true;
        break;
      }
    }
    if (hit) covered += 1;
  }

  const coverage = covered / Math.max(1, Math.ceil(state.guidePixels.length / 10));
  return Math.max(0, Math.min(1, pointAccuracy * 0.65 + coverage * 0.35));
}

function getAudioCtx() {
  if (!state.audioCtx) {
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return state.audioCtx;
}

function playCheerAndClap() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;

  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.12 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.2);
  });

  for (let i = 0; i < 10; i++) {
    const bufferSize = 0.06 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let j = 0; j < bufferSize; j++) output[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize / 4));

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800 + Math.random() * 1200;
    const gain = ctx.createGain();
    const t = now + 0.6 + i * 0.07;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.09, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.08);
  }
}

function gradeByAccuracy(activityName) {
  const accuracy = computeAccuracy();

  if (accuracy >= 0.9) {
    addStars(4);
    hint.textContent = `${activityName}: AMAZING! ${Math.round(accuracy * 100)}% +4 stars 🌟👏`;
    playCheerAndClap();
  } else if (accuracy >= 0.78) {
    addStars(3);
    hint.textContent = `${activityName}: Awesome accuracy (${Math.round(accuracy * 100)}%) +3 stars 🌟`;
  } else if (accuracy >= 0.55) {
    addStars(2);
    hint.textContent = `${activityName}: Good control (${Math.round(accuracy * 100)}%) +2 stars 🌟`;
  } else if (accuracy >= 0.35) {
    addStars(1);
    hint.textContent = `${activityName}: Nice effort (${Math.round(accuracy * 100)}%) +1 star 🌟`;
  } else {
    hint.textContent = `${activityName}: Try tracing closer to the guide. Accuracy ${Math.round(accuracy * 100)}%.`;
  }
}

function checkProgress() {
  if (state.points.length < 30) return;

  if (state.challenge.type === 'free') {
    addStars(1);
    hint.textContent = 'Great imagination! +1 star 🌟';
    return;
  }

  if (state.challenge.type === 'trace') {
    gradeByAccuracy('Trace Path');
    return;
  }

  if (state.challenge.type === 'shape') {
    gradeByAccuracy(`Shape ${state.challenge.shape}`);
    return;
  }

  if (state.challenge.type === 'words') {
    gradeByAccuracy(`Story word "${state.challenge.word}"`);
  }
}

function attachPointerEvents() {
  drawCanvas.addEventListener('pointerdown', startDraw);
  drawCanvas.addEventListener('pointermove', moveDraw);
  drawCanvas.addEventListener('pointerup', finishDraw);
  drawCanvas.addEventListener('pointerleave', finishDraw);
  drawCanvas.addEventListener('pointercancel', finishDraw);
}

function attachControls() {
  brushInput.addEventListener('input', (e) => {
    state.brush = Number(e.target.value);
  });

  document.querySelectorAll('.swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      document.querySelector('.swatch.active')?.classList.remove('active');
      swatch.classList.add('active');
      state.color = swatch.dataset.color;
    });
  });

  clearBtn.addEventListener('click', resetDrawLayer);
  nextBtn.addEventListener('click', refreshChallenge);
  modeSelect.addEventListener('change', refreshChallenge);
}


function showHeroFallback() {
  heroPhoto.hidden = true;
  heroFallback.hidden = false;
}

function showHeroImage(src) {
  heroPhoto.hidden = false;
  heroFallback.hidden = true;
  heroPhoto.src = src;
}

function loadSavedPhoto() {
  try {
    const saved = localStorage.getItem('denanHeroPhoto');
    if (saved) showHeroImage(saved);
  } catch (_) {
    // ignore storage access issues
  }
}

function attachPhotoPicker() {
  heroPhoto.addEventListener('error', showHeroFallback);

  photoInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (!dataUrl) return;

      // Always show the selected image immediately (even if storage quota is full).
      showHeroImage(dataUrl);

      // Save for next launch when possible; large photos may exceed localStorage limits.
      try {
        localStorage.setItem('denanHeroPhoto', dataUrl);
      } catch (_) {
        hint.textContent = 'Photo loaded for this session. If it does not save, use a smaller image file.';
      }
    };
    reader.onerror = () => {
      hint.textContent = 'Could not read that image file. Please try another JPG/PNG.';
    };
    reader.readAsDataURL(file);

    // Allow picking the same file again later.
    photoInput.value = '';
  });
}

function init() {
  attachPointerEvents();
  attachControls();
  attachPhotoPicker();
  loadSavedPhoto();
  configureBrush();
  refreshChallenge();
}

init();
