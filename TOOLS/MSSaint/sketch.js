let FPS = 24;
let currentFrame = 0;
let frameTotalCount = 48;
let previousMillis = 0;
let interval = 1000 / FPS;
let layers = []
let keyframes = []
let toggleKeyframe = false;
let isInteracting = false;
let lastStylusPos;
let lastStylusPosNonUpdate;
let isStylusActive = false;
let drawCanvas;
let drawFrame = [];
let toolIconBuffer;
let drawCanvasSizeX = 960;
let drawCanvasSizeY = 680;
let canvasPosX = 50;
let canvasPosY = 50;
let toggleNextFrame = false;
let togglePastFrame = false;
let togglePlaymode = false;
let pencilToggle = false;
let eraserToggle = false;
let fullscreenToggle = false;
let onionskinToggle = false;
let isMousePressed = false;
let isPainting = false;
let isPointerEnabled = Pressure.config.pointerEvents;
// How sensitive is the brush size to the pressure of the pen?
var pressureMultiplier = 10;
// What is the smallest size for the brush?
var minBrushSize = 1;
// Higher numbers give a smoother stroke
var brushDensity = 5;
var showDebug = true;
let drawingOnCanvasArea = false

let zoomLevels = [0.5, 1, 1.5, 2]
let zoomLevel = 1

/***********************
 *       GLOBALS        *
 ************************/
var xFilter, yFilter, pFilter;
var inBetween;
var prevPenX = 0;
var prevPenY = 0;
var prevBrushSize = 1;
var amt, x, y, s, d;
var pressure = -2;
//var drawCanvas, uiCanvas;
var isPressureInit = false;
var isDrawing = false;
var isDrawingJustStarted = false;
let imgData = []
let deserializedLayers;
/***********************
 *       UTILITIES      *
 ************************/
// Initializing Pressure.js
// https://pressurejs.com/documentation.html
function initPressure() {
    //console.log("Attempting to initialize Pressure.js ");
    Pressure.set('#drawingCanvas', {
        start: function(event) {
            // this is called on force start
            isDrawing = true;
            isDrawingJustStarted = true;
          
           for (let i = 0; i < layers.length; i++) {
     if(drawingOnCanvasArea)
       {
            layers[i].touchStartedToggle();
       }
            }
        },
        end: function() {
            // this is called on force end
            isDrawing = false
            pressure = 0;
        },
        change: function(force, event) {
            if (isPressureInit == false) {
                console.log("Pressure.js initialized successfully");
                isPressureInit = true;
            }
            //console.log(force);
            pressure = force;
        }, unsupported: function(){
   // alert("Oh no, this device does not support pressure.")
  }
    },{polyfill: false});
    Pressure.config({
        polyfill: true, // use time-based fallback ?
        polyfillSpeedUp: 1000, // how long does the fallback take to reach full pressure
        polyfillSpeedDown: 300,
        preventSelect: true,
        only: null
    });
}

function preload() {
    buttonIco = loadImage('buttonNonselect.png');
    buttonSelectIco = loadImage('buttonSelect.png');
    eraserIco = loadImage('eraser.png');
    pencilIco = loadImage('pencil.png');
    saveIco = loadImage('save.png');
    playIco = loadImage('play.png');
    nextIco = loadImage('next.png');
    prevIco = loadImage('prev.png');
    onionIco = loadImage('onion.png');
    markerIco = loadImage('marker.png');
    zipIco = loadImage('zip.png');
    // Retrieve data from local storage
    const serializedData = localStorage.getItem('animationData');
    if (serializedData) {
        const parsedData = JSON.parse(serializedData);
        // Deserialize layers
        deserializedLayers = parsedData.layers.map(layerData => {
            // Deserialize keyframes for each layer
            const deserializedKeyframes = layerData.keyframes.map(keyframeData => {
                return {
                    posX: keyframeData.posX,
                    posY: keyframeData.posY,
                    timelinePos: keyframeData.timelinePos,
                    length: keyframeData.length
                };
            });
            // Return an array of image objects
            return {
                name: layerData.name,
                isVisible: layerData.isVisible,
                keyframes: deserializedKeyframes,
                drawFrames: layerData.drawFrames.map(drawFrameData => {
                    return loadImage(drawFrameData.canvasDataURL);
                })
            };
        });
    }
}

function setup() {
    disableScroll();
    canvas = createCanvas(1060, 860);
    canvas.id("drawingCanvas")
    textFont('Courier New');
    lineColor = color(0, 0, 0);
    onionColor = color(100, 100, 250);
    background(200);
    drawCanvas = createGraphics(drawCanvasSizeX, drawCanvasSizeY);
    toolIconBuffer = createGraphics(drawCanvasSizeX, drawCanvasSizeY);
    //drawCanvas.background(239,252,209);
    drawCanvas.background(255);
    //animationpaper
    noSmooth();
    drawCanvas.fill(200);
    drawCanvas.circle(drawCanvasSizeX / 2, 50, 30);
    drawCanvas.rect(80, 40, 80, 20, 20);
    drawCanvas.rect(780, 40, 80, 20, 20);
    drawCanvas.noFill();
    drawCanvas.stroke(0, 0, 0);
    drawCanvas.rect(53, 120, 854, 480);
    drawCanvas.stroke(0, 0, 0);
    pencilTool = new buttonTool("p", 10, 50);
    markerTool = new buttonTool("m", 10, 85);
    saveTool = new buttonTool("s", 10, 155);
    eraserTool = new buttonTool("e", 10, 120);
    fullscreenTool = new buttonTool("f", 10, 190);
    playMode = new buttonTool("a", 100, 750);
    nextFrame = new buttonTool(">", 125, 750);
    pastFrame = new buttonTool("<", 75, 750);
    onionskin = new buttonTool("o", 50, 750);
    keyframeTool = new buttonTool("k", 200, 750);
    keyframeAddTool = new buttonTool("+", 225, 750);
    keyframeRemoveTool = new buttonTool("-", 175, 750);
    layers[0] = new layer("Layer 1", 195, 780)
    layers[0].length = 48
   // layers[0].activeToggle.toggle = true
    layers[1] = new layer("Layer 2", 195, 805)
    layers[1].length = 48
    layers[2] = new layer("Layer 3", 195, 830)
    layers[2].length = 48
    for (let i = 0; i < frameTotalCount; i++) {
        drawFrame[i + 1] = createGraphics(drawCanvasSizeX, drawCanvasSizeY);
    }
    getItem(layers[0].activeToggle.toggle)
    loadAnimation();
    initPressure();
}

function draw() {
    //console.log(drawingOnCanvasArea)
   // clear();
    rect(canvasPosX, canvasPosY, drawCanvasSizeX, drawCanvasSizeY);
    image(drawCanvas, canvasPosX, canvasPosY);
    image(toolIconBuffer, canvasPosX, canvasPosY);
    
    pencilTool.drawButton();
    markerTool.drawButton();
    saveTool.drawButton();
    eraserTool.drawButton();
    fullscreenTool.drawButton();
    playMode.drawButton();
    pastFrame.drawButton();
    nextFrame.drawButton();
    onionskin.drawButton();
    keyframeTool.drawButton();
    keyframeAddTool.drawButton();
    keyframeRemoveTool.drawButton();
    noSmooth();
    toolIconBuffer.clear();
    if (eraserTool.toggle === true) {
        toolIconBuffer.circle(mouseX - canvasPosX, mouseY - canvasPosY, 20);
    }
    //render layers
    for (let i = 0; i < layers.length; i++) {
        layers[i].draw();
    }
    //  when play mode is on, scrub through animation
    if (togglePlaymode === true) {
        let currentMillis = millis();
        // Check if the time elapsed is greater than the interval
        if (currentMillis - previousMillis >= interval) {
            currentFrame++;
            previousMillis = currentMillis;
        }
    }
    if (isDrawing) {

        //LOGIC DEALING WITH DRAWING
        let currentStylusPos;
        // lastStylusPos = createVector(mouseX - canvasPosX, mouseY - canvasPosY);
        currentStylusPos = createVector(mouseX - canvasPosX, mouseY - canvasPosY);
        if (pencilTool.toggle === true) {
            // Ensure both start and end points are defined
            if (lastStylusPos && currentStylusPos) {
                drawLine(lastStylusPos, currentStylusPos);
            }
        }
        lastStylusPos = currentStylusPos;
        if (eraserTool.toggle === true) {
            if (lastStylusPos && currentStylusPos) {
                eraseLine(10, lastStylusPos, currentStylusPos);
            }
        }
        if (markerTool.toggle === true) {
            if (lastStylusPos && currentStylusPos) {
                markerBrush(lastStylusPos, currentStylusPos, 12, 0, 0, 0, pressure);
            }
        }
    } else {
        lastStylusPos = createVector(mouseX - canvasPosX, mouseY - canvasPosY);
    }
  
  
   if (
        mouseX >= canvasPosX && 
        mouseX <= canvasPosX + drawCanvasSizeX && 
        mouseY >= canvasPosY && 
        mouseY <= canvasPosY + drawCanvasSizeY
    ) 
     {
       drawingOnCanvasArea = true
     }
  else
    {
      drawingOnCanvasArea = false
    }
  
  
  
}


function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    drawCanvas.noSmooth;
        var newPG = createGraphics(drawCanvasSizeX*1.5, drawCanvasSizeY*1.5);
    newPG.image(drawCanvas, 0, 0, newPG.width, newPG.height);
    drawCanvas = newPG;
    
    
  } else if (keyCode === RIGHT_ARROW)
    {
      drawCanvas.noSmooth;
             var newPG = createGraphics(drawCanvasSizeX/2, drawCanvasSizeY/2);
    newPG.image(drawCanvas, 0, 0, newPG.width, newPG.height);
    drawCanvas = newPG;
    }
  // Uncomment to prevent any default behavior.
  // return false;
}

function touchStarted() {
//isDrawing = false;
      
    
        pencilTool.touchPressedToggle()
       eraserTool.touchPressedToggle()
            markerTool.touchPressedToggle()
            onionskin.touchPressedToggle()
            playMode.touchPressedToggle()
            nextFrame.touchPressedToggle()
            pastFrame.touchPressedToggle()
            saveTool.touchPressedToggle()
            keyframeTool.touchPressedToggle()
            keyframeAddTool.touchPressedToggle()
            keyframeRemoveTool.touchPressedToggle()
            fullscreenTool.touchPressedToggle()
 
}



function touchEnded() {

//       isDrawing = false;
  
    pencilTool.touchPressedToggle()
       eraserTool.touchPressedToggle()
            markerTool.touchPressedToggle()
            onionskin.touchPressedToggle()
            playMode.touchPressedToggle()
            nextFrame.touchPressedToggle()
            pastFrame.touchPressedToggle()
            saveTool.touchPressedToggle()
            keyframeTool.touchPressedToggle()
            keyframeAddTool.touchPressedToggle()
            keyframeRemoveTool.touchPressedToggle()
          fullscreenTool.touchPressedToggle()
  
  
  pencilTool.touchStartedTool(); 
       eraserTool.touchStartedTool();
            markerTool.touchStartedTool();
            onionskin.touchStartedToggle();
            playMode.touchStartedToggle();
            nextFrame.touchStartedToggle();
            pastFrame.touchStartedToggle();
            saveTool.touchStartedToggle();
            keyframeTool.touchStartedToggle();
            keyframeAddTool.touchStartedToggle();
            keyframeRemoveTool.touchStartedToggle();
    fullscreenTool.touchStartedToggle()
            for (let i = 0; i < layers.length; i++) {
                layers[i].activeToggle.touchStartedToggle();    
                layers[i].visibilityToggle.touchStartedToggle();
                layers[i].activeToggle.touchPressedToggle();    
                layers[i].visibilityToggle.touchPressedToggle();
}
  
}


function saveAnimation() {
    // Serialize layers
    const serializedLayers = layers.map(layer => {
        return {
            name: layer.name,
            isVisible: layer.isVisible,
            currentFrame: layer.currentFrame,
            keyframes: layer.keyframes.map(keyframe => {
                return {
                    posX: keyframe.posX,
                    posY: keyframe.posY,
                    timelinePos: keyframe.timelinePos,
                    length: keyframe.length
                };
            }),
            drawFrames: layer.drawFrame.map(drawFrame => {
                // Check if drawFrame is null
                if (drawFrame) {
                    // Convert canvas to data URL
                    const canvasDataURL = drawFrame.elt.toDataURL();
                    return {
                        canvasDataURL: canvasDataURL
                    };
                } else {
                    // Return null if drawFrame is null
                    return null;
                }
            }).filter(drawFrame => drawFrame !== null) // Remove null entries
        };
    });
    // Convert to JSON string
    const serializedData = JSON.stringify({
        layers: serializedLayers
    });
    // Save data to local storage
    localStorage.setItem('animationData', serializedData);
    console.log('Animation data saved to local storage.');
    //storeItem("TEST", layers[0].drawFrame[1].elt.toDataURL());
}

function loadAnimation() {
    if (deserializedLayers) {
        for (let j = 0; j < deserializedLayers.length; j++) {
            // Erase current data
            layers[j].keyframes = [];
            // Sort keyframes based on timelinePos
            const sortedKeyframes = deserializedLayers[j].keyframes.sort((a, b) => a.timelinePos - b.timelinePos);
            // Update the layers with new data
            for (let i = 0; i < sortedKeyframes.length; i++) {
                let createdKeyframe = layers[j].createKeyframe();
                layers[j].keyframes.push(createdKeyframe);
                layers[j].keyframes[i].posX = sortedKeyframes[i].posX;
                layers[j].keyframes[i].posY = sortedKeyframes[i].posY;
                layers[j].keyframes[i].timelinePos = sortedKeyframes[i].timelinePos;
                layers[j].keyframes[i].length = sortedKeyframes[i].length;
                layers[j].drawFrame[sortedKeyframes[i].timelinePos] = createGraphics(drawCanvasSizeX, drawCanvasSizeY);
                layers[j].drawFrame[sortedKeyframes[i].timelinePos].image(deserializedLayers[j].drawFrames[i], 0, 0, drawCanvasSizeX, drawCanvasSizeY);
            }
        }
        console.log('Animation data retrieved from local storage.');
    } else {
        console.log('No animation data found in local storage.');
    }
}
//CLASSES
class layer {
    constructor(name, positionX, positionY, length, buttonName) {
        this.name = name;
        this.positionX = positionX;
        this.positionY = positionY;
        this.isVisible = this.isVisible;
        this.length = this.length;
        this.currentFrame = this.currentFrame;
        this.drawFrame = [];
        this.isActive = false;
        this.onionskin = this.onionskin;
        this.keyframes = [];
        this.toggleKeyframe = false;
        // Create a buttonTool with the provided buttonName and reference to this layer
        this.activeToggle = new buttonTool("A", this.positionX - 120, this.positionY);
        this.visibilityToggle = new buttonTool("V", this.positionX - 145, this.positionY);
        this.activeToggle.toggle = false;
        this.visibilityToggle.toggle = true;
        this.buffer = createGraphics(drawCanvasSizeX, drawCanvasSizeY)
        this.mouseOverCanvas = false
    }
    saveFramesToZip() {
        let zip = new JSZip();
        let scaleFactor = 0.5; // Scale factor for resizing frames
        // Iterate over each frame in drawFrame array
        this.drawFrame.forEach((frame, index) => {
            // Create a temporary canvas for resized frame
            let tempCanvas = createGraphics(frame.width * scaleFactor, frame.height * scaleFactor);
            // Draw the frame onto the temporary canvas at half size using bilinear interpolation
            tempCanvas.image(frame, 0, 0, tempCanvas.width, tempCanvas.height);
            // Save resized frame as PNG
            let filename = `${this.name}_frame_${index}.png`;
            tempCanvas.save(filename); // Assuming tempCanvas is a p5.Graphics object
            // Add resized frame image to zip file
            let canvasData = tempCanvas.canvas.toDataURL('image/png').split(',')[1]; // Get base64 image data
            zip.file(filename, canvasData, {
                base64: true
            });
        });
        // Generate zip file
        zip.generateAsync({
            type: "blob"
        }).then(function(content) {
            // Trigger download
            saveAs(content, "frames.zip");
        });
    }
    findTimelinePosByKeyframeIndex(keyframeIndex) {
        // Check if the provided index is valid
        if (keyframeIndex >= 0 && keyframeIndex < this.keyframes.length) {
            return this.keyframes[keyframeIndex].timelinePos;
        } else {
            console.error("Invalid keyframe index provided.");
            return null;
        }
    }
    touchStartedToggle() {
        if (this.activeToggle.toggle === true && this.findKeyframe() === -1) //only make this available if the layer is toggled
        {
            this.checkAndCreateKey()
        }
    }
    findKeyframeIndexByTimelinePos(timelinePos) {
        // Iterate through the keyframes array
        for (let i = 0; i < this.keyframes.length; i++) {
            // Check if the current keyframe's timelinePos matches the given timelinePos
            if (this.keyframes[i].timelinePos === timelinePos) {
                // If the timelinePos matches, return its index
                return i;
            }
        }
        // If no matching keyframe is found, return -1
        return -1;
    }
    findObjectLocationInKeyframes(timelinePos) {
        // Iterate through the keyframes array
        for (let i = 0; i < this.keyframes.length; i++) {
            // Check if the current keyframe's timelinePos matches the given timelinePos
            if (timelinePos >= this.keyframes[i].timelinePos && timelinePos <= this.keyframes[i].timelinePos + (this.keyframes[i].length - 1)) {
                // If the timelinePos falls within the range of the keyframe, return its index
                return i;
            }
        }
        // If no matching keyframe is found, return null
        return null;
    }
    // Inner function representing a keyframe
    createKeyframe(posX, posY, timelinePos, length) {
        return {
            posX: posX,
            posY: posY,
            timelinePos: timelinePos,
            length: length,
            draw: function() {
                fill(200, 200, 200);
                rect((this.posX - 10) + this.timelinePos * 10, this.posY, this.length * 10, 25);
                fill(0);
                circle((this.posX - 5) + this.timelinePos * 10, this.posY + 20, 5);
            }
        };
    }
    findKeyframe() {
        // Iterate through the keyframes array
        for (let i = 0; i < this.keyframes.length; i++) {
            // Check if the current keyframe's timelinePos matches the currentFrame
            if (this.currentFrame >= this.keyframes[i].timelinePos && this.currentFrame <= this.keyframes[i].timelinePos + (this.keyframes[i].length - 1)) {
                // If the current frame falls within the range of the keyframe, return its index
                return i;
            }
        }
        // If no matching keyframe is found, return -1
        return -1;
    }
    findKeyframeAtPosition(timelinePosition) {
        // Iterate through the keyframes array
        for (let i = 0; i < this.keyframes.length; i++) {
            // Check if the current keyframe's timelinePos matches the given timelinePosition
            if (timelinePosition >= this.keyframes[i].timelinePos && timelinePosition <= this.keyframes[i].timelinePos + (this.keyframes[i].length - 1)) {
                // If the timelinePosition falls within the range of the keyframe, return its index
                return i;
            }
        }
        // If no matching keyframe is found, return -1
        return -1;
    }
    findLastFrameIndex() {
        // Start from the currentFrame and go backwards until finding a non-undefined frame
        for (let i = this.currentFrame - 1; i >= 1; i--) {
            const keyframeIndex = this.findKeyframeAtPosition(this.currentFrame);
            if (this.drawFrame[i] && this.keyframes[keyframeIndex] && this.keyframes[keyframeIndex].timelinePos !== undefined && this.keyframes[keyframeIndex].timelinePos != i) {
                return i;
            }
        }
        // If no non-undefined frame is found before currentFrame, roll back around to the end
        for (let i = this.length; i >= this.currentFrame; i--) {
            const keyframeIndex = this.findKeyframeAtPosition(this.currentFrame);
            if (this.drawFrame[i] && this.keyframes[keyframeIndex] && this.keyframes[keyframeIndex].timelinePos !== undefined && this.keyframes[keyframeIndex].timelinePos != i) {
                return i;
            }
        }
        return -1; // Return -1 if no non-undefined frame is found
    }
    checkAndCreateKey() {
        // Check if a keyframe with the current frame already exists
        let existingKeyframe = this.keyframes.find(frame => frame.timelinePos === this.currentFrame);
        // If no keyframe exists for the current frame, create a new one
        if (this.findKeyframe() === -1) {
            let createdKeyframe = this.createKeyframe(this.positionX, this.positionY, this.currentFrame, 1);
            this.keyframes.push(createdKeyframe);
            // Create canvas at this location
            this.drawFrame[this.currentFrame] = createGraphics(drawCanvasSizeX, drawCanvasSizeY);
        } else {
            if (this.keyframes[this.findKeyframe()].length != 1) {
                this.keyframes[this.findKeyframe()].length = this.currentFrame - this.keyframes[this.findKeyframe()].timelinePos;
                let createdKeyframe = this.createKeyframe(this.positionX, this.positionY, this.currentFrame, 1);
                this.keyframes.push(createdKeyframe);
                this.drawFrame[this.currentFrame] = createGraphics(drawCanvasSizeX, drawCanvasSizeY);
            }
        }
    }
    draw() {
        if (this.activeToggle.toggle === true) {
            this.visibilityToggle.toggle = true
        }
        if (this.toggleKeyframe === true) {
            if (this.activeToggle.toggle === true ) //if active
            {
                this.checkAndCreateKey()
            }
            this.toggleKeyframe = false;
        }
     
 
        this.currentFrame = ((currentFrame % this.length) + this.length) % this.length + 1;
        // Draw frame length
        for (let i = 0; i < this.length; i++) {
            fill(255);
            rect(this.positionX + i * 10, this.positionY, 10, 25);
        }
        // Draw keyframes
        for (let i = 0; i < this.keyframes.length; i++) {
            this.keyframes[i].draw();
        }
        // Draw key pointers
        for (let i = 0; i < this.length; i++) {
            fill(255, 0, 0);
            rect((this.positionX - 10) + this.currentFrame * 10, this.positionY, 10, 25);
        }
        textSize(18);
        fill(255);
        rect(this.positionX - 95, this.positionY, 95, 25);
        fill(0);
        text(this.name, this.positionX - 90, this.positionY + 15);
        this.activeToggle.drawButton()
        this.visibilityToggle.drawButton()
        // Render drawing
        if (this.visibilityToggle.toggle === true) //only make this available if the layer is visible
        {
            if (this.findKeyframe() !== -1) {
                let keyframeIndex = this.findKeyframe();
                let keyframe = this.keyframes[keyframeIndex];
                let startFrame = keyframe.timelinePos;
                let endFrame = keyframe.timelinePos + keyframe.length;
                for (let frame = startFrame; frame < endFrame; frame++) {
                    if (this.drawFrame[frame]) {
                        image(this.drawFrame[frame], canvasPosX, canvasPosY);
                    }
                }
            }
        }
        image(this.buffer, canvasPosX, canvasPosY);
        if (this.visibilityToggle.toggle === true) //only make this available if the layer is visibility
        {
            // Draw onionskin effect for previous frames when active
            if (this.currentFrame >= 1 && onionskinToggle) {
                this.onionskin = createImage(drawCanvasSizeX, drawCanvasSizeY);
                // draw last frame 
                let lastFrameIndex = this.findLastFrameIndex();
                if (lastFrameIndex !== -1) {
                    this.onionskin.copy(this.drawFrame[lastFrameIndex], 0, 0, drawCanvasSizeX, drawCanvasSizeY, 0, 0, drawCanvasSizeX, drawCanvasSizeY);
                    replaceColor(this.onionskin, lineColor, onionColor); // Only replace lineColor with onionColor
                    image(this.onionskin, canvasPosX, canvasPosY);
                }
            }
        }
    }
}
class buttonTool {
    constructor(name, positionX, positionY) {
        this.name = name;
        this.positionX = positionX;
        this.positionY = positionY;
        this.toggle = this.toggle;
        this.isPressed = this.isPressed
    }
    isMouseOver() {
        return (mouseX >= this.positionX && mouseX <= this.positionX + 25 && mouseY >= this.positionY && mouseY <= this.positionY + 25);
    }
    touchStartedTool() {
        // Check if the mouse is over the button
        if (this.isMouseOver()) {
            // Deactivate all tools
            pencilTool.toggle = false;
            markerTool.toggle = false;
            eraserTool.toggle = false;
            // Activate this button
            this.toggle = !this.toggle;
            console.log(this.toggle);
        }
        return false;
    }
    touchStartedToggle() {
        // Check if the mouse is over the button
        if (this.isMouseOver()) {
            this.toggle = !this.toggle; // Toggle the toggle property of the button
           // console.log(this.name + " is set to " + this.toggle);
            
           for (let i = 0; i < layers.length; i++) {
          if (this.name === "A" && layer[i]) {
                layer[i].isActive = this.toggle;
              
            } else if (this.name === "V" && layer[i]) {
                layer[i].isVisible = this.toggle;
            }
           }
            
          
          if (this.name === "a") {
                // If this is the playMode button
                togglePlaymode = this.toggle; // Update the global togglePlaymode variable
            }
            if (this.name === "o") { // If this is the playMode button
                onionskinToggle = this.toggle; // Update the global togglePlaymode variable
            }
            if (this.name === ">") { // If this is the playMode button
                currentFrame++;
                this.toggle = false;
            }
            if (this.name === "<") { // If this is the playMode button
                currentFrame--;
                this.toggle = false;
            }
            if (this.name === "k") { // If this is the playMode button
                for (let i = 0; i < layers.length; i++) {
                    if (layers[i].activeToggle.toggle === true) {
                        layers[i].toggleKeyframe = true;
                    }
                }
                this.toggle = false;
            }
            if (this.name === "s") {
                /*  
                let d = day();
                  let m = month();
                  let y = year(); // If this is the playMode button
                  save(drawFrame[currentFrame], "MSSaint " + d + m + y + ".png");*/
                saveAnimation();
                this.toggle = false;
            }
            if (this.name === "f") {
                image(buttonSelectIco, this.positionX, this.positionY)
                for (let i = 0; i < layers.length; i++) {
                    if (layers[i].activeToggle.toggle === true) {  
              
              layers[i].saveFramesToZip()
                    }
                }
                this.toggle = false;
            }
            if (this.name === "+") {
                for (let i = 0; i < layers.length; i++) {
                    if (layers[i].activeToggle.toggle === true && layers[i].findKeyframeAtPosition(layers[i].keyframes[layers[i].findKeyframe()].timelinePos + layers[i].keyframes[layers[i].findKeyframe()].length) === -1) { // checks if it overlaps anything
                        layers[i].keyframes[layers[i].findKeyframe()].length++
                    }
                }
                this.toggle = false;
            }
            // this is removing frames in order // FIXXXXXXXXXXXX THISSSSSSSSSSSS
            if (this.name === "-") { // modify so it deletes the frame if length < 1
                for (let i = 0; i < layers.length; i++) {
                    if (layers[i].activeToggle.toggle === true) {
                        if (layers[i].keyframes[layers[i].findKeyframe()].length === 1) {
                            //layers[i].keyframes[layers[i].findKeyframe()].timelinePos   
                            //remove drawframe
                            const keyframeIndex = layers[i].findKeyframe();
                            if (keyframeIndex !== -1 && layers[i].keyframes[keyframeIndex]) {
                                const timelinePos = layers[i].keyframes[keyframeIndex].timelinePos;
                                if (layers[i].drawFrame[timelinePos] !== undefined) {
                                    layers[i].drawFrame.splice(timelinePos, 1);
                                }
                            }
                            this.toggle = false;
                            // Remove the keyframe from the keyframes array
                            layers[i].keyframes.splice(layers[i].findKeyframe(), 1);
                        } else {
                            this.toggle = false;
                            layers[i].keyframes[layers[i].findKeyframe()].length--
                        }
                    }
                }
                this.toggle = false;
            }
        }
        return false;
    }
    touchPressedToggle() {
        if (this.isMouseOver()) {
            this.isPressed = !this.isPressed;
        }
    }
    drawButton() {
        if (this.isPressed) {
            // Show pressed state
            image(buttonSelectIco, this.positionX, this.positionY);
        } else if (this.toggle) {
            // Show toggled state
            image(buttonSelectIco, this.positionX, this.positionY);
        } else {
            // Show default state
            image(buttonIco, this.positionX, this.positionY);
        }
      
    
        // rect(this.positionX, this.positionY, 25, 25);
        fill(0);
        text(this.name, this.positionX + 5, this.positionY + 15);
        if (this.name === "p") {
            image(pencilIco, this.positionX + 1, this.positionY + 1);
        }
        if (this.name === "e") {
            image(eraserIco, this.positionX + 1, this.positionY + 1);
        }
        if (this.name === "a") {
            image(playIco, this.positionX + 1, this.positionY + 1);
        }
        if (this.name === "o") {
            image(onionIco, this.positionX + 1, this.positionY + 1);
        }
        if (this.name === ">") {
            image(nextIco, this.positionX + 1, this.positionY + 1);
        }
        if (this.name === "<") {
            image(prevIco, this.positionX + 1, this.positionY + 1);
        }
        if (this.name === "s") {
            image(saveIco, this.positionX + 1, this.positionY + 1);
        }
        if (this.name === "m") {
            image(markerIco, this.positionX + 1, this.positionY + 1);
        }
        if (this.name === "f") {
            image(zipIco, this.positionX + 1, this.positionY + 1);
        }
  
    }
}

function drawLine(startPoint, endPoint) {
    // Calculate the slope of the line
    let dx = endPoint.x - startPoint.x;
    let dy = endPoint.y - startPoint.y;
    // Determine the number of steps required to reach from startPoint to endPoint
    let numSteps = max(abs(dx), abs(dy));
    // Calculate the incremental change in x and y for each step
    let xIncrement = dx / numSteps;
    let yIncrement = dy / numSteps;
    // Start from the startPoint
    let x = startPoint.x;
    let y = startPoint.y;
    // Draw the line by setting pixels
    for (let i = 0; i <= numSteps; i++) {
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].activeToggle.toggle === true && layers[i].visibilityToggle.toggle === true && drawingOnCanvasArea) {
                layers[i].drawFrame[layers[i].findTimelinePosByKeyframeIndex(layers[i].findKeyframe())].set(floor(x), floor(y), color(0)); // Set the pixel at (x, y) to black
                x += xIncrement; // Move to the next x coordinate
                y += yIncrement; // Move to the next y coordinate
            }
        }
    }
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].activeToggle.toggle === true && layers[i].visibilityToggle.toggle === true && drawingOnCanvasArea) {
            layers[i].drawFrame[layers[i].findTimelinePosByKeyframeIndex(layers[i].findKeyframe())].updatePixels(); // Update the canvas with the drawn line
        }
    }
}

function markerBrush(startPoint, endPoint, size, r, g, b, opacity) {
    // Calculate the distance between startPoint and endPoint
    let distance = dist(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    // Determine the number of steps required based on the distance
    let numSteps = int(distance);
    // Calculate the incremental change in x and y for each step
    let xIncrement = (endPoint.x - startPoint.x) / numSteps;
    let yIncrement = (endPoint.y - startPoint.y) / numSteps;
    // Start from the startPoint
    let x = startPoint.x;
    let y = startPoint.y;
    // Draw the line by setting pixels within a circular area around the brush's current position
    for (let i = 0; i <= numSteps; i++) {
        for (let j = -size; j <= size; j++) {
            for (let k = -size; k <= size; k++) {
                let xPos = floor(x + j);
                let yPos = floor(y + k);
                // Check if the pixel is within the circular area
                if (dist(xPos, yPos, startPoint.x, startPoint.y) <= size) {
                    // Update the pixels for all active and visible layers
                    for (let l = 0; l < layers.length; l++) {
                        if (layers[l].activeToggle.toggle === true && layers[l].visibilityToggle.toggle === true && drawingOnCanvasArea) {
                            let existingColor = layers[l].drawFrame[layers[l].findTimelinePosByKeyframeIndex(layers[l].findKeyframe())].get(xPos, yPos);
                            // Calculate the opacity based on opacity
                            let newAlpha = 255 * opacity; // Scale opacity to the range [0, 255]
                            // Create color with specified RGB values and the calculated opacity
                            let colorToSet = color(r, g, b, newAlpha);
                            layers[l].drawFrame[layers[l].findTimelinePosByKeyframeIndex(layers[l].findKeyframe())].set(xPos, yPos, colorToSet); // Set the pixel at (xPos, yPos) to the specified color
                        }
                    }
                }
            }
        }
        x += xIncrement; // Move to the next x coordinate
        y += yIncrement; // Move to the next y coordinate
    }
    // Update the canvas with the drawn line for all active and visible layers
    for (let l = 0; l < layers.length; l++) {
        if (layers[l].activeToggle.toggle === true && layers[l].visibilityToggle.toggle === true && drawingOnCanvasArea) {
            layers[l].drawFrame[layers[l].findTimelinePosByKeyframeIndex(layers[l].findKeyframe())].updatePixels();
        }
    }
}


function eraseLine(size, startPoint, endPoint) {
    // Calculate the slope of the line
    let dx = endPoint.x - startPoint.x;
    let dy = endPoint.y - startPoint.y;
    // Determine the number of steps required to reach from startPoint to endPoint
    let numSteps = max(abs(dx), abs(dy));
    // Calculate the incremental change in x and y for each step
    let xIncrement = dx / numSteps;
    let yIncrement = dy / numSteps;
    // Start from the startPoint
    let x = startPoint.x;
    let y = startPoint.y;
    // Erase pixels within the specified radius
    for (let i = 0; i <= numSteps; i++) {
        for (let j = -size; j <= size; j++) {
            for (let k = -size; k <= size; k++) {
                let xPos = floor(x + j);
                let yPos = floor(y + k);
                if (dist(xPos, yPos, x, y) <= size) {
                    for (let i = 0; i < layers.length; i++) {
                        if (layers[i].activeToggle.toggle === true && layers[i].visibilityToggle.toggle === true && drawingOnCanvasArea) {
                            layers[i].drawFrame[layers[i].findTimelinePosByKeyframeIndex(layers[i].findKeyframe())].set(xPos, yPos, color(0, 0, 0, 0));
                        }
                    }
                }
            }
        }
        x += xIncrement; // Move to the next x coordinate
        y += yIncrement; // Move to the next y coordinate
    }
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].activeToggle.toggle === true && layers[i].visibilityToggle.toggle === true && drawingOnCanvasArea) {
            layers[i].drawFrame[layers[i].findTimelinePosByKeyframeIndex(layers[i].findKeyframe())].updatePixels();
        }
    } // Update the canvas
}

function replaceColor(img, targetColor, newColor) {
    img.loadPixels();
    for (let i = 0; i < img.pixels.length; i += 4) {
        let r = img.pixels[i];
        let g = img.pixels[i + 1];
        let b = img.pixels[i + 2];
        let a = img.pixels[i + 3];
        if (r === targetColor.levels[0] && g === targetColor.levels[1] && b === targetColor.levels[2] && a === targetColor.levels[3]) {
            img.pixels[i] = newColor.levels[0];
            img.pixels[i + 1] = newColor.levels[1];
            img.pixels[i + 2] = newColor.levels[2];
            img.pixels[i + 3] = newColor.levels[3];
        }
    }
    img.updatePixels();
}

function preventDefault(e) {
    e.preventDefault();
}

function disableScroll() {
    document.body.addEventListener('touchmove', preventDefault, {
        passive: false
    });
}
//TO DO

//fix delays // cintiq has delays, ipad does not?
//copy paste keyframe
//update onionskin to not show frame while on its length // URGENT
//lazyline
//keyframe loop around length
//move keyframe position for timing // URGENT
// make a layer creator/deleter // URGENT
//soft marker brush
//clown tool
//lasso tool
//3d reference tool
//tool options
//onion skin from selection of keyframes
// create flip tool
// create zoom tool
//create window that can be moved
// animate live tool // multifinger clown tool
//nodes?