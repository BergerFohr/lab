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
  const innerRx = innerRy;
  const angles = distributedAngles(cx, cy, outerRx, outerRy);

  drawEllipse(cx, cy, outerRx, outerRy, '#8f8f89', 1);
  drawConstruction(cx, cy, innerRx, innerRy, angles);
  drawActiveForm(cx, cy, innerRx, innerRy, angles);
  drawCenterMark(cx, cy);
}

function distributedAngles(cx, cy, rx, ry) {
  const nx = constrain((pointer.x - cx) / rx, -1, 1);
  const ny = constrain((pointer.y - cy) / ry, -1, 1);
  const pull = sqrt(nx * nx + ny * ny);
  const baseAngle = -HALF_PI;
  const strength = smoothstep(0.04, 0.95, pull) * 0.72;
  const weights = [];
  let total = 0;

  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const sample = baseAngle + (i + 0.5) * TWO_PI / SEGMENT_COUNT;
    const pointerPull = nx * cos(sample) + ny * sin(sample);
    const crossPull = nx * cos(sample - PI * 0.72) + ny * sin(sample - PI * 0.72);
    const weight = max(0.22, 1 + strength * (pointerPull * 1.25 - crossPull * 0.48));
    weights.push(weight);
    total += weight;
  }

  const angles = [];
  let angle = baseAngle;
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
    const start = pointOnEllipse(cx, cy, rx, ry, angle);
    const end = pointOnCanvasEdgeFromVector(cx, cy, start.x - cx, start.y - cy);
    line(start.x, start.y, end.x, end.y);
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

function pointOnEllipse(cx, cy, rx, ry, angle) {
  return {
    x: cx + cos(angle) * rx,
    y: cy + sin(angle) * ry
  };
}

function pointOnCanvasEdge(cx, cy, angle) {
  const dx = cos(angle);
  const dy = sin(angle);
  return pointOnCanvasEdgeFromVector(cx, cy, dx, dy);
}

function pointOnCanvasEdgeFromVector(cx, cy, dx, dy) {
  const tx = dx > 0 ? (width - cx) / dx : dx < 0 ? -cx / dx : Infinity;
  const ty = dy > 0 ? (height - cy) / dy : dy < 0 ? -cy / dy : Infinity;
  const distance = min(tx, ty);

  return {
    x: cx + dx * distance,
    y: cy + dy * distance
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
