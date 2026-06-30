const SVG_NS = "http://www.w3.org/2000/svg";
const CLIPPER_SCALE = 100;
const SAMPLE_STEP = 3.5;
const POINT_EPSILON = 0.01;

let canvas;
let state;
let preview;
let controls = {};

function setup() {
  const host = document.querySelector("#canvas-stage");
  canvas = createCanvas(1100, 760);
  canvas.parent(host);
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));

  state = {
    source: document.querySelector("#default-svg").innerHTML.trim(),
    paths: [],
    bounds: null,
    shells: [],
    outerShells: [],
    infill: [],
    altInfill: []
  };

  bindControls();
  controls.svgInput.value = state.source;
  rebuild();
}

function draw() {
  if (!preview) return;

  background(settings().bedColor);
  drawBed();

  push();
  translate(preview.offsetX, preview.offsetY);
  scale(preview.scale);
  translate(-preview.bounds.minX, -preview.bounds.minY);

  drawPrintedLayer(preview.altInfill, true);
  drawPrintedLayer(preview.infill, false);
  drawPrintedLayer(preview.shells, false);
  drawPrintedLayer(preview.outerShells, false);
  pop();
}

function windowResized() {
  const host = document.querySelector("#canvas-stage");
  const widthTarget = Math.min(1100, Math.max(360, host.clientWidth));
  const heightTarget = Math.max(420, Math.round(widthTarget * 0.69));
  resizeCanvas(widthTarget, heightTarget);
  fitPreview();
}

function bindControls() {
  controls = {
    file: document.querySelector("#file-input"),
    svgInput: document.querySelector("#svg-input"),
    render: document.querySelector("#render-button"),
    exportPng: document.querySelector("#export-png"),
    exportSvg: document.querySelector("#export-svg"),
    lineWidth: document.querySelector("#line-width"),
    lineGap: document.querySelector("#line-gap"),
    density: document.querySelector("#density"),
    angle: document.querySelector("#angle"),
    infillPattern: document.querySelector("#infill-pattern"),
    infillSetback: document.querySelector("#infill-setback"),
    connectThreshold: document.querySelector("#connect-threshold"),
    shellCount: document.querySelector("#shell-count"),
    shellSpacing: document.querySelector("#shell-spacing"),
    outerCount: document.querySelector("#outer-count"),
    zOffset: document.querySelector("#z-offset"),
    alternateLayer: document.querySelector("#alternate-layer"),
    roundedCaps: document.querySelector("#rounded-caps"),
    materialColor: document.querySelector("#material-color"),
    shadowColor: document.querySelector("#shadow-color"),
    bedColor: document.querySelector("#bed-color")
  };

  Object.entries(controls).forEach(([, control]) => {
    if (!control || !control.matches?.("input[type='range']")) return;
    control.addEventListener("input", () => {
      updateOutputs();
      rebuildToolpaths();
    });
  });

  [
    controls.alternateLayer,
    controls.roundedCaps,
    controls.infillPattern,
    controls.materialColor,
    controls.shadowColor,
    controls.bedColor
  ].forEach((control) => control.addEventListener("input", rebuildToolpaths));

  controls.render.addEventListener("click", () => {
    state.source = controls.svgInput.value.trim();
    rebuild();
  });

  controls.svgInput.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      state.source = controls.svgInput.value.trim();
      rebuild();
    }
  });

  controls.file.addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    const text = await file.text();
    controls.svgInput.value = text;
    state.source = text;
    rebuild();
  });

  controls.exportPng.addEventListener("click", () => saveCanvas(canvas, "printed-svg-toolpath", "png"));
  controls.exportSvg.addEventListener("click", exportToolpathSvg);
  updateOutputs();
}

function updateOutputs() {
  const labels = [
    [controls.lineWidth, "px"],
    [controls.lineGap, "px"],
    [controls.density, "%"],
    [controls.angle, "deg"],
    [controls.infillSetback, "px"],
    [controls.connectThreshold, "x"],
    [controls.shellCount, ""],
    [controls.shellSpacing, "px"],
    [controls.outerCount, ""],
    [controls.zOffset, "px"]
  ];

  labels.forEach(([control, suffix]) => {
    const output = control.parentElement.querySelector("output");
    output.textContent = `${control.value}${suffix}`;
  });
}

function settings() {
  const lineWidth = Number(controls.lineWidth.value);
  const lineGap = Number(controls.lineGap.value);
  const density = Number(controls.density.value);
  const minSpacing = Math.max(1, lineWidth + lineGap * 0.35);
  const maxSpacing = lineWidth * 4.8 + lineGap * 1.5;
  const infillSpacing = map(density, 8, 100, maxSpacing, minSpacing, true);

  return {
    lineWidth,
    lineGap,
    density,
    infillSpacing,
    angle: Number(controls.angle.value),
    infillPattern: controls.infillPattern.value,
    infillSetback: Number(controls.infillSetback.value),
    connectThreshold: Number(controls.connectThreshold.value),
    shellCount: Number(controls.shellCount.value),
    shellSpacing: Number(controls.shellSpacing.value),
    outerCount: Number(controls.outerCount.value),
    zOffset: Number(controls.zOffset.value),
    alternateLayer: controls.alternateLayer.checked,
    roundedCaps: controls.roundedCaps.checked,
    materialColor: controls.materialColor.value,
    shadowColor: controls.shadowColor.value,
    bedColor: controls.bedColor.value
  };
}

async function rebuild() {
  try {
    state.paths = await parseSvgToPaths(state.source);
    state.bounds = getBounds(state.paths);
    rebuildToolpaths();
  } catch (error) {
    console.error(error);
  }
}

function rebuildToolpaths() {
  if (!state.paths.length) return;

  const config = settings();
  state.shells = makeShells(state.paths, config.shellCount, Math.abs(config.shellSpacing));
  state.outerShells = makeShells(state.paths, config.outerCount, Math.abs(config.shellSpacing), config.shellCount);
  const interior = makeInteriorMask(state.paths, config);
  state.infill = makeInfill(interior, config.angle, config.infillSpacing, config);
  state.altInfill = config.alternateLayer
    ? makeInfill(interior, config.angle + 90, config.infillSpacing * 1.65, { ...config, infillPattern: "lines" })
    : [];

  preview = {
    bounds: expandBounds(state.bounds, config.zOffset + config.lineWidth * 5),
    shells: state.shells,
    outerShells: state.outerShells,
    infill: state.infill,
    altInfill: state.altInfill
  };
  fitPreview();
}

async function parseSvgToPaths(svgText) {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svg = doc.querySelector("svg");
  const parserError = doc.querySelector("parsererror");
  if (!svg || parserError) throw new Error("Could not parse SVG");

  document.body.appendChild(svg);
  Object.assign(svg.style, {
    position: "absolute",
    left: "-99999px",
    top: "-99999px",
    width: "1000px",
    height: "1000px",
    visibility: "hidden"
  });

  convertBasicShapes(svg);

  const contours = [...svg.querySelectorAll("path")]
    .map((path) => pathToPoints(path))
    .filter((points) => points.length >= 3)
    .map(cleanPoints);

  svg.remove();
  return contours;
}

function convertBasicShapes(svg) {
  [...svg.querySelectorAll("rect")].forEach((rect) => {
    const x = numberAttr(rect, "x", 0);
    const y = numberAttr(rect, "y", 0);
    const w = numberAttr(rect, "width", 0);
    const h = numberAttr(rect, "height", 0);
    replaceWithPath(rect, `M${x} ${y}H${x + w}V${y + h}H${x}Z`);
  });

  [...svg.querySelectorAll("circle")].forEach((circle) => {
    const cx = numberAttr(circle, "cx", 0);
    const cy = numberAttr(circle, "cy", 0);
    const r = numberAttr(circle, "r", 0);
    replaceWithPath(circle, `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`);
  });

  [...svg.querySelectorAll("ellipse")].forEach((ellipse) => {
    const cx = numberAttr(ellipse, "cx", 0);
    const cy = numberAttr(ellipse, "cy", 0);
    const rx = numberAttr(ellipse, "rx", 0);
    const ry = numberAttr(ellipse, "ry", 0);
    replaceWithPath(ellipse, `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`);
  });

  [...svg.querySelectorAll("polygon, polyline")].forEach((shape) => {
    const points = shape.getAttribute("points") || "";
    const close = shape.tagName.toLowerCase() === "polygon" ? "Z" : "";
    replaceWithPath(shape, `M${points}${close}`);
  });
}

function replaceWithPath(node, d) {
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  node.replaceWith(path);
}

function numberAttr(node, attr, fallback) {
  const value = Number(node.getAttribute(attr));
  return Number.isFinite(value) ? value : fallback;
}

function pathToPoints(path) {
  const length = path.getTotalLength();
  const samples = Math.max(20, Math.ceil(length / SAMPLE_STEP));
  const points = [];

  for (let i = 0; i <= samples; i += 1) {
    const p = path.getPointAtLength((i / samples) * length);
    const transformed = p.matrixTransform(path.getCTM());
    points.push({ x: transformed.x, y: transformed.y });
  }

  return points;
}

function cleanPoints(points) {
  const cleaned = [];
  points.forEach((point) => {
    const last = cleaned[cleaned.length - 1];
    if (!last || dist(last.x, last.y, point.x, point.y) > POINT_EPSILON) {
      cleaned.push(point);
    }
  });

  const first = cleaned[0];
  const last = cleaned[cleaned.length - 1];
  if (first && last && dist(first.x, first.y, last.x, last.y) < SAMPLE_STEP * 1.2) {
    cleaned[cleaned.length - 1] = { ...first };
  }
  return cleaned;
}

function getBounds(paths) {
  const xs = [];
  const ys = [];
  paths.flat().forEach((point) => {
    xs.push(point.x);
    ys.push(point.y);
  });
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys)
  };
}

function expandBounds(bounds, amount) {
  return {
    minX: bounds.minX - amount,
    minY: bounds.minY - amount,
    maxX: bounds.maxX + amount,
    maxY: bounds.maxY + amount
  };
}

function fitPreview() {
  if (!preview) return;
  const bounds = preview.bounds;
  const bw = bounds.maxX - bounds.minX;
  const bh = bounds.maxY - bounds.minY;
  const margin = Math.min(width, height) * 0.11;
  const scaleFactor = Math.min((width - margin * 2) / bw, (height - margin * 2) / bh);
  preview.scale = Math.max(0.01, scaleFactor);
  preview.offsetX = (width - bw * preview.scale) / 2;
  preview.offsetY = (height - bh * preview.scale) / 2;
}

function makeShells(paths, count, offsetStep, startIndex = 0) {
  const shells = [];
  for (let i = 0; i < count; i += 1) {
    const offset = offsetStep * (i + startIndex);
    const offsetPaths = offsetPolygons(paths, offset);
    offsetPaths.forEach((path) => shells.push(closePath(path)));
  }
  return shells.filter((path) => path.length >= 3);
}

function makeInteriorMask(paths, config) {
  const extrusionInset = config.lineWidth * 0.85 + config.lineGap * 0.4 + config.infillSetback;
  const inset = -Math.max(config.lineWidth * 0.55, extrusionInset);
  const interior = offsetPolygons(paths, inset);
  return interior.length ? interior : paths;
}

function offsetPolygons(paths, offset) {
  if (!window.ClipperLib) return paths;

  const clipperOffset = new ClipperLib.ClipperOffset(2, 0.25 * CLIPPER_SCALE);
  const scaled = paths.map(toClipperPath).filter((path) => path.length >= 3);
  clipperOffset.AddPaths(scaled, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);

  const solution = new ClipperLib.Paths();
  clipperOffset.Execute(solution, offset * CLIPPER_SCALE);
  return solution.map(fromClipperPath).filter((path) => Math.abs(polygonArea(path)) > 2);
}

function toClipperPath(path) {
  return path.map((point) => ({
    X: Math.round(point.x * CLIPPER_SCALE),
    Y: Math.round(point.y * CLIPPER_SCALE)
  }));
}

function fromClipperPath(path) {
  return path.map((point) => ({
    x: point.X / CLIPPER_SCALE,
    y: point.Y / CLIPPER_SCALE
  }));
}

function closePath(path) {
  const next = path.map((point) => ({ ...point }));
  if (next.length) next.push({ ...next[0] });
  return next;
}

function makeInfill(maskPaths, angleDeg, spacing, config) {
  const primary = makeHatchSegments(maskPaths, angleDeg, spacing, config);
  if (config.infillPattern === "grid") {
    return [
      ...primary,
      ...makeHatchSegments(maskPaths, angleDeg + 90, spacing * 1.18, config)
    ].map((segment) => segment.points);
  }
  if (config.infillPattern === "zigzag") {
    return stitchSerpentine(primary, maskPaths, spacing, config);
  }
  return primary.map((segment) => segment.points);
}

function makeHatchSegments(maskPaths, angleDeg, spacing, config) {
  const bounds = expandBounds(getBounds(maskPaths), spacing * 4);
  const angleRad = radians(angleDeg);
  const axis = { x: Math.cos(angleRad), y: Math.sin(angleRad) };
  const normal = { x: -axis.y, y: axis.x };
  const corners = [
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.maxY },
    { x: bounds.minX, y: bounds.maxY }
  ];
  const projections = corners.map((point) => dot(point, normal));
  const minProjection = Math.min(...projections) - spacing;
  const maxProjection = Math.max(...projections) + spacing;
  const diagonal = Math.hypot(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 1.4;
  const segments = [];
  const trim = Math.max(config.lineWidth * 0.55, Math.min(spacing * 0.32, config.infillSetback * 0.45));
  const minLength = Math.max(spacing * 0.72, config.lineWidth * 2.2);
  let row = 0;

  for (let projection = minProjection; projection <= maxProjection; projection += spacing) {
    const center = { x: normal.x * projection, y: normal.y * projection };
    const a = { x: center.x - axis.x * diagonal, y: center.y - axis.y * diagonal };
    const b = { x: center.x + axis.x * diagonal, y: center.y + axis.y * diagonal };
    clipLineToMask(a, b, maskPaths).forEach((segment) => {
      const trimmed = trimSegment(segment, trim);
      if (!trimmed) return;
      const length = distance(trimmed[0], trimmed[1]);
      if (length > minLength) {
        segments.push({
          points: trimmed,
          row,
          projection,
          center: dot(midpoint(trimmed[0], trimmed[1]), axis)
        });
      }
    });
    row += 1;
  }

  return segments;
}

function trimSegment(segment, amount) {
  const [a, b] = segment;
  const length = distance(a, b);
  if (length <= amount * 2.4) return null;
  const t = amount / length;
  return [lerpPoint(a, b, t), lerpPoint(a, b, 1 - t)];
}

function stitchSerpentine(segments, maskPaths, spacing, config) {
  const rows = new Map();
  segments.forEach((segment) => {
    if (!rows.has(segment.row)) rows.set(segment.row, []);
    rows.get(segment.row).push(segment);
  });

  const paths = [];
  let active = null;
  let direction = 1;
  const threshold = spacing * config.connectThreshold;
  [...rows.keys()].sort((a, b) => a - b).forEach((row) => {
    const ordered = rows.get(row).sort((a, b) => a.center - b.center);
    if (direction < 0) ordered.reverse();

    ordered.forEach((segment) => {
      const points = direction > 0 ? segment.points : [...segment.points].reverse();
      const turnPoints = active
        ? makeTurnPoints(active[active.length - 1], points[0], active[active.length - 2], points[1], maskPaths, threshold)
        : null;
      if (!active || !turnPoints) {
        if (active && active.length > 1) paths.push(active);
        active = points.map((point) => ({ ...point }));
        return;
      }
      active.push(...turnPoints);
      active.push(...points.slice(1).map((point) => ({ ...point })));
    });
    direction *= -1;
  });

  if (active && active.length > 1) paths.push(active);
  return paths;
}

function makeTurnPoints(a, b, previous, next, maskPaths, threshold) {
  if (!a || !b || distance(a, b) > threshold) return null;
  const tangent = previous ? normalizeVector({ x: a.x - previous.x, y: a.y - previous.y }) : null;
  if (!tangent) return null;
  const bridge = { x: b.x - a.x, y: b.y - a.y };
  const bridgeLength = Math.hypot(bridge.x, bridge.y);
  if (bridgeLength < POINT_EPSILON) return [{ ...b }];

  const normal = normalizeVector(bridge);
  const radius = bridgeLength / 2;
  const center = midpoint(a, b);
  const points = [];
  const steps = Math.max(8, Math.ceil(Math.PI * radius / Math.max(2, SAMPLE_STEP)));
  for (let i = 1; i <= steps; i += 1) {
    const theta = Math.PI - (Math.PI * i) / steps;
    const point = {
      x: center.x + normal.x * radius * Math.cos(theta) + tangent.x * radius * Math.sin(theta),
      y: center.y + normal.y * radius * Math.cos(theta) + tangent.y * radius * Math.sin(theta)
    };
    if (!pointInCompound(point, maskPaths)) return null;
    points.push(point);
  }
  if (next) {
    const outgoing = normalizeVector({ x: next.x - b.x, y: next.y - b.y });
    if (outgoing && dot(tangent, outgoing) > -0.5) return null;
  }
  return points;
}

function clipLineToMask(a, b, paths) {
  const intersections = [0, 1];
  paths.forEach((path) => {
    for (let i = 0; i < path.length; i += 1) {
      const c = path[i];
      const d = path[(i + 1) % path.length];
      const t = lineIntersectionParameter(a, b, c, d);
      if (t !== null && t > 0 && t < 1) intersections.push(t);
    }
  });

  intersections.sort((left, right) => left - right);
  const unique = intersections.filter((value, index) => index === 0 || Math.abs(value - intersections[index - 1]) > 0.0005);
  const segments = [];

  for (let i = 0; i < unique.length - 1; i += 1) {
    const t0 = unique[i];
    const t1 = unique[i + 1];
    if (t1 - t0 < 0.0004) continue;
    const mid = lerpPoint(a, b, (t0 + t1) / 2);
    if (pointInCompound(mid, paths)) {
      segments.push([lerpPoint(a, b, t0), lerpPoint(a, b, t1)]);
    }
  }

  return segments;
}

function lineIntersectionParameter(a, b, c, d) {
  const r = { x: b.x - a.x, y: b.y - a.y };
  const s = { x: d.x - c.x, y: d.y - c.y };
  const denominator = cross(r, s);
  if (Math.abs(denominator) < 0.000001) return null;

  const uNumerator = cross({ x: c.x - a.x, y: c.y - a.y }, r);
  const tNumerator = cross({ x: c.x - a.x, y: c.y - a.y }, s);
  const t = tNumerator / denominator;
  const u = uNumerator / denominator;
  return u >= -0.000001 && u <= 1.000001 ? t : null;
}

function pointInCompound(point, paths) {
  let inside = false;
  paths.forEach((path) => {
    if (pointInPolygon(point, path)) inside = !inside;
  });
  return inside;
}

function pointInPolygon(point, path) {
  let inside = false;
  for (let i = 0, j = path.length - 1; i < path.length; j = i, i += 1) {
    const pi = path[i];
    const pj = path[j];
    const crosses = pi.y > point.y !== pj.y > point.y;
    if (!crosses) continue;
    const x = ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x;
    if (point.x < x) inside = !inside;
  }
  return inside;
}

function drawBed() {
  const config = settings();
  push();
  noFill();
  stroke(20, 20, 20, 20);
  strokeWeight(1);
  const grid = 42;
  for (let x = -grid; x < width + grid; x += grid) line(x, 0, x, height);
  for (let y = -grid; y < height + grid; y += grid) line(0, y, width, y);
  fill(config.materialColor + "16");
  noStroke();
  rect(18, 18, width - 36, height - 36, 8);
  pop();
}

function drawPrintedLayer(paths, isAlternate) {
  const config = settings();
  const z = isAlternate ? config.zOffset * 0.55 : config.zOffset;
  const baseColor = isAlternate ? mixHex(config.materialColor, "#ffffff", 0.18) : config.materialColor;

  paths.forEach((path) => {
    if (path.length < 2) return;
    strokeCap(config.roundedCaps ? ROUND : SQUARE);
    strokeJoin(ROUND);
    noFill();

    stroke(config.shadowColor);
    strokeWeight(config.lineWidth);
    drawPolyline(path, z, z);

    stroke(baseColor);
    strokeWeight(config.lineWidth);
    drawPolyline(path, 0, 0);

    if (config.zOffset > 0) {
      stroke(mixHex(baseColor, "#ffffff", 0.42));
      strokeWeight(Math.max(1, config.lineWidth * 0.22));
      drawPolyline(path, -config.lineWidth * 0.08, -config.lineWidth * 0.08);
    }
  });
}

function drawPolyline(path, ox, oy) {
  beginShape();
  path.forEach((point) => vertex(point.x + ox, point.y + oy));
  endShape();
}

function exportToolpathSvg() {
  const config = settings();
  const bounds = preview.bounds;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${bounds.maxY - bounds.minY}">`,
    `<rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.maxX - bounds.minX}" height="${bounds.maxY - bounds.minY}" fill="${config.bedColor}"/>`,
    pathsToSvg(preview.altInfill, config, mixHex(config.materialColor, "#ffffff", 0.18), config.zOffset * 0.55),
    pathsToSvg(preview.infill, config, config.materialColor, config.zOffset),
    pathsToSvg(preview.shells, config, config.materialColor, config.zOffset),
    pathsToSvg(preview.outerShells, config, config.materialColor, config.zOffset),
    "</svg>"
  ].join("");

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "printed-svg-toolpath.svg";
  link.click();
  URL.revokeObjectURL(link.href);
}

function pathsToSvg(paths, config, color, shadowOffset) {
  const cap = config.roundedCaps ? "round" : "square";
  return paths.map((path) => {
    const d = `M${path.map((point) => `${round(point.x)} ${round(point.y)}`).join("L")}`;
    const shadowD = `M${path.map((point) => `${round(point.x + shadowOffset)} ${round(point.y + shadowOffset)}`).join("L")}`;
    return [
      `<path d="${shadowD}" fill="none" stroke="${config.shadowColor}" stroke-width="${config.lineWidth}" stroke-linecap="${cap}" stroke-linejoin="round"/>`,
      `<path d="${d}" fill="none" stroke="${color}" stroke-width="${config.lineWidth}" stroke-linecap="${cap}" stroke-linejoin="round"/>`
    ].join("");
  }).join("");
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

function cross(a, b) {
  return a.x * b.y - a.y * b.x;
}

function lerpPoint(a, b, t) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t)
  };
}

function midpoint(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalizeVector(vector) {
  const length = Math.hypot(vector.x, vector.y);
  if (length < POINT_EPSILON) return null;
  return {
    x: vector.x / length,
    y: vector.y / length
  };
}

function polygonArea(path) {
  let area = 0;
  for (let i = 0; i < path.length; i += 1) {
    const a = path[i];
    const b = path[(i + 1) % path.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2;
}

function mixHex(hexA, hexB, amount) {
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  const mixed = a.map((channel, index) => Math.round(lerp(channel, b[index], amount)));
  return `#${mixed.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function parseHex(hex) {
  const clean = hex.replace("#", "");
  return [0, 2, 4].map((index) => parseInt(clean.slice(index, index + 2), 16));
}
