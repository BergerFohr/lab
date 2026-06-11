const sansPaths = [
  "M0,.57h18.31c9.94,0,15.67,4.65,15.67,13.23,0,4.58-2.5,8.3-6.94,10.09,5.79,2,9.08,6.65,9.08,13.31,0,9.73-6.01,14.95-16.67,14.95H0V.57ZM27.9,13.95c0-5.29-3.51-8.23-9.87-8.23H5.87v16.31h12.16c6.44,0,9.87-2.86,9.87-8.08ZM30.12,37.05c0-6.29-4.15-9.73-11.87-9.73H5.87v19.53h12.38c7.72,0,11.87-3.43,11.87-9.8Z",
  "M41.28,33.55c0-11.09,7.51-19.1,18.1-19.1s18.17,7.94,18.17,19.1-7.65,19.17-18.17,19.17-18.1-8.01-18.1-19.17ZM71.89,33.55c0-8.3-5.22-14.16-12.52-14.16s-12.38,5.94-12.38,14.16,4.94,14.24,12.38,14.24,12.52-5.94,12.52-14.24Z",
  "M82.48,33.55c0-11.09,7.51-19.1,18.1-19.1s18.17,7.94,18.17,19.1-7.65,19.17-18.17,19.17-18.1-8.01-18.1-19.17ZM113.1,33.55c0-8.3-5.22-14.16-12.52-14.16s-12.38,5.94-12.38,14.16,4.94,14.24,12.38,14.24,12.52-5.94,12.52-14.24Z",
  "M126.12,0h5.51v31.12l17.53-16.1h7.94l-15.88,14.38,17.17,22.75h-7.01l-14.09-19.17-5.65,5.01v14.16h-5.51V0Z",
  "M158.17,33.55c0-11.45,7.22-19.1,17.95-19.1,8.16,0,14.38,4.65,15.74,13.38h-5.37c-.86-5.08-4.94-8.44-10.3-8.44-7.51,0-12.3,5.65-12.3,14.16s4.86,14.24,12.3,14.24c5.37,0,9.37-3,10.37-8.8h5.44c-1.64,9.37-7.8,13.73-15.88,13.73-10.73,0-17.95-7.65-17.95-19.17Z",
  "M198.87,0h5.51v52.15h-5.51V0Z",
  "M245.37,52.15h-5.51v-7.37c-2.79,4.94-7.44,7.94-12.95,7.94-7.72,0-13.16-5.15-13.16-13.02V15.02h5.44v23.82c0,5.15,3.29,8.87,8.73,8.87,7.22,0,11.95-6.29,11.95-16.38V15.02h5.51v37.13Z",
  "M260.6,46.5v5.65h-5.51V0h5.51v20.67c2.29-3.65,7.37-6.22,12.23-6.22,11.3,0,17.67,8.37,17.67,19.1s-6.29,19.17-17.67,19.17c-5.65,0-10.66-2.79-12.23-6.22ZM284.78,33.55c0-8.51-4.94-14.16-12.38-14.16s-12.3,5.65-12.3,14.16,4.94,14.24,12.3,14.24,12.38-5.72,12.38-14.24Z"
];

const serifPaths = [
  "M0,50.36c5.08-.5,6.44-2.5,6.44-5.87V8.23c0-3.36-1.36-5.36-6.44-5.87V.57h21.24c10.87,0,16.6,4.72,16.6,12.59,0,6.51-4.22,10.94-11.16,11.8,8.51.93,13.73,5.94,13.73,13.45,0,8.44-5.51,13.73-17.6,13.73H0v-1.79ZM20.82,24.04c6.65-.21,10.59-4.29,10.59-10.44,0-5.79-3.72-9.94-10.59-10.3l-8.16-.21v21.17l8.16-.21ZM22.32,49.43c7.8-.29,11.52-4.86,11.52-11.16,0-6.72-4.43-11.37-11.52-11.45l-9.66-.21v23.03l9.66-.21Z",
  "M45.42,34.26c0-10.73,6.22-18.31,15.24-18.31s15.24,7.51,15.24,18.31-6.22,18.46-15.24,18.46-15.24-7.58-15.24-18.46ZM69.67,34.26c0-9.73-3.43-16.02-9.01-16.02s-9.01,6.44-9.01,16.02,3.43,16.17,9.01,16.17,9.01-6.37,9.01-16.17Z",
  "M80.76,34.26c0-10.73,6.22-18.31,15.24-18.31s15.24,7.51,15.24,18.31-6.22,18.46-15.24,18.46-15.24-7.58-15.24-18.46ZM105.01,34.26c0-9.73-3.43-16.02-9.01-16.02s-9.01,6.44-9.01,16.02,3.43,16.17,9.01,16.17,9.01-6.37,9.01-16.17Z",
  "M125.19,33.26v12.52c0,2.86,1.21,4.08,4.79,4.58v1.79h-15.38v-1.79c3.72-.5,4.94-1.65,4.94-4.58V7.08c0-2.07-.79-3-2.79-3h-2.07v-1.86l8.66-2.22h1.86v31.4l10.87-9.51c1.86-1.57,1.21-3.36-2.07-3.43v-1.93h13.45v1.93c-3,.14-5.51,1.86-9.51,5.01l-8.58,7.01,12.23,14.16c2.79,3.36,4.65,5.22,9.16,5.72v1.79h-11.02l-14.52-18.88Z",
  "M149.94,35.19c0-10.44,6.29-19.24,15.95-19.24,6.37,0,11.37,4.08,11.37,9.66,0,1.93-1.29,3.22-2.93,3.22s-3.01-1.36-3.01-2.93c0-1,.43-1.57.43-2.79,0-3.43-2.72-5.01-5.87-5.01-6.58,0-10.09,6.8-10.09,15.09,0,9.94,4.43,15.17,10.87,15.17,4.79,0,7.87-3.29,9.51-8.87h1.93c-1.79,9.08-7.01,13.23-13.45,13.23-8.65,0-14.74-7.15-14.74-17.53Z",
  "M180.84,50.36c3.72-.5,4.94-1.65,4.94-4.58V7.08c0-2.07-.79-3-2.79-3h-2.08v-1.86l8.73-2.22h1.79v45.78c0,2.86,1.29,4.08,4.79,4.58v1.79h-15.38v-1.79Z",
  "M202.8,40.99v-17.67c0-1.93-.71-2.93-2.65-2.93h-2.15v-1.79l8.58-2.29h1.79v24.39c0,4.86,2.65,7.8,6.29,7.8,4.22,0,8.08-3.93,8.08-9.87v-15.31c0-1.93-.79-2.93-2.72-2.93h-2.14v-1.79l8.65-2.29h1.86v28.97c0,1.93.64,2.86,2.65,2.86h2.22v1.79l-8.73,2.43h-1.79v-7.73c-1.93,5.36-5.72,8.08-10.16,8.08-5.87,0-9.8-4.36-9.8-11.73Z",
  "M243.43,48.07l-2.65,4.29h-1.79V7.15c0-2-.79-3.08-2.72-3.08h-2.07v-1.86l8.66-2.22h1.79v24.46c1.5-4.79,5.44-8.51,10.8-8.51,7.58,0,12.38,7.65,12.38,18.17,0,11.37-6.29,18.6-14.66,18.6-3.72,0-7.37-1.79-9.73-4.65ZM244.65,38.41c0,7.08,3.29,11.87,8.01,11.87,5.51,0,9.16-6.22,9.16-15.74,0-9.01-3.36-14.88-8.65-14.88s-8.51,5.87-8.51,12.23v6.51Z"
];

const letters = [];
const svgNamespace = "http://www.w3.org/2000/svg";
const rippleDelayMs = 70;
const tooltipOffset = 14;
const tooltipSpring = 0.045;
const tooltipDamping = 0.78;

let svg;
let layer;
let cursorTooltip;
let tooltipAnimationFrame = null;
let tooltipCurrent = { x: -100, y: -100 };
let tooltipTarget = { x: -100, y: -100 };
let tooltipVelocity = { x: 0, y: 0 };
let activeIndex = -1;
let mode = 1;
let swappedLetters = [];
let rippleTargetSans = false;
let rippleTimeouts = [];

function setup() {
  cursorTooltip = document.querySelector(".cursor-tooltip");
  buildLogo();
  setMode(1);

  window.addEventListener("keydown", keyPressed);
  window.addEventListener("resize", windowResized);
  window.addEventListener("click", handleRippleClick);
  window.addEventListener("pointermove", updateCursorTooltip);
  window.addEventListener("mousemove", updateCursorTooltip);
  window.addEventListener("pointerleave", hideCursorTooltip);
  window.addEventListener("blur", hideCursorTooltip);
  document.querySelector(".mode-selector")?.addEventListener("click", handleModeSelectorClick);
}

function keyPressed(event) {
  if (event.key === "1") {
    setMode(1);
  } else if (event.key === "2") {
    setMode(2);
  } else if (event.key === "g" || event.key === "G") {
    svg.classList.toggle("show-guides");
  }
}

function windowResized() {
  measureLetters();
}

function makeSvgElement(tag, attrs = {}) {
  const el = document.createElementNS(svgNamespace, tag);
  Object.entries(attrs).forEach(([attr, value]) => el.setAttribute(attr, value));
  return el;
}

function buildLogo() {
  const stage = document.querySelector("#logo-stage");
  svg = makeSvgElement("svg", {
    id: "bookclub-logo",
    viewBox: "0 0 290.51 52.72",
    role: "img",
    "aria-labelledby": "logo-title"
  });

  const title = makeSvgElement("title", { id: "logo-title" });
  title.textContent = "Bookclub";
  layer = makeSvgElement("g", { id: "letters" });
  svg.append(title, layer);
  stage.append(svg);

  sansPaths.forEach((sansD, index) => {
    const group = makeSvgElement("g", { class: "letter", "data-letter": index });
    const sans = makeSvgElement("path", { class: "sans", d: sansD });
    const serif = makeSvgElement("path", { class: "serif", d: serifPaths[index] });
    const hit = makeSvgElement("rect", { class: "hit-area", x: 0, y: 0, width: 0, height: 0 });

    group.append(sans, serif, hit);
    layer.append(group);
    letters.push({ group, sans, serif, hit, box: null });
  });

  requestAnimationFrame(measureLetters);
  svg.addEventListener("pointermove", hitTest);
  svg.addEventListener("pointerleave", clearActiveIndex);
}

function measureLetters() {
  if (!svg || letters.length === 0) return;
  if (swappedLetters.length !== letters.length) {
    swappedLetters = letters.map(() => false);
  }

  letters.forEach((letter) => {
    letter.serif.removeAttribute("transform");
    letter.sans.removeAttribute("transform");
  });

  const letterMetrics = letters.map((letter) => {
    const serifBox = letter.serif.getBBox();
    const sansBox = letter.sans.getBBox();

    return {
      serif: {
        x: serifBox.x,
        y: 0,
        width: serifBox.width,
        height: 52.72
      },
      sans: {
        x: sansBox.x,
        y: 0,
        width: sansBox.width,
        height: 52.72
      }
    };
  });

  letters.forEach((letter, index) => {
    const box = letterMetrics[index].serif;
    const previous = letterMetrics[index - 1]?.serif;
    const next = letterMetrics[index + 1]?.serif;
    const left = previous ? (previous.x + previous.width + box.x) / 2 : box.x;
    const right = next ? (box.x + box.width + next.x) / 2 : box.x + box.width;

    letter.metrics = letterMetrics[index];
    letter.hit.setAttribute("x", left);
    letter.hit.setAttribute("y", 0);
    letter.hit.setAttribute("width", right - left);
    letter.hit.setAttribute("height", 52.72);
    letter.box = {
      x: left,
      y: 0,
      width: right - left,
      height: 52.72
    };
  });

  applyLayout();
}

function getStyleForIndex(index) {
  return swappedLetters[index] ? "sans" : "serif";
}

function getPairGap(index, leftStyle, rightStyle) {
  const left = letters[index].metrics;
  const right = letters[index + 1].metrics;
  const serifGap = right.serif.x - (left.serif.x + left.serif.width);
  const sansGap = right.sans.x - (left.sans.x + left.sans.width);

  if (leftStyle === "serif" && rightStyle === "serif") return serifGap;
  if (leftStyle === "sans" && rightStyle === "sans") return sansGap;

  return (serifGap + sansGap) / 2;
}

function applyLayout() {
  if (letters.some((letter) => !letter.metrics)) return;

  const styles = letters.map((_, index) => getStyleForIndex(index));
  const serifStart = letters[0].metrics.serif.x;
  const targetLefts = [];
  let cursor = serifStart;

  letters.forEach((letter, index) => {
    const style = styles[index];
    targetLefts[index] = cursor;
    cursor += letter.metrics[style].width;

    if (index < letters.length - 1) {
      cursor += getPairGap(index, style, styles[index + 1]);
    }
  });

  letters.forEach((letter, index) => {
    const targetLeft = targetLefts[index];
    const serifDelta = targetLeft - letter.metrics.serif.x;
    const sansDelta = targetLeft - letter.metrics.sans.x;

    letter.serif.setAttribute("transform", `translate(${serifDelta} 0)`);
    letter.sans.setAttribute("transform", `translate(${sansDelta} 0)`);
  });
}

function pointInSvg(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

function setActiveIndex(index) {
  if (mode !== 2 || index === activeIndex) return;
  renderActiveIndex(index);
}

function renderActiveIndex(index) {
  activeIndex = index;
  setLetterStates(letters.map((_, letterIndex) => letterIndex === activeIndex));
}

function setLetterStates(nextStates) {
  swappedLetters = nextStates;
  applyLayout();
  letters.forEach((letter, letterIndex) => {
    letter.group.classList.toggle("is-swapped", swappedLetters[letterIndex]);
  });
}

function setLetterSwapped(index, isSwapped) {
  swappedLetters[index] = isSwapped;
  applyLayout();
  letters[index].group.classList.toggle("is-swapped", isSwapped);
}

function clearActiveIndex() {
  if (mode !== 2) return;
  renderActiveIndex(-1);
}

function hitTest(event) {
  if (mode !== 2) return;

  const point = pointInSvg(event);
  const index = letters.findIndex(({ box }) => {
    if (!box) return false;
    return point.x >= box.x &&
      point.x <= box.x + box.width &&
      point.y >= box.y &&
      point.y <= box.y + box.height;
  });

  setActiveIndex(index);
}

function setMode(nextMode) {
  mode = nextMode;
  document.body.classList.toggle("mode-dynamic", mode === 1);
  updateModeSelector();
  clearRippleTimeouts();
  activeIndex = -1;
  rippleTargetSans = false;
  hideCursorTooltip();
  setLetterStates(letters.map(() => false));
}

function updateModeSelector() {
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.setAttribute("aria-pressed", String(Number(button.dataset.mode) === mode));
  });
}

function handleModeSelectorClick(event) {
  event.stopPropagation();
  const button = event.target.closest("[data-mode]");
  if (!button) return;
  setMode(Number(button.dataset.mode));
}

function updateCursorTooltip(event) {
  if (![1, 2].includes(mode) ||
    !cursorTooltip ||
    event.pointerType === "touch" ||
    event.target.closest?.(".mode-selector")) {
    hideCursorTooltip();
    return;
  }

  const wasVisible = document.body.classList.contains("cursor-tooltip-visible");
  cursorTooltip.textContent = mode === 1 ? "Click" : "Hover";
  updateTooltipPosition(event.clientX, event.clientY);
  if (!wasVisible) {
    tooltipCurrent = { ...tooltipTarget };
    tooltipVelocity = { x: 0, y: 0 };
    cursorTooltip.style.transform = `translate(${tooltipCurrent.x}px, ${tooltipCurrent.y}px)`;
  }

  document.body.classList.add("cursor-tooltip-visible");
  startTooltipAnimation();
}

function updateTooltipPosition(clientX, clientY) {
  if (!cursorTooltip || typeof clientX !== "number" || typeof clientY !== "number") return;

  const tooltipBox = cursorTooltip.getBoundingClientRect();
  const maxX = window.innerWidth - tooltipBox.width - tooltipOffset;
  const maxY = window.innerHeight - tooltipBox.height - tooltipOffset;
  const x = Math.max(tooltipOffset, Math.min(clientX - tooltipBox.width - tooltipOffset, maxX));
  const y = Math.max(tooltipOffset, Math.min(clientY - tooltipBox.height - tooltipOffset, maxY));

  tooltipTarget = { x, y };
}

function startTooltipAnimation() {
  if (tooltipAnimationFrame !== null) return;
  tooltipAnimationFrame = requestAnimationFrame(animateCursorTooltip);
}

function animateCursorTooltip() {
  const dx = tooltipTarget.x - tooltipCurrent.x;
  const dy = tooltipTarget.y - tooltipCurrent.y;
  tooltipVelocity.x = (tooltipVelocity.x + dx * tooltipSpring) * tooltipDamping;
  tooltipVelocity.y = (tooltipVelocity.y + dy * tooltipSpring) * tooltipDamping;
  tooltipCurrent.x += tooltipVelocity.x;
  tooltipCurrent.y += tooltipVelocity.y;
  tooltipCurrent.x = Math.min(tooltipCurrent.x, tooltipTarget.x);
  tooltipCurrent.y = Math.min(tooltipCurrent.y, tooltipTarget.y);

  cursorTooltip.style.transform = `translate(${tooltipCurrent.x}px, ${tooltipCurrent.y}px)`;

  const isSettled = Math.abs(dx) < 0.2 &&
    Math.abs(dy) < 0.2 &&
    Math.abs(tooltipVelocity.x) < 0.2 &&
    Math.abs(tooltipVelocity.y) < 0.2;

  if (document.body.classList.contains("cursor-tooltip-visible") && !isSettled) {
    tooltipAnimationFrame = requestAnimationFrame(animateCursorTooltip);
  } else {
    tooltipAnimationFrame = null;
  }
}

function hideCursorTooltip() {
  document.body.classList.remove("cursor-tooltip-visible");
  tooltipVelocity = { x: 0, y: 0 };
}

function clearRippleTimeouts() {
  rippleTimeouts.forEach((timeout) => clearTimeout(timeout));
  rippleTimeouts = [];
}

function handleRippleClick(event) {
  if (mode !== 1 || event.target.closest?.(".mode-selector")) return;

  const point = pointInSvg(event);
  const targetSans = !rippleTargetSans;
  rippleTargetSans = targetSans;
  activeIndex = -1;
  clearRippleTimeouts();

  const order = letters
    .map((letter, index) => {
      const center = letter.box ? letter.box.x + letter.box.width / 2 : letter.metrics.serif.x + letter.metrics.serif.width / 2;
      return {
        index,
        distance: Math.abs(center - point.x)
      };
    })
    .sort((a, b) => a.distance - b.distance)
    .map(({ index }) => index);

  order.forEach((letterIndex, orderIndex) => {
    const timeout = setTimeout(() => {
      setLetterSwapped(letterIndex, targetSans);
    }, orderIndex * rippleDelayMs);

    rippleTimeouts.push(timeout);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setup, { once: true });
} else {
  setup();
}
