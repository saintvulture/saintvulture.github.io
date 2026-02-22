let screensizeMult = 1;

let debug = false;

let facing = 0;

let moveCounter = 0;

let nodeInstances = [];

let xoff = 0.0;
let yoff = 0.0;
let zoff = 0.0;

let showMap = false;


let monsterSprite = [];


let firstPersonView; //"perspective vision"
let firstPersonViewSizeX = 320;
let firstPersonViewSizeY = 240;

let images = [];

let NPCList;
let MonsterIdCount = [];
let mapInstance = [];

let terrainTiles = [];


let mapchoice = 2;

let skillUI = false;

const movementIndex = [
    [-1, 0],
    [0, +1],
    [+1, 0],
    [0, -1],
];

let passableEnv = [0, "F"]

let lut;
const LUT_SIZE = 512; 


function preload() {
  perks = loadJSON("JSON/skillNodeList.json");
    NPCList = loadJSON("JSON/NPC.json");
    MAPList = loadJSON("JSON/floors.json");
    monsterSprite[0] = loadImage("textures/entity/demonS2.png");
    monsterSprite[1] = loadImage("textures/entity/GoblinS.png");
    monsterSprite[2] = loadImage("textures/entity/batS.png");
    BG = loadImage("textures/environment/sewer/BackDropPan.png");
    pileTex = loadImage("textures/entity/pile.png");


  eyes = loadImage("textures/entity/eyes.png")
  
  floorTex = loadImage("textures/environment/sewer/floor.png");
  roofTex = loadImage("textures/environment/sewer/roof.png");
  
  GUI = loadImage("textures/GUI/GUI_comb.png");
  
  images[0] = []
   images[1] = []
  
  images[0][0] = loadImage("textures/environment/sewer/tile01.png");
  images[0][1] = loadImage("textures/environment/sewer/tile02.png");
  images[0][2] = loadImage("textures/environment/sewer/tile03.png");
  images[0][3] = loadImage("textures/environment/sewer/tile04.png");
  images[0][4] = loadImage("textures/environment/sewer/tile05.png");
  images[0][5] = loadImage("textures/environment/sewer/tile06.png");
  images[0][6] = loadImage("textures/environment/sewer/tile07.png");
  images[0][7] = loadImage("textures/environment/sewer/tile08.png");
  
  images[1][0] = loadImage("textures/environment/sewer/tile01_alt.png");
  images[1][1] = loadImage("textures/environment/sewer/tile02_alt.png");
  images[1][2] = loadImage("textures/environment/sewer/tile03_alt.png");
  images[1][3] = loadImage("textures/environment/sewer/tile04_alt.png");
  images[1][4] = loadImage("textures/environment/sewer/tile05_alt.png");
  images[1][5] = loadImage("textures/environment/sewer/tile06_alt.png");
  images[1][6] = loadImage("textures/environment/sewer/tile07_alt.png");
  images[1][7] = loadImage("textures/environment/sewer/tile08_alt.png");

  
  
  lut = loadImage('KODAK.png'); 
  
  
}

function setup() {
    createCanvas(1080*screensizeMult, 480*screensizeMult);
    textFont("Consolas");
    //playerScreen = createGraphics(240, 320, WEBGL);
    firstPerson = createGraphics(320, 240);
     firstPersonView = createGraphics(320, 240);


    skillTreeUI = createGraphics(600, 440) 
    mVision = createGraphics(mVisionSize, mVisionSize);


    Player = new Player(); // We should create the player from a json where we will store his data
    Player.maxHunger = 100;
    Player.hunger = 100;
    Player.maxHealth = 50;
    Player.health = 50;
  


  
    map = MAPList.floor[mapchoice].floorLayout;

  
    prepMap();

  /*
    for (let i = 0; i < perks.entry.length; i++) {
      skillNode[i] = new skillNode(perks.entry[i].ID, 20, 150*i);
      
    }
  
  */
  
  skillNode[0] = new skillNode(perks.entry[0].ID, 20, 150)
  
     gainPerk(1) 
     gainPerk(2) 
  gainPerk(3) 
 gainPerk(4) 
   gainPerk(5) 
   gainPerk(6) 
    gainPerk(7) 
  
 
  
  
  lut.loadPixels(); 
}


function draw() {
    background(0);
    RenderMap(); // these can now be updated only on moves
    Render2D(); //


  
      noiseSeed(99);
    xoff = xoff + 0.001;
    yoff = yoff + 0.01;
    zoff = zoff + 0.01;
    let nx = noise(xoff, yoff)*13;
    let ny = noise(yoff, xoff)*15;
    let nz = noise(zoff) * 10;
//  image(firstPersonView, 0, ny)
  
   
    //RenderPlayerScreen();
    
    firstPerson.background(150)
    firstPerson.image(firstPersonView,(-8+ nx)-moveAnim/2,(-9+ny)-moveAnim/2, 324+moveAnim, 244+moveAnim);
  
     firstPerson.filter(POSTERIZE, 32);

  
  image(firstPerson,40,40)
  stats();
  image(GUI, 0,0)
  
    
  //LUTEFFECTre
   loadPixels(); // Load the current frame's pixel data
  applyLUT(pixels); // Apply the LUT
  updatePixels(); // Update the image with the new pixel data
  
  
  
    if (Player.health <= 0) {
        Player.isAlive = false;
    }
    if (Player.isAlive === false) {
        fill(255, 0, 0);
        textSize(20);
        text("You are died lol", 100, 140);
    }
  Player.armorRating = Player.baseArmor + Player.armorMod;

     
  
  moveAnim = Math.min(Math.max(parseInt(moveAnim), 0.2), 5);
  if (keyIsDown(87) === true) {
   
    moveAnim += 3;
  }else{
       
    moveAnim -= 0.2
   // moveAnim = 0
  }
  
  skillTree();
  
  if (skillUI)
    {
      
   canvasOffsetX= 400
  }
  else
    {
      canvasOffsetX = 1520
    }



//Check perk conditions
 
  


      //Fireball
  if( nodeInstances[2].isActive === true )
    {
           Player.health = Player.health - 4;
      if (Player.inspectMonster() !== null) {
      console.log("Attack!");
      if (Player.inspectMonster().isAlive) {
        if (Player.mana >= 0 + 10) {
          Player.inspectMonster().health =
            Player.inspectMonster().health - 10;
     
        }
      }
      if (Player.inspectMonster().health <= 0) {
        Player.XP = Player.XP + Player.inspectMonster().XP;
        Player.inspectMonster().isAlive = false;

      }
        
        
    } else {
      console.log("No one here...");
    }
               
    }
  
  
  //inferno
  if( nodeInstances[3].isActive === true )
    {
           Player.health = Player.health - 10;
      if (Player.inspectMonster() !== null) {
      console.log("Attack!");
      if (Player.inspectMonster().isAlive) {
        if (Player.mana >= 0 + 10) {
          Player.inspectMonster().health =
            Player.inspectMonster().health - 50;
     
        }
      }
      if (Player.inspectMonster().health <= 0) {
        Player.XP = Player.XP + Player.inspectMonster().XP;
        Player.inspectMonster().isAlive = false;

      }
        
        
    } else {
      console.log("No one here...");
    }
               
    }
  
  
  //Heart of Lorkhan
  if( nodeInstances[6].isActive === true )
    {
       nodeInstances[6].num = ((nodeInstances[6].num - 1 + 3 - 1) % 3) + 1;
   
      if(nodeInstances[6].num === 3)
      {
          nodeInstances[6].enableSignalThrough = true;
         }
      else
        {
          nodeInstances[6].enableSignalThrough = false;
        }
    }
  
    //Ishtars kiss
  if( nodeInstances[7].isActive === true )
    {
       nodeInstances[7].num = ((nodeInstances[7].num - 1 + 5 - 1) % 5) + 1;
   
      if(nodeInstances[7].num === 5)
      {
          Player.health = Player.health + 20;
         }
 
    }
  
       //Mace
  if( nodeInstances[5].isActive === true )
    {
           Player.mana = Player.mana - 5;
      if (Player.inspectMonster() !== null) {
      console.log("Attack!");
      if (Player.inspectMonster().isAlive) {
        if (Player.mana >= 0 + 10) {
          Player.inspectMonster().health =
            Player.inspectMonster().health - 2;
     
        }
      }
      if (Player.inspectMonster().health <= 0) {
        Player.XP = Player.XP + Player.inspectMonster().XP;
        Player.inspectMonster().isAlive = false;

      }
        
        
    } else {
      console.log("No one here...");
    }
               
    }
  
  
 
    



}

 
let moveAnim = 0;



//Handle Player movement and render when move
function keyTyped() {
  
  
      if (key === "x" ) {
      Player.isSneaking = !Player.isSneaking;
         
     }
  
       if (key === "f") {
      skillUI = !skillUI
         
     }
  
     if (key === "+") {
       scaleFactor = scaleFactor + scaleMod;
     }
     
        if (key === "-") {
       scaleFactor = scaleFactor - scaleMod;
        }
  
    if (key === "i") {
        debug = !debug;
    }

    if (key === "u") {
        mapchoice = (mapchoice + 1) % 3;
        //map = MAPList.floor[mapchoice].floorLayout;
        loadWorldFromMap(mapchoice);
        prepMap();
    }
    if (Player.isAlive === true) {
        if (key === "e") {
            facing = facing + 1;
            if (facing >= 4) {
                facing = 0;
            }
            movementIndex.push(movementIndex.shift());
        }

        if (key === "q") {
            facing = facing - 1;
            if (facing <= -1) {
                facing = 3;
            }
            movementIndex.unshift(movementIndex.pop());
        }
        if (Player.myTurn === true) {
            //temporary battle exchange
            if (key === "r") {
                nodeInstances[0].isActive = true 
                 turnCylce();
                moveCounter++;
            }
          
        

            //Movement
      for (let i = 0; i < 4; i++) {
                if (facing === i) {
                    if (
                        key === "w" &&
                        mapInstance[Player.x + movementIndex[0][0]][
                            Player.y + movementIndex[0][1]
                        ] == 0 
                    ) {
                        Player.x = Player.x + movementIndex[0][0];
                        Player.y = Player.y + movementIndex[0][1];
                        turnCylce();
                       moveCounter++;
                      Render2D();
                    }

                    if (
                        key === "d" &&
                        mapInstance[Player.x + movementIndex[1][0]][
                            Player.y + movementIndex[1][1]
                        ] == 0
                    ) {
                        Player.x = Player.x + movementIndex[1][0];
                        Player.y = Player.y + movementIndex[1][1];
                        turnCylce();
                        moveCounter++;
                    }

                    if (
                        key === "s" &&
                        mapInstance[Player.x + movementIndex[2][0]][
                            Player.y + movementIndex[2][1]
                        ] == 0
                    ) {
                        Player.x = Player.x + movementIndex[2][0];
                        Player.y = Player.y + movementIndex[2][1];
                        turnCylce();
                        moveCounter++;
                    }

                    if (
                        key === "a" &&
                        mapInstance[Player.x + movementIndex[3][0]][
                            Player.y + movementIndex[3][1]
                        ] == 0
                    ) {
                        Player.x = Player.x + movementIndex[3][0];
                        Player.y = Player.y + movementIndex[3][1];
                        turnCylce();
                        moveCounter++;
                    }
                }
            }
        }
    }
}

function loadWorldFromMap(mapNum) {
    map = MAPList.floor[mapNum].floorLayout;
    mapClear = map.map(function(arr) {
        return arr.slice();
    });
}







isMousePressed = false;
function mousePressed() {
   isMousePressed = true;
  mousePosX = mouseX
  mousePosY = mouseY

 
    // If mouse is not over any node, enable dragging all nodes
  if (!isMouseOverAnyNode()  && !isMouseOverAnyNodeOutput()  ) {
   isDraggingAll = true;
    dragAllOffsetX = mouseX;
    dragAllOffsetY = mouseY;
  }
  
  
    for (let i = 0; i < nodeInstances.length; i++) {
    nodeInstances[i].mousePressed();
  }

}


function mouseDragged() {
  for (let i = 0; i < nodeInstances.length; i++) {
    nodeInstances[i].mouseDragged();
  }

if (isDraggingAll) {
    let offsetX = (mouseX - dragAllOffsetX) / scaleFactor;
    let offsetY = (mouseY - dragAllOffsetY) / scaleFactor;

    // Move all nodes by the offset
    for (let i = 0; i < nodeInstances.length; i++) {
      nodeInstances[i].posX += offsetX;
      nodeInstances[i].posY += offsetY;
    }

    // Update drag offset to the new mouse position
    dragAllOffsetX = mouseX;
    dragAllOffsetY = mouseY;
  }

}

function mouseReleased() {
  isMousePressed = false;
  
  isDraggingAll = false;
    for (let i = 0; i < nodeInstances.length; i++) {
    nodeInstances[i].mouseReleased();
  }
  
}




//World Manager
// this function creates a mapClear Array. It removes all the monsters and the player and replaces it with ground. The monsters are stores in the Monsters array,

//You should create the terrain classes here
function prepMap() {
    mapClear = [];
    monsterPos = [];
    Monsters = [];
  
  terrainPos = [];
  terrain=[];


    howManyMonster = 0;
    //Make copy of map
    loadWorldFromMap(mapchoice);

    //Find player on original map
    playerPos = findIndex(map, "@");

    //Make clean map by inserting ground into player position
    mapClear[playerPos[0]][playerPos[1]] = 0;

    //place player class in position on map

    Player.x = playerPos[0];
    Player.y = playerPos[1];

    //roll through JSON array of letters to find all of letter type
    for (let j = 0; j < NPCList.monster.length; j++) {
        howManyMonster =
            howManyMonster + calculateCount(map, NPCList.monster[j].mapID);

        //clean up the map of monsters icons and store new classes in array
        for (let i = 0; i < calculateCount(map, NPCList.monster[j].mapID); i++) {
            monsterPos[i] = findIndex(mapClear, NPCList.monster[j].mapID);

            mapClear[monsterPos[i][0]][monsterPos[i][1]] = 0; //This clears the map

            //Creates Monster class and pushes them into Monsters array
            monster = new Monster(
                NPCList.monster[j].name,
                monsterPos[i][0],
                monsterPos[i][1],
                NPCList.monster[j].mapID
            );

            monster.name = NPCList.monster[j].name;
            monster.icon = NPCList.monster[j].mapID;
            monster.sprite = NPCList.monster[j].sprite;
            monster.health = NPCList.monster[j].health;
            monster.maxHealth = NPCList.monster[j].health;
            monster.attack = NPCList.monster[j].attack;
            monster.energy = NPCList.monster[j].energy;
            monster.energyGained = NPCList.monster[j].energyGained;
          monster.XP = NPCList.monster[j].XP;
            monster.energyRequired = Math.round(
                NPCList.monster[j].energyRequired * Player.speed
            );
          
          if (monster.energyRequired === 0)
            {
              monster.energyRequired = 1
            }
            Monsters.push(monster);
        }
    }
  
  
 //create terrain classes
    for (let x = 0; x < mapClear.length; x++) {
      terrain[x] = []; 
        for (let y = 0; y < mapClear[x].length; y++) {
            // Fixing this to use the right coordinates and adding default values for icon, style, etc.
             terrainTile = new Terrain();
            
            terrainTile.x = x;
            terrainTile.y = y;
            terrainTile.icon = mapClear[x][y]
            if (mapClear[x][y] === 0){
              terrainTile.walkable = true
            } else{
               terrainTile.walkable = false
            }
            
           terrainTile.style =  MAPList.floor[mapchoice].floorTheme;
          
           if (mapClear[x][y] === 0){
              terrainTile.type = 'floor'
            } 
          
           if (mapClear[x][y] === 1){
               terrainTile.walkable = 'wall'
            }
          
          
          terrainTile.variation =  Math.floor(Math.random() * (1 - 0 + 1) + 0);
          
            //terrain[x][y] = terrainTile;
            
            terrain[x][y] = terrainTile;
        }
    }

 


}


const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const turnCylce = async() => {
    Player.turn(); //calls for player regen
    Player.myTurn = false; //disables player
  
  
   nodeInstances[1].num = ((nodeInstances[1].num - 1 + 2 - 1) % 2) + 1;
   
      if(nodeInstances[1].num === 2)
      {
          nodeInstances[1].isActive = true;
         }
      else
        {
          nodeInstances[1].isActive = false;
        }    
  
       if(Player.maxHealth/2 >= Player.health )
    {
      nodeInstances[4].isActive = true
    }
  
await delay(5.25);
  nodeInstances[0].isActive = false
  nodeInstances[1].isActive = false
     nodeInstances[4].isActive = false


    for (let i = 0; i < Monsters.length; i++) {
      if (Monsters[i].isAlive)  {
        
 
      Monsters[i].energy += Monsters[i].energyGained;
        Monsters[i].myTurn = true;
        while (Monsters[i].energy >= Monsters[i].energyRequired) {

            await delay(25.25);
            Monsters[i].energy -= Monsters[i].energyRequired;
            Monsters[i].turn();
          
  
          
        }
      }
        //this whole thing is a future me problem
     
      if(Player.isSneaking)
        {
      Monsters[i].vision = Monsters[i].visionMod * Player.visibility; 
          }
      else
        {
           Monsters[i].vision = 5
        }
    }

    Player.myTurn = true;
  nodeInstances[4].isActive = false
  

  
  
  if (Monsters.every(monster => !monster.isAlive)) { //cycle through maps
    mapchoice = (mapchoice + 1) % 3;
        //map = MAPList.floor[mapchoice].floorLayout;
        loadWorldFromMap(mapchoice);
        prepMap()
  }
};




function doesPlayerHavePerk(ID)
{
 for (let i = 0; i < nodeInstances.length; i++) {
   if(nodeInstances[i].ID === ID){
     return true;
   }
   else
     {
       return false;
     }
 }
  
}


function gainPerk(n){ 

 
        skillNode[n] = new skillNode(perks.entry[n].ID, nodeInstances[nodeInstances.length-1].posX +150, 150)
    


}


function stats() {
    //display monster health and name
    for (let i = 0; i < Monsters.length; i++) {
        if (
            arraysEqual(Player.inspect(), Monsters[i].myPos()) &&
            Monsters[i].isAlive
        ) {
            fill(255, 255, 255);
            noStroke();
            rect(20, 280, 320, 20);

            fill(255, 0, 0);
            noStroke();
            rect(20, 280, (Monsters[i].health / Monsters[i].maxHealth) * 320, 20);
            fill(0, 0, 0);
            textSize(20);
            text(Monsters[i].name, 20, 40);
        }
    }

    //Player health
    fill(0, 0, 0);
    noStroke();
    rect(340, 300, 50, -50);

    fill(255, 0, 0);
    noStroke();
    rect(340, 300, 50, -(Player.health / Player.maxHealth) * 50);
    fill(0, 0, 0);

    //Player mana
    fill(0, 0, 0);
    noStroke();
    rect(0, 300, 50, -50);

    fill(0, 255, 0);
    noStroke();
    rect(0, 300, 50, -(Player.mana / Player.maxMana) * 50);
    fill(0, 0, 0);

    textSize(15);
    fill(200, 200, 200);
    let orient = ["North", "East", "South", "West"];
    text(orient[facing], 220, 300);
    text("Time: " + moveCounter, 40, 300);
  
  
  text("Health = " + floatRound(Player.health), 40, 320); 
  text("Health Regen = " + Player.healthRegen, 40, 340);
    text("Stamina = " + floatRound(Player.mana), 40, 360);
  text("Stamina Regen = " + Player.manaRegen, 40, 380);
  
    // text("Hunger = " + floatRound(Player.hunger), 40, 400);
  
  // text("Armor rating = " + Player.armorRating*10, 40, 420);
  
   text("Lvl = " + Player.level, 40, 440);
   text("XP = " + Player.XP, 40, 460);
   text("Sneaking = " + Player.isSneaking, 40, 480);
  
  
}


function floatRound(n)
{
  return (Math.round(n * 100) / 100).toFixed(2)
}

//POST PROCESSING
function applyLUT(imgPixels) {
  
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let idx = (y * width + x) * 4;

      let r = Math.floor(imgPixels[idx] / 4);    // Red
      let g = Math.floor(imgPixels[idx + 1] / 4); // Green
      let b = Math.floor(imgPixels[idx + 2] / 4); // Blue

      // Normalize the RGB values to fit the LUT range
      let lutX = (b % 8) * 64 + r;  // Scale 0-255 to 0-63
      let lutY =  Math.floor(b / 8) * 64 + g; // Scale 0-255 to 0-63

      // Calculate the index in the LUT for the color lookup
      let lutIdx = (lutY * LUT_SIZE + lutX) * 4;

      // Apply LUT color to the image pixel
      imgPixels[idx]     = lut.pixels[lutIdx];       // Red from LUT
      imgPixels[idx + 1] = lut.pixels[lutIdx + 1];   // Green from LUT
      imgPixels[idx + 2] = lut.pixels[lutIdx + 2];   // Blue from LUT
      // imgPixels[idx + 3] remains unchanged (Alpha)
    }
  }
}





let mapSaves = [];

function mapPacker()
{
storedMap = mapchoice
storedMonsters = JSON.parse(JSON.stringify(Monsters))
storedPlayer = JSON.parse(JSON.stringify(Player));
  
mapSaves.push([storedMap, storedMonsters, storedPlayer])
//store mapclear
//store Monsters


  
}

function mapUnpacker(n)
{
 
   mapchoice = mapSaves[n][0]
   prepMap()
  
  
  Object.assign(Player, mapSaves[n][2]) 
  
   for (let i = 0; i < Monsters.length; i++) {
        Object.assign(Monsters[i], mapSaves[n][1][i]) 
   }
  

}


