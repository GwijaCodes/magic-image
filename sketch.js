let img;
let panel;
let input, gridInputBtn, button;
let newImageWasDropped = false;
let gridSize = 60;
const margin = 0;
let grayLevels = [];
let grayImgs = [];
const date = new Date();

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

  button = createButton('Salva immagine');
  button.parent(panel);
  button.mousePressed(() => {
    const date = new Date();
    saveCanvas(
      `magic-image-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`,
      'jpg'
    );
  });

  input = createInput(gridSize);
  input.id('resolution-input')
  input.parent(panel);

  // Pulsante aggiorna griglia
  gridInputBtn = createButton('Cambia risoluzione');
  gridInputBtn.parent(panel);
  gridInputBtn.mousePressed(() => {
    gridSize = int(input.value());
    redraw(); // ridisegna senza ricaricare l'immagine
  });

  noLoop();
  noSmooth();
}

function draw() {
  background(255);

  // Calcola le dimensioni di ogni cella
  const cellW = width / gridSize;
  const cellH = height / gridSize;

  // Crea una copia ridimensionata dell'immagine alla griglia
  let tempImg = img.get();
  tempImg.resize(gridSize, gridSize);
  tempImg.filter(GRAY);
  tempImg.loadPixels();

  getGrayLevels();

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      let idx = (y * gridSize + x) * 4;
      let lum = tempImg.pixels[idx]; // valore grigio
      let imgIndex = getClosestGrayIndex(lum);

      // Disegna l'immagine corrispondente alla cella
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
  let min = 50;
  let max = 240;
  let n = grayImgs.length;

  for (let i = 0; i < n; i++) {
    let t = i / (n - 1);
    let mapped = min + (max - min) * t;
    grayLevels.push(Math.round(mapped));
  }
}

function getClosestGrayIndex(value) {
  let closestIndex = 0;
  let minDist = Infinity;

  for (let i = 0; i < grayLevels.length; i++) {
    let d = Math.abs(value - grayLevels[i]);
    if (d < minDist) {
      minDist = d;
      closestIndex = i;
    }
  }
  return closestIndex;
}

function gotFile(file) {
  if (file.type === 'image') {
    newImageWasDropped = true;

    loadImage(file.data, loaded => {
      img = loaded;
      resizeCanvasToImage(img); // Ridimensiona la canvas **dopo** aver caricato la nuova immagine
      redraw(); // Ridisegna la scena con le nuove dimensioni
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
    // Immagine più larga rispetto alla finestra
    newWidth = windowWidth;
    newHeight = windowWidth / imgRatio;
  } else {
    // Immagine più alta rispetto alla finestra
    newHeight = windowHeight;
    newWidth = windowHeight * imgRatio;
  }

  resizeCanvas(newWidth, newHeight);
}

