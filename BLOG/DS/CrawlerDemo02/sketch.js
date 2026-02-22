let screensizeMult = 1;

let song;

let debug = false;

let facing = 0;
let gsize = 15;
let moveCounter = 0;

let nodeInstances = [];

let xoff = 0.0;
let yoff = 0.0;
let zoff = 0.0;

let showMap = false;

let mVisionSize = 90;

let monsterSprite = [];


let twoVision; //"perspective vision"
let twoVisionSizeX = 320;
let twoVisionSizeY = 240;

let images = [];

let NPCList;
let MonsterIdCount = [];
let mapInstance = [];
let visionCone = [];
let terrainTiles = [];


let mapchoice = 2;

const movementIndex = [
    [-1, 0],
    [0, +1],
    [+1, 0],
    [0, -1],
];

let passableEnv = [0, "F"]

function preload() {
  perks = loadJSON("skillNodeList.json");
    NPCList = loadJSON("NPC.json");
    MAPList = loadJSON("floors.json");
    monsterSprite[0] = loadImage("demonS2.png");
    monsterSprite[1] = loadImage("GoblinS.png");
    monsterSprite[2] = loadImage("batS.png");
    BG = loadImage("BackDropPan.png");
    pileTex = loadImage("pile.png");


  eyes = loadImage("eyes.png")
  
  floorTex = loadImage("floor.png");
  roofTex = loadImage("roof.png");
  
  images[0] = loadImage("tile01.png");
  images[1] = loadImage("tile02.png");
  images[2] = loadImage("tile03.png");
  images[3] = loadImage("tile04.png");
  images[4] = loadImage("tile05.png");
  images[5] = loadImage("tile06.png");
  images[6] = loadImage("tile07.png");
  images[7] = loadImage("tile08.png");
  images[8] = loadImage("tile09.png");
  images[9] = loadImage("tile10.png");
  images[10] = loadImage("tile11.png");
  images[11] = loadImage("tile12.png");
    images[12] = loadImage("tile13.png");
  
  
  
}

function setup() {
    createCanvas(640*screensizeMult, 480*screensizeMult);
    textFont("Consolas");
    playerScreen = createGraphics(240, 320, WEBGL);
    
     twoVision = createGraphics(width / 2, height / 2);


    skillTreeUI = createGraphics(400, 400) 
    mVision = createGraphics(mVisionSize, mVisionSize);


    Player = new Player(); // We should create the player from a json where we will store his data
    Player.maxHealth = 50;
    Player.health = 50;
    map = MAPList.floor[mapchoice].floorLayout;

    prepMap();

  
    for (let i = 0; i < perks.entry.length; i++) {
      skillNode[i] = new skillNode(perks.entry[i].ID, 20, 150*i);
      
    }
  
  
  
}


function draw() {
    background(0);
    RenderMap();
   render2D();

    //skillTree();
    //RenderPlayerScreen();

    stats();
    if (Player.health <= 0) {
        Player.isAlive = false;
    }
    if (Player.isAlive === false) {
        fill(255, 0, 0);
        textSize(20);
        text("You are died lol", 100, 140);
    }
  


}

//Handle Player movement and render when move
function keyTyped() {
    if (key === "i") {
        debug = !debug;
    }

    if (key === "u") {
        mapchoice = (mapchoice + 1) % 3;
        //map = MAPList.floor[mapchoice].floorLayout;
        loadWorldFromMap();
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
                for (let i = 0; i < Monsters.length; i++) {
                    if (
                        arraysEqual(Player.inspect(), Monsters[i].myPos()) &&
                        Monsters[i].isAlive
                    ) {
                        if (Player.mana >= 0+10) {
                            Monsters[i].health = Monsters[i].health - Player.attack;
                            Player.mana = Player.mana - 10;
                        }
                    }
                    if (Monsters[i].health <= 0) {
                        Monsters[i].isAlive = false;
                        Monsters[i].icon = "0";
                    }
                }
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
                      render2D();
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

function loadWorldFromMap() {
    map = MAPList.floor[mapchoice].floorLayout;
    mapClear = map.map(function(arr) {
        return arr.slice();
    });
}


//Skill tree
function skillTree(){
  skillTreeUI.background(125)
  
    for (let i = 0; i < nodeInstances.length; i++) {
       skillNode[i].skillNodeDraw();
      }
  
  
   image(skillTreeUI, 20, 20);
}

class skillNode {
  constructor(ID, posX, posY) {
    this.ID = ID;
    this.posX = posX;
    this.posY = posY;

    this.outClasses = []
    
    this.outNums = []
    
    for (let i = 0; i < perks.entry.length; i++) {
      if (perks.entry[i].ID === this.ID) {
        this.outNodes = perks.entry[i].outBoundNode.length;
        this.outBool = new Array(this.outNodes).fill(false);
        
        for (let j = 0; j < perks.entry[i].outBoundNode.length; j++) {
        this.outClasses.push(perks.entry[i].outBoundNode[j].outClass);
        }
        for (let j = 0; j < perks.entry[i].outBoundNode.length; j++) {
        this.outNums.push(perks.entry[i].outBoundNode[j].outNum);
         }
        
      }
    }
        for (let i = 0; i < perks.entry.length; i++) {
      if (perks.entry[i].ID === this.ID) {
     this.num = perks.entry[i].num
      }}
    
    for (let i = 0; i < perks.entry.length; i++) {
      if (perks.entry[i].ID === this.ID) {
    this.class = perks.entry[i].class
      }}
    
    this.offsetX = 0;
    this.offsetY = 0;
    
    
   this.outNodePos = [] 
  
  this.inputNodeID = 0;
  this.inputNodeIndex = 0;  
    
  this.isNodeSelected = false;
  this.isNodeDragged = false;
  this.boxScaleX = 160;
  this.boxScaleY = 100;
  this.isConnected = false;
  this.outNodeIndex = -1;  
  nodeInstances.push(this);
    

  }

  
    isMouseOver() {
    return (
      mouseX > this.posX &&
      mouseX < this.posX + this.boxScaleX &&
      mouseY > this.posY &&
      mouseY < this.posY + this.boxScaleY 
    );
  }
  
    mousePressed() {
    if (this.isMouseOver()) {
      this.offsetX = this.posX - mouseX;
      this.offsetY = this.posY - mouseY;
      this.isNodeDragged = true;
    } else {
      this.isNodeDragged = false;
    }
  }
  
    mouseDragged() {
    if (this.isNodeDragged) {
      this.posX = mouseX + this.offsetX;
      this.posY = mouseY + this.offsetY;
    }
  }

  mouseReleased() {
    this.isNodeDragged = false;
  }

  
  
  connector(posX, posY, endPosX, endPosY){

   line(posX, posY, endPosX, endPosY);
  //bezier(posX, posY, posX, endPosY, endPosX, posY, endPosX, endPosY);

  
}
  
  
  returnPositionInArray(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].ID === this.ID) {
        return i;
      }
    }
    // Return -1 if the ID is not found in the array
    return -1;
  }
  
  

  
  skillNodeDraw() {

   

    for (let i = 0; i < perks.entry.length; i++) {
      if (perks.entry[i].ID === this.ID) {
        // BOX DESIGN
        
        let inputCircleX = this.posX + this.boxScaleX / 2
        let inputCircleY = this.posY
        
         for (let i = 0; i < nodeInstances.length; i++) { //for loop to find any activation of isNodeSelected
        if (dist(inputCircleX, inputCircleY, mouseX, mouseY) <= 20 && nodeInstances[i].isNodeSelected === true){
        skillTreeUI.ellipse(inputCircleX, inputCircleY, 40, 2+40); //inbound circle large
          
        }
         else {
             skillTreeUI.ellipse(inputCircleX, inputCircleY, 20, 20); //inbound circle small
        }
      
      }
        
        //////
      
         skillTreeUI.rect(this.posX, this.posY, this.boxScaleX, this.boxScaleY); // overall Box
         skillTreeUI.rect(this.posX, this.posY, this.boxScaleX, 20); // name part box

        for (let i = 0; i < this.outNodes; i++) {
          
          
        for (let j = 0; j < nodeInstances.length; j++) {   //loop through nodeInstances to find input connector
          
          // outbound circles
          let circleX = this.posX + i * (this.boxScaleX / this.outNodes) + (this.boxScaleX / this.outNodes) / 2;
          let circleY = this.posY + this.boxScaleY + 40;
          
          let nodeMatch = false;
          
          this.outNodePos[i]=[circleX,circleY]
          
           // connector handling
          if (this.outBool[i] === true) {
            this.connector(circleX, circleY, mouseX, mouseY);
            this.isNodeSelected = true;
            
 
               
            if(nodeInstances[j].class === this.outClasses[findTrueIndex(this.outBool)]) 
               {
                 
                 nodeMatch = true
               }
        
   
          }
          
          //Transfer Data here, edit connect conditions
          
          if(dist(nodeInstances[j].posX + this.boxScaleX / 2, nodeInstances[j].posY, mouseX, mouseY) <= 20 && this.isNodeSelected === true && nodeMatch === true && !nodeInstances[j].calculationsDone) {
                 console.log("I, " + this.ID + " am approaching input node for " + nodeInstances[j].ID + " from outbound node " + findTrueIndex(this.outBool) + " that belongs to " + this.ID)
           
              nodeInstances[j].inputNodeID = this.ID
            nodeInstances[j].inputNodeIndex = findTrueIndex(this.outBool)
          
            nodeInstances[j].isConnected = true;
            
            //Do new perk calculations here
            
            nodeInstances[j].num = this.outNums[findTrueIndex(this.outBool)] + nodeInstances[j].num
               nodeInstances[j].calculationsDone = true;
          }
       
          if(nodeInstances[j].isConnected === true && nodeInstances[j].inputNodeID === this.ID )
             {
                         
           this.connector(this.outNodePos[nodeInstances[j].inputNodeIndex][0], this.outNodePos[nodeInstances[j].inputNodeIndex][1], nodeInstances[j].posX + this.boxScaleX / 2, nodeInstances[j].posY )
             }
       
          

          if (dist(circleX, circleY, mouseX, mouseY) <= 20 && isMousePressed) {
             skillTreeUI.ellipse(circleX, circleY, 40, 40); //"highlights" the circle the mouse is near
           
            this.outBool[i] = true;
            this.outNodeIndex = findTrueIndex(this.outBool)

            
          //console.log(findTrueIndex(this.outBool))
           // console.log("I pressed outbound Node " + i + " that belongs to " + this.ID + " which is Node number " + this.returnPositionInArray(nodeInstances) );
           // console.log(this.outBool); // with this.outBool we get which out node is active. rolling through this.ID with this.outBool we can figure which data needs to be forwarded to this.input
         
            
          } else {
             skillTreeUI.ellipse(circleX, circleY, 20, 20);
            this.outNodeIndex = -1
            // Set outBool to false when mouse is not pressed
            if (!isMousePressed) {
              this.outBool[i] = false;
              this.isNodeSelected = false;
            }
          }

        }

           skillTreeUI.rect(this.posX + i * (this.boxScaleX / this.outNodes), this.boxScaleY + this.posY, this.boxScaleX / this.outNodes, 40);
        }

        
        
        
        
        
        
        
        
        // Skill name
         skillTreeUI.text(perks.entry[i].skill + ": " + perks.entry[i].perkName, this.posX + 5, this.posY + 5, this.boxScaleX - 5, this.boxScaleY - 5);

        // Skill Text, we use a replacer to indicate the variable num
        
        
        
         skillTreeUI.text(perks.entry[i].text.replace("{{num}}", this.num), this.posX + 5, this.posY + 25, this.boxScaleX - 5, this.boxScaleY - 5);

        // OUTBOUND NODES
        // Modifier Text
        
       
        for (let j = 0; j < this.outNodes; j++) {
           skillTreeUI.text(perks.entry[i].outBoundNode[j].outEffect, this.posX + 5 + j * (this.boxScaleX / this.outNodes), this.posY + this.boxScaleY + 5, this.boxScaleX - 5, this.boxScaleY - 5);

           skillTreeUI.text(perks.entry[i].outBoundNode[j].outClass, this.posX + 5 + j * (this.boxScaleX / this.outNodes), this.posY + 15 + this.boxScaleY + 5, this.boxScaleX - 5, this.boxScaleY - 5);
        }
      }
      // BOX DESIGN
    }

  // Drag and Drop Handling
    this.mouseDragged();
    if (mouseIsPressed) {
      this.mousePressed();
    } else {
      this.mouseReleased();
    }
  
  
  }
}



isMousePressed = false;
function mousePressed() {
   isMousePressed = true;
  mousePosX = mouseX
  mousePosY = mouseY
    
  
  
  
    for (let i = 0; i < nodeInstances.length; i++) {
    nodeInstances[i].mousePressed();
  }

}


function mouseDragged() {
  for (let i = 0; i < nodeInstances.length; i++) {
    nodeInstances[i].mouseDragged();
  }
}

function mouseReleased() {
  isMousePressed = false;
  
  
    for (let i = 0; i < nodeInstances.length; i++) {
    nodeInstances[i].mouseReleased();
  }
  
}

//tool to find true bool
function findTrueIndex(boolArray) {
  for (let i = 0; i < boolArray.length; i++) {
    if (boolArray[i] === true) {
      return i; // Return the index of the first true value
    }
  }
  // If no true value is found, return -1 or any value that indicates none is true
  return -1;
}


//World Manager
// this function creates a mapClear Array. It removes all the monsters and the player and replaces it with ground. The monsters are stores in the Monsters array,
function prepMap() {
    mapClear = [];
    monsterPos = [];
    Monsters = [];



    howManyMonster = 0;
    //Make copy of map
    loadWorldFromMap();

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
  
  
  

 


}


const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const turnCylce = async() => {
    Player.turn(); //calls for player regen
    Player.myTurn = false; //disables player

    for (let i = 0; i < Monsters.length; i++) {
        Monsters[i].energy += Monsters[i].energyGained;
        Monsters[i].myTurn = true;
        while (Monsters[i].energy >= Monsters[i].energyRequired) {

            await delay(50.25);
            Monsters[i].energy -= Monsters[i].energyRequired;
            Monsters[i].turn();
        }
        //Monsters[i].myTurn = false;
    }

    Player.myTurn = true;
  
  if (Monsters.every(monster => !monster.isAlive)) {
    mapchoice = (mapchoice + 1) % 3;
        //map = MAPList.floor[mapchoice].floorLayout;
        loadWorldFromMap();
        prepMap()
  }
};

//Rendering
//this doesnt just render but manages monsters and updates their position
function RenderMap() {
    mVision.background(0);
    mapInstance = mapClear.map(function(arr) {
        return arr.slice();
    });
    mapNavmesh = mapClear.map(function(arr) {
        return arr.slice();
    });
    //draws map from 2d Array, you edit symbols for 2d map here
    for (let j = 0; j < mapInstance.length; j++) {
        for (let i = 0; i < mapInstance[j].length; i++) {
            if (mapInstance[j][i] === 1) {
                mVision.textSize(gsize);
                mVision.fill(200, 200, 200);
                if (debug === true) {
                    if (isCorner(mapClear, 1, j, i) === "LowerLeft") {
                        mVision.fill(0, 255, 0);
                    } else if (isCorner(mapClear, 1, j, i) === "UpperLeft") {
                        mVision.fill(255, 0, 0);
                    } else if (isCorner(mapClear, 1, j, i) === "LowerRight") {
                        mVision.fill(0, 0, 255);
                    } else if (isCorner(mapClear, 1, j, i) === "UpperRight") {
                        mVision.fill(0, 255, 255);
                    }

                    if (isWall(mapClear, 1, j, i) === "Horizontal") {
                        mVision.fill(255, 255, 0);
                    } else if (isWall(mapClear, 1, j, i) === "Vertical") {
                        mVision.fill(255, 0, 255);
                    }
                }
                mVision.text(
                    "#",
                    i * gsize - (Player.y * gsize - mVisionSize / 2),
                    j * gsize - (Player.x * gsize - mVisionSize / 2)
                );
            }
            if (mapInstance[j][i] === 0) {
                mVision.textSize(gsize);
                mVision.fill(150, 150, 150);
                mVision.text(
                    ".",
                    i * gsize - (Player.y * gsize - mVisionSize / 2),
                    j * gsize - (Player.x * gsize - mVisionSize / 2)
                );
            }

            if (mapInstance[j][i] === "F") {
                mVision.textSize(gsize);
                mVision.fill(150, 150, 150);
                mVision.text(
                    "F",
                    i * gsize - (Player.y * gsize - mVisionSize / 2),
                    j * gsize - (Player.x * gsize - mVisionSize / 2)
                );
            }




            //Load player, monster symbol

            if (mapInstance[j][i] === Player.icon) {
                mVision.textSize(gsize);
                mVision.fill(255, 255, 0);
                mVision.text(
                    Player.icon,
                    i * gsize - (Player.y * gsize - mVisionSize / 2),
                    j * gsize - (Player.x * gsize - mVisionSize / 2)
                );
            }
            for (let k = 0; k < NPCList.monster.length; k++) {
                if (mapInstance[j][i] === NPCList.monster[k].mapID) {
                    mVision.textSize(gsize);
                    mVision.fill(
                        NPCList.monster[k].IDcR,
                        NPCList.monster[k].IDcG,
                        NPCList.monster[k].IDcB
                    );
                    mVision.text(
                        NPCList.monster[k].mapID,
                        i * gsize - (Player.y * gsize - mVisionSize / 2),
                        j * gsize - (Player.x * gsize - mVisionSize / 2)
                    );
                }
            }

            //Draw entities
        playerLook();
            ///inserts monster icon to map
            for (let i = 0; i < howManyMonster; i++) {
                //
                mapInstance[Monsters[i].x][Monsters[i].y] = Monsters[i].icon;
                if (Monsters[i].isAlive === false) { //replaces icon with floor
                    mapInstance[Monsters[i].x][Monsters[i].y] = 0;
                }
            }

            ///inserts player icon to map
            mapInstance[Player.x][Player.y] = Player.icon;


        }
    }

    //all of this should be in map manager, seperated from the renderer
    //Creates nodes for A*, sets which ones are passable
    for (let j = 0; j < mapNavmesh.length; j++) {
        for (let i = 0; i < mapNavmesh[j].length; i++) {
            mapNavmesh[j][i] = new Node(j, i);

            if (mapInstance[j][i] === 1) {
                mapNavmesh[j][i].isPassable = false;
            }


            for (let k = 0; k < NPCList.monster.length; k++) {
                if (mapInstance[j][i] === NPCList.monster[k].mapID) {
                    mapNavmesh[j][i].isPassable = false;
                }
            }
        }
    }

    //debug paths and vision
    if (debug === true) {
        for (let k = 0; k < Monsters.length; k++) {
            if (Monsters[k].getPath() !== null && Monsters[k].isAlive === true) {
                for (let o = 0; o < Monsters[k].getPath().length; o++) {
                    mVision.textSize(gsize);
                    mVision.fill(255, 255, k * 20);
                    mVision.text(
                        "*",
                        Monsters[k].getPath()[o].y * gsize -
                        (Player.y * gsize - mVisionSize / 2),
                        Monsters[k].getPath()[o].x * gsize -
                        (Player.x * gsize - mVisionSize / 2)
                    );
                }

                /*  for (let o = 0; o < Monsters[k].getVision().length; o++) {
                             mVision.textSize(gsize);
                             mVision.fill(255, 0, 0);
                             mVision.text(
                               "*",
                               Monsters[k].getVision()[o].y * gsize -
                                 (Player.y * gsize - mVisionSize / 2),
                               Monsters[k].getVision()[o].x * gsize -
                                 (Player.x * gsize - mVisionSize / 2)
                             );
                           }*/
            }
        }
    }
    image(mVision, 220, 300);
}



function RenderPlayerScreen() {
    playerScreen.push();
    playerScreen.clear(playerScreen.DEPTH_BUFFER_BIT);
    playerScreen.stroke(0);
    playerScreen.strokeWeight(0);

    playerScreen.rotateY(mouseX / 140);

    playerScreen.scale(-40);
    playerScreen.rotateY(200);
    playerScreen.texture(playerUV);
    playerScreen.model(playerModel);
    playerScreen.texture(hairUV);
    playerScreen.model(hairModel);

    image(playerScreen, 380, 20);
    playerScreen.pop();
}




//Generateimage
function render2D() {

  twoVision.background(0);
//  twoVision.image(BG, facing * -twoVisionSize, 0, twoVisionSize * 4, twoVisionSize); //pans background across
  
  twoVision.image(floorTex, 0, 0, twoVisionSizeX, twoVisionSizeY);
   twoVision.image(roofTex, 0, 0, twoVisionSizeX, twoVisionSizeY);
 
  //RENDER MAZE
  //Render last row

  
  if (visionCone[0][1] == 1) {

    twoVision.image(images[5], 0, 0, twoVisionSizeX, twoVisionSizeY);
    
  }
    if (visionCone[0][3] == 1) {
    twoVision.image(images[7], 0, 0, twoVisionSizeX, twoVisionSizeY);
  }
    if (visionCone[0][2] == 1) {
    twoVision.image(images[6], 0, 0, twoVisionSizeX, twoVisionSizeY);
  }

 

  //Render mid row



  
  //We put this here so the Front block renders in front of sprite
  // Renders monster one block away - be careful that monsterSprite array and Json mapID match up
  for (let j = 1; j < 4; j++) {
    for (let i = 0; i < Monsters.length; i++) {
      k = [-100, 0, 100];
      if (visionCone[0][j] == Monsters[i].icon) {
          if (Monsters[i].isAlive === true) {
        twoVision.image(
          eyes,
          100 + k[j - 1],
          60,
          twoVisionSizeX - 205,
          twoVisionSizeX - 205
        );
      }
      }
    }
  }

  
    if (visionCone[1][1] == 1) {
    twoVision.image(images[2], 0, 0, twoVisionSizeX, twoVisionSizeY);
  }
  if (visionCone[1][3] == 1) {
    twoVision.image(images[4], 0, 0, twoVisionSizeX, twoVisionSizeY);
  }


  
    if (visionCone[1][2] == 1) {
    twoVision.image(images[3], 0, 0, twoVisionSizeX, twoVisionSizeY);
  }
  /*
  if (visionCone[1][3] == 1) {
    twoVision.image(images[9], 0, 0, twoVisionSizeX, twoVisionSizeY);
  }
  if (visionCone[1][2] == 1) {
    twoVision.image(images[10], 0, 0, twoVisionSizeX, twoVisionSizeY);
  }
*/
  //Render front row

  if (visionCone[2][1] == 1) {
    twoVision.image(images[0], 0, 0, twoVisionSizeX, twoVisionSizeY);
  }

  if (visionCone[2][3] == 1) {
    twoVision.image(images[1], 0, 0, twoVisionSizeX, twoVisionSizeY);
  }


  
  // Renders monster in front - be careful that monsterSprite array and Json mapID match up
  for (let i = 0; i < Monsters.length; i++) {
    if (visionCone[1][2] == Monsters[i].icon) {
      
        if (Monsters[i].isAlive === true) {
Monsters[i].show();
          
          
    }
    }
  }
  

 twoVision.filter(POSTERIZE, 16);
  image(twoVision, 40, 40);
  
  
}




//Classes

class itemPile { 
    constructor(x, y, icon, sprite) {
        this.x = 0;
        this.y = 0;
        this.icon = ".";
        this.sprite = "Placeholder";
    }
show(){
  PVision.push();
    PVision.noStroke();
   PVision.translate(this.y * 50, 0, this.x * 50);
    PVision.rotateY(atan2(Player.y - this.y, Player.x -this.x));
    PVision.texture(this.sprite);
    PVision.plane(50)
    PVision.pop();
}
}


class Player {
    constructor(x, y, icon, attack) {
        this.x = 0;
        this.y = 0;
        this.icon = "@";
        this.attack = 5;
        this.healthRegen = 0.2;
        this.maxHealth = 100;
        this.health = 100;
        this.manaRegen = 1;
        this.maxMana = 50;
        this.mana = 50;
        this.speed = 1;
        this.isAlive = true;
        this.myTurn = true;
    }

    //inspects index in front of player,
    inspect() {
        let inFront = [];

        if (facing === 0) {
            inFront = [this.x - 1, this.y];
        }

        if (facing === 1) {
            inFront = [this.x, this.y + 1];
        }

        if (facing === 2) {
            inFront = [this.x + 1, this.y];
        }

        if (facing === 3) {
            inFront = [this.x, this.y - 1];
        }

        return inFront;
    }

    myPos() {
        let myPosition = [this.x, this.y];
        return myPosition;
    }

    turn() {
        this.myTurn = true;
        if (this.health < this.maxHealth) {
            this.health = this.health + this.healthRegen;
        }
        //Player Mana regen
        if (this.mana < this.maxMana) {
            this.mana = this.mana + this.manaRegen;
        }
    }
}

class Monster {
    constructor(name, x, y, icon, sprite, health, vision) {
        this.name = "Placeholder";
        this.x = x;
        this.y = y;
        this.icon = "D";
        this.sprite = "Placeholder";
        this.health = 5;
        this.maxHealth = 5;
        this.energy = 0;
        this.energyGained = 2;
        this.energyRequired = 5;
        this.vision = 5;
        this.attack = 5;
        this.inCombat = false;
        this.isAlive = true;
       
    }
  
  show(){
    
    
        twoVision.image(monsterSprite[this.sprite],80, 40,twoVisionSizeX - 160, twoVisionSizeX - 160)
      
       
  }

    inspect() {
        let localCells = [];

        localCells = [
            [this.x + 1, this.y],
            [this.x, this.y + 1],
            [this.x - 1, this.y],
            [this.x, this.y - 1],
        ];

        return localCells;
    }

    calculateEnergyRequired(energyRequired, playerSpeed) {
        return Math.round(energyRequired * playerSpeed);
    }

    move() {
        const arr = aStar(
            mapNavmesh[this.x][this.y],
            mapNavmesh[Player.x][Player.y],
            mapNavmesh,
            false
        );

        if (Array.isArray(arr) && arr.length && this.vision >= arr.length) {
            //this prevents reaching player position
            if (arr.length > 1) {
                arr.pop();
            }

            if (arr.length > 1) {
                this.x = arr[1].x;
                this.y = arr[1].y;
            }
        } else {
            let surround = [];
            let r = int(random(0, 3));
            let nextCell = [];
            surround = [
                [
                    mapInstance[this.x - 1][this.y - 1],
                    mapInstance[this.x - 1][this.y],
                    mapInstance[this.x - 1][this.y + 1],
                ],
                [
                    mapInstance[this.x][this.y - 1],
                    mapInstance[this.x][this.y],
                    mapInstance[this.x][this.y + 1],
                ],
                [
                    mapInstance[this.x + 1][this.y - 1],
                    mapInstance[this.x + 1][this.y],
                    mapInstance[this.x + 1][this.y + 1],
                ],
            ];

            if (
                mapInstance[this.x + movementIndex[r][0]][
                    this.y + movementIndex[r][1]
                ] === 0
            ) {
                nextCell = [
                    [this.x + movementIndex[r][0]],
                    [this.y + movementIndex[r][1]],
                ];
                this.x = this.x + movementIndex[r][0];
                this.y = this.y + movementIndex[r][1];
            }
            return nextCell;
        }
    }

    myPos() {
        let myPosition = [this.x, this.y];
        return myPosition;
    }

    turn() {


        if (this.myTurn && this.isAlive && !this.isCombat) {

            this.move();

        }




        if (isArrayInArray(this.inspect(), Player.myPos()) && this.isAlive) {
            this.isCombat = true;
            Player.health -= this.attack;
            this.myTurn = false;
        } else {
            this.isCombat = false;
        }
    }

    getVision() {
        //Logic raycast towards a player with length of this.vision
        //if player seen, put A* to the place the player has last been seen
        //continue this loop until player is not visible, if not visible, random walk

        if (this.isAlive) {}
    }

    getPath() {
        if (this.isAlive) {
            const arr = aStar(
                mapNavmesh[this.x][this.y],
                mapNavmesh[Player.x][Player.y],
                mapNavmesh
            );

            return arr;
        }
    }
}

class Terrain {
    constructor(x, y, icon, walkable, model, texture) {
        this.x;
        this.y;
        this.icon;
        this.walkable;
        this.texture;
    }
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
            rect(90, 10, 220, 20);

            fill(255, 0, 0);
            noStroke();
            rect(90, 10, (Monsters[i].health / Monsters[i].maxHealth) * 220, 20);
            fill(0, 0, 0);
            textSize(15);
            text(Monsters[i].name, 100, 25);
        }
    }

    //Player health
    fill(255, 255, 255);
    noStroke();
    rect(40, 320, 160, -20);

    fill(255, 0, 0);
    noStroke();
    rect(40, 320, (Player.health / Player.maxHealth) * 160, -20);
    fill(0, 0, 0);

    //Player mana
    fill(255, 255, 255);
    noStroke();
    rect(40, 360, 160, -20);

    fill(0, 255, 0);
    noStroke();
    rect(40, 360, (Player.mana / Player.maxMana) * 160, -20);
    fill(0, 0, 0);

    textSize(15);
    fill(200, 200, 200);
    let orient = ["North", "East", "South", "West"];
    text(orient[facing], 220, 300);
    text("Time: " + moveCounter * 2, 280, 300);
}

//Tools
//USED TO EXTRACT LOCAL SQUARES TO NOT RENDER THE WHOLE MAP
function extractSquareChunk(arr, chunkSize, centerX, centerY) {
    const centerRow = centerY;
    const centerCol = centerX;
    const chunkHalf = Math.floor(chunkSize / 2);
    const extractedArr = [];

    for (let i = 0; i < arr.length; i++) {
        const row = [];
        for (let j = 0; j < arr[i].length; j++) {
            if (
                i >= centerRow - chunkHalf &&
                i <= centerRow + chunkHalf &&
                j >= centerCol - chunkHalf &&
                j <= centerCol + chunkHalf
            ) {
                row.push(arr[i][j]);
            } else {
                row.push(null);
            }
        }
        extractedArr.push(row);
    }

    return extractedArr;
}

function playerLook() {
    function getValue(x, y) {
        // Check if x and y are within bounds
        if (x >= 0 && y >= 0 && x < mapInstance.length && y < mapInstance[0].length) {
            return mapInstance[x][y] !== undefined ? mapInstance[x][y] : 1;
        }
        return 1; // Out-of-bounds indices
    }

    function populateVisionCone() {
        // Update visionCone with values, replacing undefined with 1
        for (let i = 0; i < visionCone.length; i++) {
            for (let j = 0; j < visionCone[i].length; j++) {
                if (visionCone[i][j] === undefined) {
                    visionCone[i][j] = 1;
                }
            }
        }
    }

    if (facing == 0) {
        // NORTH
        visionCone = [
            [
                getValue(Player.x - 2, Player.y - 2),
                getValue(Player.x - 2, Player.y - 1),
                getValue(Player.x - 2, Player.y),
                getValue(Player.x - 2, Player.y + 1),
                getValue(Player.x - 2, Player.y + 2),
            ],
            [
                getValue(Player.x - 1, Player.y - 2),
                getValue(Player.x - 1, Player.y - 1),
                getValue(Player.x - 1, Player.y),
                getValue(Player.x - 1, Player.y + 1),
                getValue(Player.x - 1, Player.y + 2),
            ],
            [
                getValue(Player.x, Player.y - 2),
                getValue(Player.x, Player.y - 1),
                getValue(Player.x, Player.y),
                getValue(Player.x, Player.y + 1),
                getValue(Player.x, Player.y + 2),
            ],
        ];
    } else if (facing == 1) {
        // EAST
        visionCone = [
            [
                getValue(Player.x - 2, Player.y + 2),
                getValue(Player.x - 1, Player.y + 2),
                getValue(Player.x, Player.y + 2),
                getValue(Player.x + 1, Player.y + 2),
                getValue(Player.x + 2, Player.y + 2),
            ],
            [
                getValue(Player.x - 2, Player.y + 1),
                getValue(Player.x - 1, Player.y + 1),
                getValue(Player.x, Player.y + 1),
                getValue(Player.x + 1, Player.y + 1),
                getValue(Player.x + 2, Player.y + 1),
            ],
            [
                getValue(Player.x - 2, Player.y),
                getValue(Player.x - 1, Player.y),
                getValue(Player.x, Player.y),
                getValue(Player.x + 1, Player.y),
                getValue(Player.x + 2, Player.y),
            ],
        ];
    } else if (facing == 2) {
        // SOUTH
        visionCone = [
            [
                getValue(Player.x + 2, Player.y + 2),
                getValue(Player.x + 2, Player.y + 1),
                getValue(Player.x + 2, Player.y),
                getValue(Player.x + 2, Player.y - 1),
                getValue(Player.x + 2, Player.y - 2),
            ],
            [
                getValue(Player.x + 1, Player.y + 2),
                getValue(Player.x + 1, Player.y + 1),
                getValue(Player.x + 1, Player.y),
                getValue(Player.x + 1, Player.y - 1),
                getValue(Player.x + 1, Player.y - 2),
            ],
            [
                getValue(Player.x, Player.y + 2),
                getValue(Player.x, Player.y + 1),
                getValue(Player.x, Player.y),
                getValue(Player.x, Player.y - 1),
                getValue(Player.x, Player.y - 2),
            ],
        ];
    } else if (facing == 3) {
        // WEST
        visionCone = [
            [
                getValue(Player.x + 2, Player.y - 2),
                getValue(Player.x + 1, Player.y - 2),
                getValue(Player.x, Player.y - 2),
                getValue(Player.x - 1, Player.y - 2),
                getValue(Player.x - 2, Player.y - 2),
            ],
            [
                getValue(Player.x + 2, Player.y - 1),
                getValue(Player.x + 1, Player.y - 1),
                getValue(Player.x, Player.y - 1),
                getValue(Player.x - 1, Player.y - 1),
                getValue(Player.x - 2, Player.y - 1),
            ],
            [
                getValue(Player.x + 2, Player.y),
                getValue(Player.x + 1, Player.y),
                getValue(Player.x, Player.y),
                getValue(Player.x - 1, Player.y),
                getValue(Player.x - 2, Player.y),
            ],
        ];
    }
    
    // Ensure visionCone has no undefined values
    populateVisionCone();
}


function findIndex(stringArr, keyString) {
    let result = [-1, -1];

    for (let i = 0; i < stringArr.length; i++) {
        for (let j = 0; j < stringArr[i].length; j++) {
            if (stringArr[i][j] == keyString) {
                result[0] = i;
                result[1] = j;

                return result;
            }
        }
    }
    return result;
}

const calculateCount = (arr, query) => {
    let count = 0;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === query) {
            count++;
            continue;
        }
        if (Array.isArray(arr[i])) {
            count += calculateCount(arr[i], query);
        }
    }
    return count;
};

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function isArrayInArray(arr, item) {
    var item_as_string = JSON.stringify(item);

    var contains = arr.some(function(ele) {
        return JSON.stringify(ele) === item_as_string;
    });
    return contains;
}

// Check if an element in a given 2D array is undefined
function isUndefined(arr, index1, index2) {
    return arr[index1] === undefined || arr[index1][index2] === undefined;
}

// Check if an element in a 2D array is a corner
function isCorner(arr, item, x, y) {
    if (isUndefined(arr, x + 1, y + 1) || isUndefined(arr, x - 1, y - 1)) {
        return false;
    }

    if (
        arr[x - 1][y] === item &&
        arr[x][y + 1] === item &&
        arr[x + 1][y] !== item &&
        arr[x][y - 1] !== item
    ) {
        return "LowerLeft";
    }

    if (
        arr[x][y + 1] === item &&
        arr[x + 1][y] === item &&
        arr[x][y - 1] !== item &&
        arr[x - 1][y] !== item
    ) {
        return "UpperLeft";
    }

    if (
        arr[x - 1][y] === item &&
        arr[x][y - 1] === item &&
        arr[x + 1][y] !== item &&
        arr[x][y + 1] !== item
    ) {
        return "LowerRight";
    }

    if (
        arr[x + 1][y] === item &&
        arr[x][y - 1] === item &&
        arr[x - 1][y] !== item &&
        arr[x][y + 1] !== item
    ) {
        return "UpperRight";
    }

    return false;
}

// Check if an element in a 2D array is a wall
function isWall(arr, item, x, y) {
    if (isUndefined(arr, x + 1, y + 1) || isUndefined(arr, x - 1, y - 1)) {
        return false;
    }

    if (arr[x][y - 1] === item && arr[x][y + 1] === item) {
        return "Horizontal";
    }

    if (arr[x - 1][y] === item && arr[x + 1][y] === item) {
        return "Vertical";
    }

    return false;
}

//A* SHIT
class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.gCost = Infinity; // The cost of getting from the start node to this node
        this.parent = null; // The parent node, used to reconstruct the path
        this.isPassable = true; // Whether this node is passable or not
    }
}

function aStar(startNode, endNode, grid, ignorePassable, diagonal = false) {
    const openList = [startNode];
    const closedList = [];

    startNode.gCost = 0;
    startNode.fCost = startNode.gCost + heuristic(startNode, endNode);

    while (openList.length > 0) {
        // Find the node with the lowest fCost in the openList
        const currentNode = openList.reduce((nodeA, nodeB) =>
            nodeA.fCost < nodeB.fCost ? nodeA : nodeB
        );

        // If the currentNode is the endNode, we've found the shortest path
        if (currentNode === endNode) {
            return reconstructPath(startNode, endNode);
        }

        // Remove currentNode from the openList and add it to the closedList
        openList.splice(openList.indexOf(currentNode), 1);
        closedList.push(currentNode);

        // Find all the neighbor nodes of the currentNode
        const neighbors = getNeighbors(currentNode, grid, ignorePassable, diagonal);

        for (const neighbor of neighbors) {
            if (closedList.includes(neighbor)) {
                continue; // Ignore already evaluated nodes
            }

            if (!ignorePassable && neighbor.isWall) {
                continue; // Ignore walls if not ignoring passable nodes
            }

            const tentativeGCost =
                currentNode.gCost + distance(currentNode, neighbor);

            if (!openList.includes(neighbor)) {
                // Add neighbor to the openList if it hasn't been evaluated yet
                openList.push(neighbor);
            } else if (tentativeGCost >= neighbor.gCost) {
                continue; // This path is worse than the previously found one
            }

            // This path is the best one so far
            neighbor.parent = currentNode;
            neighbor.gCost = tentativeGCost;
            neighbor.fCost = neighbor.gCost + heuristic(neighbor, endNode);
        }
    }

    // If we've exhausted all nodes and haven't found the endNode, return null
    return null;
}

function getNeighbors(node, grid, ignorePassable = false, diagonal = false) {
    const neighbors = [];
    const {
        x,
        y
    } = node;

    // Add neighbors to the left, right, up, and down of the current node
    if (x > 0 && (ignorePassable || grid[x - 1][y].isPassable)) {
        neighbors.push(grid[x - 1][y]);
    }
    if (x < grid.length - 1 && (ignorePassable || grid[x + 1][y].isPassable)) {
        neighbors.push(grid[x + 1][y]);
    }
    if (y > 0 && (ignorePassable || grid[x][y - 1].isPassable)) {
        neighbors.push(grid[x][y - 1]);
    }
    if (y < grid[0].length - 1 && (ignorePassable || grid[x][y + 1].isPassable)) {
        neighbors.push(grid[x][y + 1]);
    }

    // If diagonal pathfinding is enabled, add diagonal neighbors
    if (diagonal) {
        if (x > 0 && y > 0 && (ignorePassable || grid[x - 1][y - 1].isPassable)) {
            neighbors.push(grid[x - 1][y - 1]);
        }
        if (
            x > 0 &&
            y < grid[0].length - 1 &&
            (ignorePassable || grid[x - 1][y + 1].isPassable)
        ) {
            neighbors.push(grid[x - 1][y + 1]);
        }
        if (
            x < grid.length - 1 &&
            y > 0 &&
            (ignorePassable || grid[x + 1][y - 1].isPassable)
        ) {
            neighbors.push(grid[x + 1][y - 1]);
        }
        if (
            x < grid.length - 1 &&
            y < grid[0].length - 1 &&
            (ignorePassable || grid[x + 1][y + 1].isPassable)
        ) {
            neighbors.push(grid[x + 1][y + 1]);
        }
    }

    return neighbors;
}

function distance(nodeA, nodeB) {
    // Return the Euclidean distance between nodeA and nodeB
    const dx = nodeA.x - nodeB.x;
    const dy = nodeA.y - nodeB.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function heuristic(nodeA, nodeB) {
    // Return the Euclidean distance between nodeA and nodeB
    return distance(nodeA, nodeB);
}

function reconstructPath(startNode, endNode) {
    // Reconstruct the shortest path from the endNode to the startNode
    const path = [endNode];
    let currentNode = endNode;

    while (currentNode !== startNode) {
        currentNode = currentNode.parent;
        path.unshift(currentNode);
    }

    return path;
}