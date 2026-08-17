const PALETTE = [
  { name: 'Bone', value: '#f2efe8' },
  { name: 'Ink', value: '#11130f' },
  { name: 'Moss', value: '#234325' },
  { name: 'Stem', value: '#78a671' },
  { name: 'Sprout', value: '#c1de6a' },
  { name: 'Mineral', value: '#8c98a1' },
  { name: 'Clay', value: '#b56f4c' },
  { name: 'Violet', value: '#6d5fa7' }
];

const MODES = [
  'Tension',
  'Scan',
  'Orbit',
  'Field',
  'Cut',
  'Bloom'
];

const BASE_W = 1280;
const BASE_H = 800;
const MODULES = 76;
const RINGS = 7;
const MAX_PIXEL_RATIO = 2;

let bgIndex = 0;
let fgIndex = 1;
let accentIndex = 3;
let mode = 1;
let seedValue = 1209;
let modules = [];
let swatches = [];
let modeHits = [];
let randomHit = null;
let cursorEase;
let pulse = 0;

function setup() {
  pixelDensity(min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  createCanvas(windowWidth, windowHeight);
  strokeCap(SQUARE);
  textFont('Helvetica');
  cursorEase = createVector(width / 2, height / 2);
  rebuild();
}

function draw() {
  randomSeed(seedValue);
  noiseSeed(seedValue);

  const bg = color(PALETTE[bgIndex].value);
  const fg = color(PALETTE[fgIndex].value);
  const accent = color(PALETTE[accentIndex].value);
  background(bg);

  cursorEase.x = lerp(cursorEase.x, mouseX || width / 2, 0.08);
  cursorEase.y = lerp(cursorEase.y, mouseY || height / 2, 0.08);
  pulse = lerp(pulse, mouseIsPressed ? 1 : 0, 0.12);

  const fit = min(width / BASE_W, height / BASE_H);
  const stageW = BASE_W * fit;
  const stageH = BASE_H * fit;
  const originX = (width - stageW) / 2;
  const originY = (height - stageH) / 2;
  const t = millis() * 0.001;

  push();
  translate(originX, originY);
  scale(fit);
  drawField(bg, fg, accent, t);
  drawModules(fg, accent, t);
  drawGhostMarks(fg, accent, t);
  pop();

  drawUI(fg, accent);
}

function rebuild() {
  modules = [];
  const cx = BASE_W / 2;
  const cy = BASE_H / 2;

  for (let i = 0; i < MODULES; i++) {
    const ring = i % RINGS;
    const group = floor(i / RINGS);
    const a = (group / ceil(MODULES / RINGS)) * TWO_PI + ring * 0.17;
    const radius = map(ring, 0, RINGS - 1, 86, 322) + random(-18, 18);
    const x = cx + cos(a) * radius * random(0.82, 1.08);
    const y = cy + sin(a) * radius * random(0.58, 0.96);

    modules.push({
      x,
      y,
      a,
      ring,
      group,
      len: random(34, 108),
      weight: random(1.2, 4.8),
      phase: random(TWO_PI),
      drift: random(0.6, 1.45)
    });
  }
}

function drawField(bg, fg, accent, t) {
  noFill();

  const alphaFg = alphaFor(bg, 32);
  const alphaAccent = alphaFor(bg, 56);

  stroke(red(fg), green(fg), blue(fg), alphaFg);
  strokeWeight(1);
  for (let y = 118; y <= 682; y += 28) {
    const wobble = sin(t * 0.7 + y * 0.02) * 8;
    line(138 + wobble, y, 1142 - wobble, y);
  }

  stroke(red(accent), green(accent), blue(accent), alphaAccent);
  for (let x = 184; x <= 1096; x += 72) {
    const top = 136 + noise(x * 0.01, t * 0.3) * 52;
    const bottom = 664 - noise(x * 0.02, 8 + t * 0.3) * 52;
    line(x, top, x, bottom);
  }

  strokeWeight(2);
  rect(146, 116, 988, 568);
}

function drawModules(fg, accent, t) {
  const sx = (cursorEase.x - (width - BASE_W * min(width / BASE_W, height / BASE_H)) / 2) / min(width / BASE_W, height / BASE_H);
  const sy = (cursorEase.y - (height - BASE_H * min(width / BASE_W, height / BASE_H)) / 2) / min(width / BASE_W, height / BASE_H);

  for (let i = 0; i < modules.length; i++) {
    const m = modules[i];
    const d = dist(sx, sy, m.x, m.y);
    const influence = smoothstep(360, 0, d);
    const orbit = t * (0.18 + m.ring * 0.018) + m.phase;
    let ox = 0;
    let oy = 0;
    let rot = m.a + HALF_PI;
    let len = m.len;
    let weight = m.weight;

    if (mode === 1) {
      ox = cos(m.a) * influence * 62;
      oy = sin(m.a) * influence * 38;
      len += influence * 62;
      weight += influence * 7;
      rot += influence * sin(t * 2 + m.phase) * 0.7;
    } else if (mode === 2) {
      const scan = (sin(t * 1.5 + m.y * 0.018) + 1) / 2;
      const gate = smoothstep(0.22, 0.98, scan);
      ox = gate * 44 * sin(m.phase + t);
      len = lerp(10, 146, gate);
      weight = lerp(0.8, 7.5, gate);
      rot += PI / 4 * gate;
    } else if (mode === 3) {
      ox = cos(orbit) * (18 + m.ring * 3);
      oy = sin(orbit) * (12 + m.ring * 2);
      rot = orbit + m.a;
      len += sin(orbit * 1.7) * 24;
    } else if (mode === 4) {
      const n = noise(m.x * 0.004, m.y * 0.004, t * 0.32);
      rot = map(n, 0, 1, -PI, PI);
      len = map(n, 0, 1, 16, 132);
      weight = map(n, 0, 1, 1, 6);
    } else if (mode === 5) {
      const band = floor((m.y + t * 88) / 48) % 2;
      ox = band ? 96 : -96;
      oy = sin(t * 4 + m.group) * 9;
      rot = band ? 0 : HALF_PI;
      len = 18 + m.ring * 13;
      weight = 3.2;
    } else if (mode === 6) {
      const bloom = sin(t * 0.9 + m.phase) * 0.5 + 0.5;
      ox = cos(m.a) * bloom * (42 + pulse * 88);
      oy = sin(m.a) * bloom * (26 + pulse * 58);
      rot = m.a + bloom * TWO_PI;
      len = m.len + bloom * 72;
      weight = m.weight + bloom * 4 + pulse * 5;
    }

    const c = i % 5 === 0 ? accent : fg;
    stroke(red(c), green(c), blue(c), i % 5 === 0 ? 212 : 238);
    strokeWeight(weight);
    drawRune(m.x + ox, m.y + oy, rot, max(6, len), i);
  }
}

function drawRune(x, y, rot, len, i) {
  push();
  translate(x, y);
  rotate(rot);
  const half = len / 2;
  line(-half, 0, half, 0);
  if (i % 3 === 0) line(0, -half * 0.36, 0, half * 0.36);
  if (i % 4 === 0) line(-half * 0.26, -half * 0.26, half * 0.26, half * 0.26);
  if (i % 7 === 0) point(half * 0.72, 0);
  pop();
}

function drawGhostMarks(fg, accent, t) {
  blendMode(MULTIPLY);
  noFill();
  stroke(red(accent), green(accent), blue(accent), 46);
  strokeWeight(18);
  arc(BASE_W / 2, BASE_H / 2, 472 + sin(t) * 24, 472 + cos(t * 0.7) * 24, -0.45, PI + 0.12);

  stroke(red(fg), green(fg), blue(fg), 30);
  strokeWeight(1.5);
  for (let i = 0; i < 9; i++) {
    const y = 246 + i * 38;
    const shift = sin(t * 0.8 + i) * 44;
    line(330 + shift, y, 950 - shift, y + sin(i) * 18);
  }
  blendMode(BLEND);
}

function drawUI(fg, accent) {
  swatches = [];
  modeHits = [];
  randomHit = null;

  const topY = 22;
  const modeGap = 9;
  const inactiveW = 15;
  const activeW = 40;
  const h = 15;
  let totalW = 0;

  for (let i = 0; i < MODES.length; i++) {
    totalW += i === mode - 1 ? activeW : inactiveW;
    if (i < MODES.length - 1) totalW += modeGap;
  }

  let x = (width - totalW) / 2;
  noFill();
  stroke(fg);
  strokeWeight(1);
  for (let i = 0; i < MODES.length; i++) {
    const w = i === mode - 1 ? activeW : inactiveW;
    rect(x, topY, w, h);
    modeHits.push({ x, y: topY, w, h, index: i + 1 });
    x += w + modeGap;
  }

  noStroke();
  fill(fg);
  textAlign(CENTER, TOP);
  textSize(12);
  text(MODES[mode - 1], width / 2, topY + 27);

  drawPalette(width / 2, height - 34, fg, accent);
}

function drawPalette(cx, y, fg, accent) {
  const gap = 9;
  const inactiveW = 14;
  const activeW = 32;
  const randomW = 16;
  const totalW = PALETTE.reduce((sum, _, i) => sum + (i === fgIndex ? activeW : inactiveW), 0) +
    gap * (PALETTE.length - 1) + 30 + randomW;
  let x = cx - totalW / 2;

  for (let i = 0; i < PALETTE.length; i++) {
    const w = i === fgIndex ? activeW : inactiveW;
    fill(PALETTE[i].value);
    stroke(i === bgIndex ? contrastFor(PALETTE[i].value) : PALETTE[i].value);
    strokeWeight(1);
    rect(x, y, w, 14);
    swatches.push({ x, y, w, h: 14, index: i });
    x += w + gap;
  }

  x += 21;
  noFill();
  stroke(fg);
  rect(x, y, randomW, 14);
  noStroke();
  fill(fg);
  textAlign(CENTER, CENTER);
  textSize(10);
  text('R', x + randomW / 2, y + 7);
  randomHit = { x, y, w: randomW, h: 14 };

  noStroke();
  fill(accent);
  rect(x + randomW + 15, y, 32, 14);
}

function mousePressed() {
  for (const hit of modeHits) {
    if (within(hit)) {
      mode = hit.index;
      return;
    }
  }

  for (const hit of swatches) {
    if (within(hit)) {
      fgIndex = hit.index;
      accentIndex = (hit.index + 2) % PALETTE.length;
      if (fgIndex === bgIndex) bgIndex = (bgIndex + 1) % PALETTE.length;
      return;
    }
  }

  if (randomHit && within(randomHit)) {
    randomizePalette();
    return;
  }

  seedValue = floor(random(100000));
  rebuild();
}

function keyPressed() {
  const n = int(key);
  if (n >= 1 && n <= MODES.length) mode = n;
  if (key === 'r' || key === 'R') randomizePalette();
  if (key === ' ') {
    seedValue = floor(random(100000));
    rebuild();
  }
}

function randomizePalette() {
  bgIndex = floor(random(PALETTE.length));
  do {
    fgIndex = floor(random(PALETTE.length));
  } while (fgIndex === bgIndex);
  do {
    accentIndex = floor(random(PALETTE.length));
  } while (accentIndex === bgIndex || accentIndex === fgIndex);
}

function smoothstep(edge0, edge1, x) {
  const v = constrain((x - edge0) / (edge1 - edge0), 0, 1);
  return v * v * (3 - 2 * v);
}

function within(area) {
  return mouseX >= area.x && mouseX <= area.x + area.w &&
    mouseY >= area.y && mouseY <= area.y + area.h;
}

function alphaFor(c, a) {
  const brightnessValue = red(c) * 0.299 + green(c) * 0.587 + blue(c) * 0.114;
  return brightnessValue > 150 ? a : min(180, a * 2.4);
}

function contrastFor(hex) {
  const c = color(hex);
  const brightnessValue = red(c) * 0.299 + green(c) * 0.587 + blue(c) * 0.114;
  return brightnessValue > 150 ? '#11130f' : '#f2efe8';
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
