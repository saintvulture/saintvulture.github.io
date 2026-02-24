let objectArray = [];

// Matter aliases
var Engine = Matter.Engine,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Vertices = Matter.Vertices;

var engine;
var world;
var ground;

const BASE_WIDTH = 800;
const BASE_HEIGHT = 300;

let scaleFactor;

// Original vertex shapes
const letterM = Vertices.fromPath('0 0 50 50 100 0 100 100 0 100');
const letterX = Vertices.fromPath('0 25 25 0 50 25 75 0 100 25 75 50 100 75 75 100 50 75 25 100 0 75 25 50');

const centerM = computeCenter(letterM);
const centerX = computeCenter(letterX);

function setup() {

  // 🔥 CHANGE CANVAS SIZE MANUALLY HERE
  let canvas = createCanvas(840, 120);
  canvas.parent("logo-container");

  // Maintain aspect ratio scaling
  scaleFactor = min(width / BASE_WIDTH, height / BASE_HEIGHT);

  engine = Engine.create();
  world = engine.world;

  ground = Bodies.rectangle(
    width / 2,
    height + 10,
    width,
    40 * scaleFactor,
    { isStatic: true }
  );

  let logoColor1 = color('#e52956');
  let logoColor2 = color('#0f75ef');

  let MoxoM  = new Letter(100, 110, letterM, centerM);
  let MoxoO1 = new Circle(215, 100, 50, logoColor1);
  let MoxoX  = new Letter(102, 210, letterX, centerX);
  let MoxoO2 = new Circle(215, 210, 50, logoColor2);

  objectArray.push(MoxoM, MoxoO1, MoxoX, MoxoO2);

  Composite.add(world, [ground]);

  Runner.run(engine);
  engine.gravity.y = 0;
}

function draw() {
  background(255);

  for (let obj of objectArray) {
    obj.show();
  }
}


function mouseClicked() {

  engine.gravity.y = 1;

  for (let obj of objectArray) {
    Matter.Body.setStatic(obj.body, false);
  }

  let randomX = random(80, width - 80);

  if (random() < 0.5) {

    let logoColor1 = color('#e52956');

    objectArray.push(
      new Letter(
        randomX / scaleFactor,
        -200,
        letterM,
        centerM
      )
    );

    objectArray.push(
      new Circle(
        (randomX + 60) / scaleFactor,
        -200,
        50,
        logoColor1
      )
    );

  } else {

    let logoColor2 = color('#0f75ef');

    objectArray.push(
      new Letter(
        randomX / scaleFactor,
        -400,
        letterX,
        centerX
      )
    );

    objectArray.push(
      new Circle(
        (randomX - 60) / scaleFactor,
        -400,
        50,
        logoColor2
      )
    );
  }
}

// ================= LETTER =================

function Letter(baseX, baseY, vertices, center) {

  // Scale position
  let x = baseX * scaleFactor;
  let y = baseY * scaleFactor;

  // Scale vertices
  let scaledVertices = vertices.map(v => ({
    x: v.x * scaleFactor,
    y: v.y * scaleFactor
  }));

  this.body = Bodies.fromVertices(x, y, scaledVertices);

  this.body.friction = 0.2;
  this.body.restitution = 0.5;

  Composite.add(world, this.body);

  this.show = function() {
    let pos = this.body.position;
    let angle = this.body.angle;

    push();
    translate(pos.x, pos.y);
    rotate(angle);

    translate(-center.x * scaleFactor, -center.y * scaleFactor);

    noStroke();
    fill(0);

    beginShape();
    for (let v of scaledVertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);

    pop();
  };
}

// ================= CIRCLE =================

function Circle(baseX, baseY, baseRadius, c) {

  let x = baseX * scaleFactor;
  let y = baseY * scaleFactor;
  let r = baseRadius * scaleFactor;

  this.body = Bodies.circle(x, y, r);

  this.body.friction = 0.2;
  this.body.restitution = 0.6;

  Composite.add(world, this.body);

  this.show = function() {
    let pos = this.body.position;
    let angle = this.body.angle;

    push();
    translate(pos.x, pos.y);
    rotate(angle);

    fill(c);
    noStroke();
    circle(0, 0, r * 2);

    pop();
  };
}

// ================= GEOMETRY HELPERS =================

function computeArea(vertices) {
  let area = 0;
  for (let i = 0; i < vertices.length - 1; i++) {
    let v = vertices[i];
    let vn = vertices[i + 1];
    area += (v.x * vn.y - vn.x * v.y) / 2;
  }
  return area;
}

function computeCenter(vertices) {
  let area = computeArea(vertices);
  let cx = 0, cy = 0;

  for (let i = 0; i < vertices.length - 1; i++) {
    let v = vertices[i];
    let vn = vertices[i + 1];
    cx += (v.x + vn.x) * (v.x * vn.y - vn.x * v.y) / (6 * area);
    cy += (v.y + vn.y) * (v.x * vn.y - vn.x * v.y) / (6 * area);
  }

  return { x: cx, y: cy };
}