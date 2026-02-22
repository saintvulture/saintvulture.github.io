let images = [];
let boundingBoxes = [];
let zip = new JSZip();
let canvasHeight = 0;

function setup() {
  noCanvas();
  let input = createFileInput(handleFiles, true);
  input.attribute("webkitdirectory", true);
  input.attribute("multiple", true);
}

function handleFiles(file) {
  if (!file || !file.file) return;
  if (!/\.(png)$/i.test(file.name)) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    loadImage(e.target.result, img => {
      processImage(file.name, img);
    });
  };
  reader.readAsDataURL(file.file);
}

function processImage(filename, img) {
  img.loadPixels();

  let bbox = getAlphaBoundingBox(img);
  console.log(`[${filename}] bbox:`, bbox);

  if (bbox.w === 0 || bbox.h === 0) {
    console.warn(`❌ No visible pixels in: ${filename}`);
    return;
  }

  let cropped = img.get(bbox.x, bbox.y, bbox.w, bbox.h);

  // Show on canvas (debug)
  if (!canvasHeight) {
    canvasHeight = windowHeight;
    createCanvas(800, canvasHeight);
  }
  image(cropped, 0, images.length * 110);

  // Add cropped image to zip
  let gfx = createGraphics(bbox.w, bbox.h);
  gfx.image(cropped, 0, 0);
  gfx.canvas.toBlob(blob => {
    zip.file(filename, blob);
    images.push(filename);

    // Save bounding box data
    boundingBoxes.push({
      filename: filename,
      x: bbox.x,
      y: bbox.y,
      width: bbox.w,
      height: bbox.h
    });

    if (images.length === document.querySelectorAll("input[type='file']")[0].files.length) {
      finalizeZip();
    }
  });
}

function getAlphaBoundingBox(img) {
  let w = img.width;
  let h = img.height;
  let xMin = w, yMin = h;
  let xMax = 0, yMax = 0;
  let found = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let i = 4 * (y * w + x);
      let alpha = img.pixels[i + 3];

      if (alpha > 10) {
        found = true;
        if (x < xMin) xMin = x;
        if (y < yMin) yMin = y;
        if (x > xMax) xMax = x;
        if (y > yMax) yMax = y;
      }
    }
  }

  if (!found) return { x: 0, y: 0, w: 0, h: 0 };
  return {
    x: xMin,
    y: yMin,
    w: xMax - xMin + 1,
    h: yMax - yMin + 1
  };
}

function finalizeZip() {
  // Add bounding_boxes.json
  zip.file("bounding_boxes.json", JSON.stringify(boundingBoxes, null, 2));

  // Download zip
  zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, "cropped_pngs_with_metadata.zip");
  });
}
