let img;
let panel;
let inputRes, refreshBtn, saveBtn;
let newImageWasDropped = false;
let gridSize = 60;
let contrast = 0.5;    // neutro a metà slider
let brightness = 0.5;  // neutro a metà slider
let grayLevels = [];
let grayImgs = [];

function preload() {
  if (!newImageWasDropped) {
    img = loadImage("gatto2.jpg");
  }
  for (let i = 1; i <= 5; i++) {
    grayImgs.push(loadImage(i + ".jpg"));
  }
}

function setup() {
  resizeCanvasToImage(img);
  const canvas = createCanvas(img.width, img.height);
  canvas.drop(gotFile);

  panel = createDiv();
  panel.id('panel');

  // Pulsante "Salva immagine"
  saveBtn = createButton('Salva immagine');
  saveBtn.parent(panel);
  saveBtn.mousePressed(() => {
    const d = new Date();
    saveCanvas(
      `magic-image-${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`,
      'jpg'
    );
  });

  // Controllo risoluzione
  createSpan('Risoluzione').parent(panel);
  inputRes = createInput(gridSize);
  inputRes.attribute('type', 'number');
  inputRes.attribute('min', '10');
  inputRes.attribute('max', '200');
  inputRes.parent(panel);

  // Slider per contrasto (0 = basso, 1 = alto, 0.5 = neutro)
  createSpan('Contrasto').parent(panel);
  const contrastSlider = createSlider(0, 1, contrast, 0.01);
  contrastSlider.parent(panel);

  // Slider per luminosità (0 = scuro, 1 = chiaro, 0.5 = neutro)
  createSpan('Luminosità').parent(panel);
  const brightnessSlider = createSlider(0, 1, brightness, 0.01);
  brightnessSlider.parent(panel);

  // Pulsante "Refresh" per applicare le modifiche
  refreshBtn = createButton('Refresh');
  refreshBtn.parent(panel);
  refreshBtn.mousePressed(() => {
    gridSize = int(inputRes.value());
    contrast = contrastSlider.value();
    brightness = brightnessSlider.value();
    redraw();
  });

  noLoop();
  noSmooth();
}

function draw() {
  background(255);

  const cellW = width / gridSize;
  const cellH = height / gridSize;

  let tempImg = img.get();
  tempImg.resize(gridSize, gridSize);
  tempImg.filter(GRAY);

  applyContrast(tempImg, contrast);
  applyBrightness(tempImg, brightness);

  getGrayLevels();

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const idx = (y * gridSize + x) * 4;
      const lum = tempImg.pixels[idx];
      const imgIndex = getClosestGrayIndex(lum);

      image(
        grayImgs[imgIndex],
        x * cellW,
        y * cellH,
        cellW,
        cellH
      );
    }
  }
}

function getGrayLevels() {
  grayLevels = [];
  const min = 50, max = 240;
  const n = grayImgs.length;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    grayLevels.push(Math.round(min + (max - min) * t));
  }
}

function getClosestGrayIndex(value) {
  return grayLevels
    .map((g, i) => ({ dist: abs(value - g), index: i }))
    .reduce((prev, curr) => curr.dist < prev.dist ? curr : prev)
    .index;
}

function gotFile(file) {
  if (file.type === 'image') {
    newImageWasDropped = true;
    loadImage(file.data, loaded => {
      img = loaded;
      resizeCanvasToImage(img);
      redraw();
    });
  } else {
    console.log('Not an image file!');
  }
}

function resizeCanvasToImage(image) {
  const windowRatio = windowWidth / windowHeight;
  const imgRatio = image.width / image.height;
  let newWidth, newHeight;

  if (imgRatio > windowRatio) {
    newWidth = windowWidth;
    newHeight = windowWidth / imgRatio;
  } else {
    newHeight = windowHeight;
    newWidth = windowHeight * imgRatio;
  }
  resizeCanvas(newWidth, newHeight);
}

// Applica contrasto (range 0–1 con 0.5 neutro)
function applyContrast(pImg, c) {
  pImg.loadPixels();
  const mappedC = (c - 0.5) * 2; // porta in -1..+1
  const factor = (259 * (mappedC * 255 + 255)) /
    (255 * (259 - mappedC * 255));

  for (let i = 0; i < pImg.pixels.length; i += 4) {
    let v = pImg.pixels[i];
    v = factor * (v - 128) + 128;
    v = constrain(v, 0, 255);
    pImg.pixels[i] = pImg.pixels[i + 1] = pImg.pixels[i + 2] = v;
  }
  pImg.updatePixels();
}

// Applica luminosità (0–1 con 0.5 neutro)
function applyBrightness(pImg, b) {
  pImg.loadPixels();
  const offset = (b - 0.5) * 2 * 255;

  for (let i = 0; i < pImg.pixels.length; i += 4) {
    let v = pImg.pixels[i] + offset;
    v = constrain(v, 0, 255);
    pImg.pixels[i] = pImg.pixels[i + 1] = pImg.pixels[i + 2] = v;
  }
  pImg.updatePixels();
}
