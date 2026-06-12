let strokeW = 2;
let strokeLen = 78;
let baseRotation = 0;
let mode = 1;

const VIEW_W = 1286.39;
const VIEW_H = 246.64;
const TARGET_WIDTH_RATIO = 0.75;
const SYMBOL_SCALE = 2.47;

const MODE1_MIN_STROKE = 2;
const MODE1_MAX_STROKE = 30;
const MODE1_RADIUS = 260;
const COLOR_DOT_GAP = 10;
const COLOR_GROUP_GAP = COLOR_DOT_GAP * 3;
const RANDOM_BUTTON_W = 16;

const PALETTE = {
  'Deep Moss': '#021C03',
  'Field Green': '#58AE5D',
  'Signal Violet': '#857ABE',
  'Archive Taupe': '#AEA28C',
  'Paper White': '#F2F2F2',
  'Electric Sprout': '#00FF06',
  'Vector Blue': '#6252FF',
  'Soft Moss': '#BAD3BA'
};
const PALETTE_NAMES = Object.keys(PALETTE);

const MODE_LABELS = {
  1: '1 - Proximity weight',
  2: '2 - Wave',
  3: '3 - Cursor follow',
  4: '4 - Mouse map',
  5: '5 - Drop (click)',
  6: '6 - Noise field',
  7: '7 - Scatter (click)',
  8: '8 - Per-letter'
};

let bgColorIndex = PALETTE_NAMES.indexOf('Deep Moss');
let strokeColorIndex = PALETTE_NAMES.indexOf('Electric Sprout');
let currentBgColor;
let currentStrokeColor;
let targetBgColor;
let targetStrokeColor;

let modeDots = [];
let strokeDots = [];
let bgDots = [];
let randomizeDot = null;

let weightSlider, lengthSlider, rotationSlider;
let glyphs;
let offsets = [];
let velocities = [];
let exploding = false;
let letterAngles = [0, 0, 0, 0, 0, 0];
let letterSpeeds = [0, 0, 0, 0, 0, 0];

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeCap(ROUND);
  textFont('Helvetica');
  textSize(12);

  currentBgColor = color(PALETTE[PALETTE_NAMES[bgColorIndex]]);
  targetBgColor = color(PALETTE[PALETTE_NAMES[bgColorIndex]]);

  currentStrokeColor = color(PALETTE[PALETTE_NAMES[strokeColorIndex]]);
  targetStrokeColor = color(PALETTE[PALETTE_NAMES[strokeColorIndex]]);
  glyphs = [
    { x: -1.47, y: -1.47, r: 0, letter: 0 },
    { x: -1.47, y: 85.04, r: 0, letter: 0 },
    { x: 85.00, y: 85.04, r: 0, letter: 0 },
    { x: 171.48, y: 85.04, r: 0, letter: 0 },
    { x: 127.98, y: 128.34, r: 0, letter: 0 },
    { x: -1.47, y: 171.55, r: 0, letter: 0 },

    { x: 257.79, y: -1.47, r: 0, letter: 1 },
    { x: 257.79, y: 85.04, r: 0, letter: 1 },
    { x: 257.79, y: 171.55, r: 0, letter: 1 },
    { x: 383.14, y: -1.47, r: 0, letter: 1 },
    { x: 339.95, y: 41.75, r: 0, letter: 1 },
    { x: 339.95, y: 128.14, r: 0, letter: 1 },
    { x: 383.14, y: 171.55, r: 0, letter: 1 },

    { x: 470.14, y: 171.54, r: 0, letter: 2 },
    { x: 513.32, y: 128.32, r: 0, letter: 2 },
    { x: 513.32, y: 41.93, r: 0, letter: 2 },
    { x: 470.14, y: -1.49, r: 0, letter: 2 },

    { x: 728.95, y: -1.47, r: 0, letter: 3 },
    { x: 642.56, y: -1.47, r: 0, letter: 3 },
    { x: 675.07, y: 85.04, r: 0, letter: 3 },
    { x: 599.31, y: 41.75, r: 0, letter: 3 },
    { x: 750.84, y: 128.14, r: 0, letter: 3 },
    { x: 621.33, y: 171.55, r: 0, letter: 3 },
    { x: 707.42, y: 171.55, r: 0, letter: 3 },
    { x: 945.14, y: -1.47, r: 0, letter: 4 },
    { x: 858.75, y: -1.47, r: 0, letter: 4 },
    { x: 891.26, y: 85.04, r: 0, letter: 4 },
    { x: 815.50, y: 41.75, r: 0, letter: 4 },
    { x: 967.03, y: 128.14, r: 0, letter: 4 },
    { x: 837.52, y: 171.55, r: 0, letter: 4 },
    { x: 923.62, y: 171.55, r: 0, letter: 4 },

    { x: 1081.45, y: -1.47, r: 0, letter: 5 },
    { x: 1167.87, y: -1.47, r: 0, letter: 5 },
    { x: 1038.25, y: 41.75, r: 0, letter: 5 },
    { x: 1211.12, y: 41.75, r: 0, letter: 5 },
    { x: 1081.66, y: 128.14, r: 0, letter: 5 },
    { x: 1167.87, y: 128.14, r: 0, letter: 5 },
    { x: 1038.25, y: 171.55, r: 0, letter: 5 },
    { x: 1211.31, y: 171.55, r: 0, letter: 5 }
  ];

  for (let i = 0; i < glyphs.length; i++) {
    offsets.push({ x: 0, y: 0 });
    velocities.push({ x: random(-12, 12), y: random(-12, 12) });
  }

  weightSlider = createSlider(1, 40, strokeW, 0.1);
  lengthSlider = createSlider(4, 120, strokeLen, 0.1);
  rotationSlider = createSlider(-180, 180, baseRotation, 1);

  layoutUI();
  styleSlider(weightSlider);
  styleSlider(lengthSlider);
  styleSlider(rotationSlider);
}

function draw() {
  targetBgColor = color(PALETTE[PALETTE_NAMES[bgColorIndex]]);
  targetStrokeColor = color(PALETTE[PALETTE_NAMES[strokeColorIndex]]);

  currentBgColor = lerpColor(currentBgColor, targetBgColor, 0.08);
  currentStrokeColor = lerpColor(currentStrokeColor, targetStrokeColor, 0.08);

  background(currentBgColor);

  strokeW = weightSlider.value();
  strokeLen = lengthSlider.value();
  baseRotation = rotationSlider.value();
  let activeStrokeW = strokeW;

  if (mode === 1) {
    activeStrokeW = nearestMode1StrokeWeight();
  } else if (mode === 4) {
    activeStrokeW = map(mouseY, height, 0, 1, 40);
  }

  const scaleFactor = (width * TARGET_WIDTH_RATIO) / VIEW_W;
  const drawW = VIEW_W * scaleFactor;
  const drawH = VIEW_H * scaleFactor;
  const x = (width - drawW) / 2;
  const y = (height - drawH) / 2 - 30;
  updateLetterSpeeds();

  push();
  translate(x, y);
  scale(scaleFactor);
  drawLogo(activeStrokeW);
  pop();

  drawUI(activeStrokeW);
}

function getWorldMouse() {
  const sf = (width * TARGET_WIDTH_RATIO) / VIEW_W;
  const canvasX = (width - VIEW_W * sf) / 2;
  const canvasY = (height - VIEW_H * sf) / 2 - 30;
  return {
    x: (mouseX - canvasX) / sf,
    y: (mouseY - canvasY) / sf
  };
}

function mode1StrokeWeightForGlyph(g, ox, oy) {
  const worldMouse = getWorldMouse();
  const cx = g.x + ox + 15.5 * SYMBOL_SCALE;
  const cy = g.y + oy + 15.5 * SYMBOL_SCALE;
  const d = dist(worldMouse.x, worldMouse.y, cx, cy);

  let influence = map(d, 0, MODE1_RADIUS, 1, 0, true);
  influence = influence * influence * (3 - 2 * influence);
  return lerp(MODE1_MIN_STROKE, MODE1_MAX_STROKE, influence);
}

function nearestMode1StrokeWeight() {
  let maxWeight = MODE1_MIN_STROKE;

  for (let i = 0; i < glyphs.length; i++) {
    const w = mode1StrokeWeightForGlyph(glyphs[i], offsets[i].x, offsets[i].y);
    if (w > maxWeight) maxWeight = w;
  }

  return maxWeight;
}
function updateLetterSpeeds() {
  const worldMouse = getWorldMouse();

  for (let letter = 0; letter < 6; letter++) {
    let minD = Infinity;

    for (let j = 0; j < glyphs.length; j++) {
      if (glyphs[j].letter === letter) {
        const gx = glyphs[j].x + 15.5 * SYMBOL_SCALE;
        const gy = glyphs[j].y + 15.5 * SYMBOL_SCALE;
        const d = dist(worldMouse.x, worldMouse.y, gx, gy);
        if (d < minD) minD = d;
      }
    }
    const targetSpeed = map(minD, 0, 500, 0.06, 0.005, true);
    letterSpeeds[letter] = lerp(letterSpeeds[letter], targetSpeed, 0.12);
    letterAngles[letter] += letterSpeeds[letter];
  }
}

function drawLogo(activeStrokeW) {
  const t = millis() / 1000;

  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    let extraRot = 0;
    let extraLen = strokeLen;
    let ox = 0;
    let oy = 0;
    let localStrokeW = activeStrokeW;

    if (mode === 1) {
      localStrokeW = mode1StrokeWeightForGlyph(g, ox, oy);
    } else if (mode === 2) {
      extraRot = sin(t * (2 / 3) + g.x * 0.008) * Math.PI;
    } else if (mode === 3) {
      const worldMouse = getWorldMouse();
      const cx = g.x + 15.5 * SYMBOL_SCALE;
      const cy = g.y + 15.5 * SYMBOL_SCALE;
      extraRot = atan2(worldMouse.y - cy, worldMouse.x - cx);
    } else if (mode === 4) {
      extraLen = map(mouseX, 0, width, 4, 120);
    } else if (mode === 5) {
      if (exploding) {
        velocities[i].y += 0.35;
        offsets[i].x += velocities[i].x;
        offsets[i].y += velocities[i].y;
        const floorY = VIEW_H + 120 - g.y;

        if (offsets[i].y > floorY) {
          offsets[i].y = floorY;
          velocities[i].y *= -0.35;
          velocities[i].x *= 0.92;
        }

        extraRot = offsets[i].y * 0.01;
      } else {
        offsets[i].x += (0 - offsets[i].x) * 0.08;
        offsets[i].y += (0 - offsets[i].y) * 0.08;
        velocities[i].x *= 0.9;
        velocities[i].y *= 0.9;
        extraRot = offsets[i].y * 0.005;
      }

      ox = offsets[i].x;
      oy = offsets[i].y;
    } else if (mode === 6) {
      extraRot = map(noise(g.x * 0.003, g.y * 0.003, t * 0.4), 0, 1, -Math.PI, Math.PI);
    } else if (mode === 7) {
      if (exploding) {
        offsets[i].x += velocities[i].x;
        offsets[i].y += velocities[i].y;
        velocities[i].x *= 0.95;
        velocities[i].y *= 0.95;
      } else {
        offsets[i].x += (0 - offsets[i].x) * 0.08;
        offsets[i].y += (0 - offsets[i].y) * 0.08;
      }

      ox = offsets[i].x;
      oy = offsets[i].y;
      extraRot = exploding ? offsets[i].x * 0.01 : 0;
    } else if (mode === 8) {
      extraRot = letterAngles[g.letter];
    }

    if (mode === 1) {
      localStrokeW = mode1StrokeWeightForGlyph(g, ox, oy);
    }
    drawSymbol(g.x + ox, g.y + oy, g.r, extraLen, extraRot, localStrokeW);
  }
}

function drawSymbol(tx, ty, localRotation, len, animRot, activeStrokeW) {
  const l = len !== undefined ? len : strokeLen;
  const ar = animRot !== undefined ? animRot : 0;

  push();
  translate(tx, ty);
  rotate(localRotation);
  scale(SYMBOL_SCALE);

  translate(15.5, 15.5);
  rotate(radians(baseRotation) + ar);

  stroke(currentStrokeColor);
  strokeWeight(activeStrokeW / SYMBOL_SCALE);
  strokeCap(ROUND);
  noFill();

  const half = l / 2 / SYMBOL_SCALE;
  const diag = half / Math.sqrt(2);

  line(-half, 0, half, 0);
  line(0, -half, 0, half);
  line(-diag, -diag, diag, diag);
  line(diag, -diag, -diag, diag);
  pop();
}

function drawUI(activeStrokeW) {
  modeDots = [];
  strokeDots = [];
  bgDots = [];
  randomizeDot = null;

  drawModeDots();

  const y = height - 34;
  const strokePaletteW = colorDotsWidth(strokeColorIndex);
  const bgPaletteW = colorDotsWidth(bgColorIndex);
  const totalW = strokePaletteW + COLOR_GROUP_GAP + RANDOM_BUTTON_W + COLOR_GROUP_GAP + bgPaletteW;
  const startX = (width - totalW) / 2;

  const strokeCenterX = startX + strokePaletteW / 2;
  const randomCenterX = startX + strokePaletteW + COLOR_GROUP_GAP + RANDOM_BUTTON_W / 2;
  const bgCenterX = startX + strokePaletteW + COLOR_GROUP_GAP + RANDOM_BUTTON_W + COLOR_GROUP_GAP + bgPaletteW / 2;

  drawColorDots(strokeCenterX, y, strokeColorIndex, strokeDots);
  drawRandomizeDot(randomCenterX, y);
  drawColorDots(bgCenterX, y, bgColorIndex, bgDots);
}

function drawModeDots() {
  const dotH = 16;
  const inactiveW = 16;
  const activeW = 32;
  const gap = 12;
  const y = 18;

  let totalW = 0;

  for (let i = 0; i < 8; i++) {
    totalW += i === mode - 1 ? activeW : inactiveW;
    if (i < 7) totalW += gap;
  }

  let x = (width - totalW) / 2;

  stroke(currentStrokeColor);
  noFill();
  for (let i = 0; i < 8; i++) {
    const w = i === mode - 1 ? activeW : inactiveW;
    rect(x, y, w, dotH, dotH / 2);
    modeDots.push({ x, y, w, h: dotH, mode: i + 1 });
    x += w + gap;
  }

  fill(currentStrokeColor);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(14);
  text(MODE_LABELS[mode].replace(/^[0-9] - /, ''), width / 2, y + 32);
}

function colorDotsWidth(activeIndex) {
  const inactiveW = 16;
  const activeW = 34;

  let totalW = 0;

  for (let i = 0; i < PALETTE_NAMES.length; i++) {
    totalW += i === activeIndex ? activeW : inactiveW;
    if (i < PALETTE_NAMES.length - 1) totalW += COLOR_DOT_GAP;
  }

  return totalW;
}

function drawColorDots(centerX, y, activeIndex, hitAreas) {
  const dotH = 16;
  const inactiveW = 16;
  const activeW = 34;

  let totalW = colorDotsWidth(activeIndex);
  let x = centerX - totalW / 2;
  const bg = PALETTE[PALETTE_NAMES[bgColorIndex]];

  for (let i = 0; i < PALETTE_NAMES.length; i++) {
    const w = i === activeIndex ? activeW : inactiveW;
    const c = PALETTE[PALETTE_NAMES[i]];

    fill(c);

    if (colorsMatch(c, bg)) {
      stroke(contrastStrokeFor(c));
      strokeWeight(1);
    } else {
      noStroke();
    }

    rect(x, y, w, dotH, dotH / 2);
    hitAreas.push({ x, y, w, h: dotH, index: i });
    x += w + COLOR_DOT_GAP;
  }

  noStroke();
}

function drawRandomizeDot(centerX, y) {
  const dotH = 16;
  const dotW = RANDOM_BUTTON_W;
  const x = centerX - dotW / 2;

  noFill();
  stroke(currentStrokeColor);
  strokeWeight(1);
  rect(x, y, dotW, dotH, dotH / 2);

  noStroke();
  fill(currentStrokeColor);
  textAlign(CENTER, CENTER);
  textSize(10);
  text('R', centerX, y + dotH / 2);

  randomizeDot = { x, y, w: dotW, h: dotH };
}

function colorsMatch(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}

function contrastStrokeFor(hex) {
  const c = color(hex);
  const brightnessValue = red(c) * 0.299 + green(c) * 0.587 + blue(c) * 0.114;
  return brightnessValue > 150 ? '#000000' : '#ffffff';
}

function keyPressed() {
  const n = int(key);
  if (n >= 1 && n <= 8) {
    setMode(n);
  } else if (key === 'r' || key === 'R') {
    randomizeColors();
  }
}

function randomizeColors() {
  bgColorIndex = floor(random(PALETTE_NAMES.length));

  do {
    strokeColorIndex = floor(random(PALETTE_NAMES.length));
  } while (strokeColorIndex === bgColorIndex);
}
function setMode(n) {
  mode = n;
  exploding = false;

  for (let i = 0; i < glyphs.length; i++) {
    offsets[i] = { x: 0, y: 0 };
    velocities[i] = { x: random(-12, 12), y: random(-12, 12) };
  }

  for (let i = 0; i < 6; i++) {
    letterAngles[i] = 0;
    letterSpeeds[i] = 0;
  }
}
function mousePressed() {
  for (const dot of modeDots) {
    if (hitTest(dot)) {
      setMode(dot.mode);
      return;
    }
  }

  for (const dot of strokeDots) {
    if (hitTest(dot)) {
      strokeColorIndex = dot.index;
      return;
    }
  }
  for (const dot of bgDots) {
    if (hitTest(dot)) {
      bgColorIndex = dot.index;
      return;
    }
  }

  if (randomizeDot && hitTest(randomizeDot)) {
    randomizeColors();
    return;
  }

  if (mode === 5 || mode === 7) {
    exploding = !exploding;
    if (exploding) {
      for (let i = 0; i < glyphs.length; i++) {
        velocities[i] = { x: random(-12, 12), y: random(-12, 12) };
      }
    }
  }
}

function hitTest(area) {
  return mouseX >= area.x &&
    mouseX <= area.x + area.w &&
    mouseY >= area.y &&
    mouseY <= area.y + area.h;
}
function layoutUI() {
  weightSlider.position(40, height + 100);
  lengthSlider.position(320, height + 100);
  rotationSlider.position(600, height + 100);

  weightSlider.style('width', '130px');
  lengthSlider.style('width', '220px');
  rotationSlider.style('width', '220px');
}

function styleSlider(slider) {
  slider.style('-webkit-appearance', 'none');
  slider.style('appearance', 'none');
  slider.style('background', 'transparent');
  slider.style('height', '20px');
  slider.style('outline', 'none');
  slider.style('accent-color', 'transparent');

  const css = `
    input[type=range] {
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      height: 20px;
      margin: 0;
      padding: 0;
    }

    input[type=range]::-webkit-slider-runnable-track {
      height: 1px;
      background: #000;
      border: none;
    }

    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 1px;
      height: 16px;
      background: #000;
      border: none;
      margin-top: -8px;
    }

    input[type=range]::-moz-range-track {
      height: 1px;
      background: #000;
      border: none;
    }

    input[type=range]::-moz-range-thumb {
      width: 1px;
      height: 16px;
      background: #000;
      border: none;
      border-radius: 0;
    }
  `;

  let existing = document.getElementById('custom-slider-style');
  if (!existing) {
    let styleTag = document.createElement('style');
    styleTag.id = 'custom-slider-style';
    styleTag.innerHTML = css;
    document.head.appendChild(styleTag);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  layoutUI();
}