const templates = [
  {
    name: "Butterfly",
    svg: `<?xml version="1.0" encoding="UTF-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400">
      <g fill="none" stroke="#2c2c38" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M250 200c-30-40-90-70-140-70-40 0-70 30-70 70 0 50 40 90 100 90 40 0 80-30 110-90z" />
        <path d="M250 200c30-40 90-70 140-70 40 0 70 30 70 70 0 50-40 90-100 90-40 0-80-30-110-90z" />
        <path d="M250 200c-20 50-20 110 0 160" />
        <path d="M230 100c20-30 40-30 60 0" />
        <path d="M220 130c-40-10-70 0-90 30" />
        <path d="M280 130c40-10 70 0 90 30" />
        <circle cx="160" cy="170" r="24" />
        <circle cx="340" cy="170" r="24" />
        <circle cx="140" cy="250" r="32" />
        <circle cx="360" cy="250" r="32" />
      </g>
    </svg>`,
  },
  {
    name: "Underwater",
    svg: `<?xml version="1.0" encoding="UTF-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400">
      <g fill="none" stroke="#2c2c38" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M60 300c60-40 120-40 180 0s120 40 200 0" />
        <path d="M100 240c40-60 80-90 150-90s110 30 160 90" />
        <path d="M130 200c-30-30-30-60 0-90" />
        <path d="M370 200c30-30 30-60 0-90" />
        <path d="M250 140c20 20 20 60 0 80" />
        <circle cx="200" cy="210" r="18" />
        <circle cx="300" cy="210" r="18" />
        <path d="M220 260c20 20 40 20 60 0" />
        <path d="M420 280c20-30 20-60 0-90" />
        <path d="M80 280c-20-30-20-60 0-90" />
        <path d="M250 40c0 30-30 50-60 60" />
        <path d="M250 40c0 30 30 50 60 60" />
      </g>
    </svg>`,
  },
  {
    name: "City Garden",
    svg: `<?xml version="1.0" encoding="UTF-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400">
      <g fill="none" stroke="#2c2c38" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <rect x="70" y="120" width="120" height="200" rx="16" />
        <rect x="210" y="80" width="90" height="240" rx="12" />
        <rect x="320" y="140" width="110" height="180" rx="14" />
        <path d="M70 200h120" />
        <path d="M210 160h90" />
        <path d="M320 210h110" />
        <path d="M60 320c40-40 80-40 120 0s80 40 120 0 80-40 120 0" />
        <circle cx="130" cy="70" r="30" />
        <path d="M130 100v30" />
        <path d="M130 160c-30-20-50-50-60-90" />
        <path d="M130 160c30-20 50-50 60-90" />
      </g>
    </svg>`,
  },
];

const palette = [
  "#ff595e",
  "#ffca3a",
  "#8ac926",
  "#1982c4",
  "#6a4c93",
  "#ff924c",
  "#f72585",
  "#7209b7",
  "#3a86ff",
  "#43aa8b",
];

const templateContainer = document.getElementById("templates");
const paletteContainer = document.getElementById("palette");
const drawingCanvas = document.getElementById("drawing");
const outlineCanvas = document.getElementById("outline");
const brushSlider = document.getElementById("brush");
const eraserToggle = document.getElementById("eraser");
const undoButton = document.getElementById("undo");
const clearButton = document.getElementById("clear");
const downloadButton = document.getElementById("download");

const drawingContext = drawingCanvas.getContext("2d");
const outlineContext = outlineCanvas.getContext("2d");

let activeColor = palette[0];
let drawing = false;
let undoStack = [];
let outlineImage = null;

const createTemplateButtons = () => {
  templates.forEach((template, index) => {
    const button = document.createElement("button");
    button.className = "template-button";
    const image = document.createElement("img");
    image.alt = template.name;
    image.src = svgToDataUri(template.svg);
    button.append(image);
    button.addEventListener("click", () => setTemplate(index));
    templateContainer.append(button);
  });
};

const createPalette = () => {
  palette.forEach((color, index) => {
    const button = document.createElement("button");
    button.className = "color-swatch";
    button.style.background = color;
    button.setAttribute("aria-label", `Select ${color}`);
    if (index === 0) {
      button.classList.add("active");
    }
    button.addEventListener("click", () => setColor(color, button));
    paletteContainer.append(button);
  });
};

const setColor = (color, button) => {
  activeColor = color;
  paletteContainer.querySelectorAll(".color-swatch").forEach((swatch) => {
    swatch.classList.remove("active");
  });
  button.classList.add("active");
};

const resizeCanvases = () => {
  const container = document.querySelector(".canvas-shell");
  const { width, height } = container.getBoundingClientRect();
  drawingCanvas.width = width;
  drawingCanvas.height = height;
  outlineCanvas.width = width;
  outlineCanvas.height = height;
  drawingContext.lineCap = "round";
  drawingContext.lineJoin = "round";
  drawingContext.lineWidth = Number(brushSlider.value);
  if (outlineImage) {
    drawOutline(outlineImage);
  }
};

const svgToDataUri = (svg) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const setTemplate = (index) => {
  templateContainer.querySelectorAll(".template-button").forEach((button, i) => {
    button.classList.toggle("active", i === index);
  });
  const image = new Image();
  image.onload = () => {
    outlineImage = image;
    drawOutline(image);
    drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    undoStack = [];
  };
  image.src = svgToDataUri(templates[index].svg);
};

const drawOutline = (image) => {
  outlineContext.clearRect(0, 0, outlineCanvas.width, outlineCanvas.height);
  const scale = Math.min(
    outlineCanvas.width / image.width,
    outlineCanvas.height / image.height
  );
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const offsetX = (outlineCanvas.width - drawWidth) / 2;
  const offsetY = (outlineCanvas.height - drawHeight) / 2;
  outlineContext.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
};

const getCanvasPoint = (event) => {
  const rect = drawingCanvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

const startDrawing = (event) => {
  drawing = true;
  undoStack.push(drawingContext.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height));
  if (undoStack.length > 20) {
    undoStack.shift();
  }
  const point = getCanvasPoint(event);
  drawingContext.beginPath();
  drawingContext.moveTo(point.x, point.y);
};

const draw = (event) => {
  if (!drawing) return;
  const point = getCanvasPoint(event);
  drawingContext.strokeStyle = eraserToggle.checked ? "#ffffff" : activeColor;
  drawingContext.lineWidth = Number(brushSlider.value);
  drawingContext.lineTo(point.x, point.y);
  drawingContext.stroke();
};

const stopDrawing = () => {
  if (!drawing) return;
  drawing = false;
  drawingContext.closePath();
};

const undo = () => {
  const last = undoStack.pop();
  if (last) {
    drawingContext.putImageData(last, 0, 0);
  }
};

const clearCanvas = () => {
  drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  undoStack = [];
};

const downloadArtwork = () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = drawingCanvas.width;
  exportCanvas.height = drawingCanvas.height;
  const exportContext = exportCanvas.getContext("2d");
  exportContext.fillStyle = "#ffffff";
  exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  exportContext.drawImage(drawingCanvas, 0, 0);
  exportContext.drawImage(outlineCanvas, 0, 0);
  const link = document.createElement("a");
  link.download = "colouring-page.png";
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
};

window.addEventListener("resize", resizeCanvases);

drawingCanvas.addEventListener("pointerdown", (event) => {
  drawingCanvas.setPointerCapture(event.pointerId);
  startDrawing(event);
});

drawingCanvas.addEventListener("pointermove", draw);

drawingCanvas.addEventListener("pointerup", stopDrawing);

drawingCanvas.addEventListener("pointerleave", stopDrawing);

brushSlider.addEventListener("input", () => {
  drawingContext.lineWidth = Number(brushSlider.value);
});

undoButton.addEventListener("click", undo);
clearButton.addEventListener("click", clearCanvas);
downloadButton.addEventListener("click", downloadArtwork);

createTemplateButtons();
createPalette();
resizeCanvases();
setTemplate(0);
