const SEGMENT_COUNT = 8;
const MAX_PIXEL_RATIO = 2;

let pointer;

function setup() {
  pixelDensity(min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  createCanvas(windowWidth, windowHeight);
  strokeCap(SQUARE);
  strokeJoin(MITER);
  pointer = createVector(width / 2, height / 2);
}

function draw() {
  background('#f7f7f2');

  const cx = width / 2;
  const cy = height / 2;
  const hasTouch = touches.length > 0;
  const hasMouse = mouseX !== 0 || mouseY !== 0;
  const targetX = hasTouch ? touches[0].x : hasMouse ? mouseX : cx;
  const targetY = hasTouch ? touches[0].y : hasMouse ? mouseY : cy;
  pointer.x = lerp(pointer.x, targetX, 0.12);
  pointer.y = lerp(pointer.y, targetY, 0.12);

  const outerRx = width * 0.4;
  const outerRy = height * 0.4;
  const innerRy = height * 0.25;
  const innerRx = outerRx * (innerRy / outerRy);
  const angles = distributedAngles(cx, cy, outerRx, outerRy);

  drawPaperGrain();
  drawEllipse(cx, cy, outerRx, outerRy, '#8f8f89', 1);
  drawConstruction(cx, cy, outerRx, outerRy, angles);
  drawActiveForm(cx, cy, innerRx, innerRy, angles);
  drawCenterMark(cx, cy);
}

function distributedAngles(cx, cy, rx, ry) {
  const nx = constrain((pointer.x - cx) / rx, -1, 1);
  const ny = constrain((pointer.y - cy) / ry, -1, 1);
  const pull = sqrt(nx * nx + ny * ny);
  const direction = atan2(ny, nx || 0.0001);
  const strength = smoothstep(0.04, 0.95, pull) * 0.72;
  const weights = [];
  let total = 0;

  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const sample = direction + (i + 0.5) * TWO_PI / SEGMENT_COUNT;
    const wave = 0.5 + 0.5 * cos(sample - direction);
    const counterwave = 0.5 + 0.5 * cos(sample - direction - PI * 0.72);
    const weight = max(0.22, 1 + strength * (wave * 1.4 - counterwave * 0.72));
    weights.push(weight);
    total += weight;
  }

  const angles = [];
  let angle = direction + PI - HALF_PI / 2;
  for (const weight of weights) {
    angles.push(angle);
    angle += TWO_PI * (weight / total);
  }

  return angles;
}

function drawConstruction(cx, cy, rx, ry, angles) {
  stroke('#8f8f89');
  strokeWeight(1);
  noFill();

  for (const angle of angles) {
    const p = pointOnEllipse(cx, cy, rx, ry, angle);
    line(cx, cy, p.x, p.y);
  }
}

function drawActiveForm(cx, cy, rx, ry, angles) {
  stroke('#101010');
  strokeWeight(2);
  noFill();

  for (const angle of angles) {
    const p = pointOnEllipse(cx, cy, rx, ry, angle);
    line(cx, cy, p.x, p.y);
  }

  beginShape();
  for (let i = 0; i <= 160; i++) {
    const a = map(i, 0, 160, 0, TWO_PI);
    const p = pointOnEllipse(cx, cy, rx, ry, a);
    vertex(p.x, p.y);
  }
  endShape();
}

function drawEllipse(cx, cy, rx, ry, ink, weight) {
  stroke(ink);
  strokeWeight(weight);
  noFill();
  beginShape();
  for (let i = 0; i <= 240; i++) {
    const a = map(i, 0, 240, 0, TWO_PI);
    const p = pointOnEllipse(cx, cy, rx, ry, a);
    vertex(p.x, p.y);
  }
  endShape();
}

function drawCenterMark(cx, cy) {
  stroke('#101010');
  strokeWeight(2);
  point(cx, cy);
}

function drawPaperGrain() {
  stroke('#deded8');
  strokeWeight(1);
  const step = max(28, min(width, height) * 0.045);

  for (let x = width / 2 - width * 0.4; x <= width / 2 + width * 0.4; x += step) {
    line(x, height * 0.5 - 4, x, height * 0.5 + 4);
  }

  for (let y = height / 2 - height * 0.4; y <= height / 2 + height * 0.4; y += step) {
    line(width * 0.5 - 4, y, width * 0.5 + 4, y);
  }
}

function pointOnEllipse(cx, cy, rx, ry, angle) {
  return {
    x: cx + cos(angle) * rx,
    y: cy + sin(angle) * ry
  };
}

function smoothstep(edge0, edge1, x) {
  const v = constrain((x - edge0) / (edge1 - edge0), 0, 1);
  return v * v * (3 - 2 * v);
}

function touchMoved() {
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pointer.set(width / 2, height / 2);
}
