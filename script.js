const drawCanvas = document.getElementById('drawCanvas');
const guideCanvas = document.getElementById('guideCanvas');
const drawCtx = drawCanvas.getContext('2d');
const guideCtx = guideCanvas.getContext('2d');

const modeSelect = document.getElementById('mode');
const letterPick = document.getElementById('letterPick');
const letterWrap = document.getElementById('letterWrap');
const brushInput = document.getElementById('brush');
const clearBtn = document.getElementById('clearBtn');
const nextBtn = document.getElementById('nextBtn');
const hint = document.getElementById('hint');
const stars = document.getElementById('stars');

let state = {
  drawing: false,
  brush: 8,
  color: '#4B7BEC',
  points: [],
  score: 0,
  challenge: null,
};

const SHAPES = ['circle', 'triangle', 'square', 'heart', 'star'];

function resetDrawLayer() {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  state.points = [];
}

function clearGuide() {
  guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
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

function drawTraceGuide() {
  clearGuide();
  guideCtx.strokeStyle = '#99b8e6';
  guideCtx.lineWidth = 18;
  guideCtx.setLineDash([16, 12]);
  guideCtx.beginPath();

  const nodes = Array.from({ length: 6 }, (_, i) => ({
    x: 120 + i * 150,
    y: randomInt(140, 490),
  }));

  guideCtx.moveTo(nodes[0].x, nodes[0].y);
  nodes.slice(1).forEach((node) => guideCtx.lineTo(node.x, node.y));
  guideCtx.stroke();
  guideCtx.setLineDash([]);

  state.challenge = { type: 'trace', nodes };
  hint.textContent = 'Follow the dotted road from left to right. Keep your line steady!';
}

function drawShapeGuide() {
  clearGuide();
  const shape = SHAPES[randomInt(0, SHAPES.length - 1)];

  guideCtx.strokeStyle = '#8bb0e4';
  guideCtx.lineWidth = 10;
  guideCtx.setLineDash([10, 8]);
  guideCtx.beginPath();
  const cx = 500;
  const cy = 310;
  const size = 170;

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
  } else if (shape === 'star') {
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
    guideCtx.lineTo(cx, cy - outer);
    guideCtx.closePath();
  }

  guideCtx.stroke();
  guideCtx.setLineDash([]);

  state.challenge = { type: 'shape', shape };
  hint.textContent = `Trace the ${shape} shape and decorate it.`;
}

function drawLetterGuide() {
  clearGuide();
  const letter = letterPick.value.toUpperCase();

  guideCtx.font = 'bold 390px Nunito, sans-serif';
  guideCtx.textAlign = 'center';
  guideCtx.textBaseline = 'middle';
  guideCtx.strokeStyle = '#8aaee0';
  guideCtx.lineWidth = 8;
  guideCtx.setLineDash([12, 10]);
  guideCtx.strokeText(letter, 500, 330);
  guideCtx.setLineDash([]);

  state.challenge = { type: 'letters', letter };
  hint.textContent = `Write the letter ${letter}. Say the letter sound out loud for bonus fun!`;
}

function drawFreeGuide() {
  clearGuide();
  state.challenge = { type: 'free' };
  hint.textContent = 'Free Draw: Make a tiny story picture (character + place + action)!';
}

function refreshChallenge() {
  resetDrawLayer();
  const mode = modeSelect.value;
  letterWrap.style.display = mode === 'letters' ? 'grid' : 'none';

  if (mode === 'trace') drawTraceGuide();
  if (mode === 'shape') drawShapeGuide();
  if (mode === 'letters') drawLetterGuide();
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

function checkProgress() {
  const count = state.points.length;
  if (count < 30) return;

  if (state.challenge.type === 'free') {
    addStars(1);
    hint.textContent = 'Great imagination! +1 star 🌟';
    return;
  }

  if (state.challenge.type === 'letters') {
    addStars(2);
    hint.textContent = `Nice writing! +2 stars 🌟 Keep practicing ${state.challenge.letter}.`;
    return;
  }

  if (state.challenge.type === 'shape') {
    addStars(2);
    hint.textContent = `Awesome shape control! +2 stars 🌟`;
    return;
  }

  if (state.challenge.type === 'trace') {
    const pathSpread = Math.max(...state.points.map((p) => p.x)) - Math.min(...state.points.map((p) => p.x));
    if (pathSpread > 620) {
      addStars(3);
      hint.textContent = 'Excellent tracing from start to finish! +3 stars 🌟';
    }
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
  letterPick.addEventListener('change', () => {
    if (modeSelect.value === 'letters') drawLetterGuide();
  });
}

function init() {
  attachPointerEvents();
  attachControls();
  configureBrush();
  refreshChallenge();
}

init();
