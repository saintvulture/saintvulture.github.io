let visionCone = [];

let visionConeTerrain = [];

let gsize = 10;

let mVisionSize = 90;

//Rendering
//this doesnt just render but manages monsters and updates their position
function RenderMap() {
  
  
  //rendering
  
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
                mVision.noStroke()
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
              
              mVision.rect(i * gsize - (Player.y * gsize - mVisionSize / 2),
                    j * gsize - (Player.x * gsize - mVisionSize / 2)-15, 15, 15)
                
              mVision.text(
                    "#",
                    i * gsize - (Player.y * gsize - mVisionSize / 2),
                    j * gsize - (Player.x * gsize - mVisionSize / 2)
                );
            }
            if (mapInstance[j][i] === 0) {
                mVision.textSize(gsize);
                mVision.fill(150, 150, 150);
             mVision.rect(i * gsize - (Player.y * gsize - mVisionSize / 2),
                    j * gsize - (Player.x * gsize - mVisionSize / 2)-15, 15, 15)  
              
              mVision.text(
                    ".",
                    i * gsize - (Player.y * gsize - mVisionSize / 2),
                    j * gsize - (Player.x * gsize - mVisionSize / 2)
                );
            }

            if (mapInstance[j][i] === "F") {
                mVision.textSize(gsize);
                mVision.fill(150, 150, 150);
              mVision.rect(i * gsize - (Player.y * gsize - mVisionSize / 2),
                    j * gsize - (Player.x * gsize - mVisionSize / 2)-15, 15, 15)
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
              mVision.rect(i * gsize - (Player.y * gsize - mVisionSize / 2),
                    j * gsize - (Player.x * gsize - mVisionSize / 2)-15, 15, 15)
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
                  mVision.rect(i * gsize - (Player.y * gsize - mVisionSize / 2),
                    j * gsize - (Player.x * gsize - mVisionSize / 2)-15, 15, 15)
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






//Generateimage from vision cone
function Render2D() {

  firstPersonView.background(255);
 firstPersonView.image(BG, facing * -320, -100, 320 * 4, 320); //pans background across
  
  firstPersonView.image(floorTex, 0, 0, firstPersonViewSizeX, firstPersonViewSizeY);
   firstPersonView.image(roofTex, 0, 0, firstPersonViewSizeX, firstPersonViewSizeY);
 
  //RENDER MAZE
  //Render last row

  //images[variation][imgNumber]

  if (visionConeTerrain[0][1].icon == 1) {

    firstPersonView.image(images  [visionConeTerrain[0][1].variation][5], 0, 0, firstPersonViewSizeX, firstPersonViewSizeY);
    
  }
    if (visionConeTerrain[0][3].icon == 1) {
    firstPersonView.image(images  [visionConeTerrain[0][3].variation][7], 0, 0, firstPersonViewSizeX, firstPersonViewSizeY);
  }
    if (visionConeTerrain[0][2].icon == 1) {
    firstPersonView.image(images  [visionConeTerrain[0][2].variation][6], 0, 0, firstPersonViewSizeX, firstPersonViewSizeY);
  }

 

  //Render mid row



  
  //We put this here so the Front block renders in front of sprite
  // Renders monster one block away - be careful that monsterSprite array and Json mapID match up
  for (let j = 1; j < 4; j++) {
    for (let i = 0; i < Monsters.length; i++) {
      k = [-100, 0, 100];
      if (visionCone[0][j] == Monsters[i].icon) {
          if (Monsters[i].isAlive === true) {
        firstPersonView.image(
          eyes,
          100 + k[j - 1],
          60,
          firstPersonViewSizeX - 205,
          firstPersonViewSizeX - 205
        );
      }
      }
    }
  }

  
    if (visionConeTerrain[1][1].icon == 1) {
    firstPersonView.image(images  [visionConeTerrain[1][1].variation][2], 0, 0, firstPersonViewSizeX, firstPersonViewSizeY);
  }
  if (visionConeTerrain[1][3].icon == 1) {
    firstPersonView.image(images  [visionConeTerrain[1][3].variation][4], 0, 0, firstPersonViewSizeX, firstPersonViewSizeY);
  }


  
    if (visionConeTerrain[1][2].icon == 1) {
    firstPersonView.image(images  [visionConeTerrain[1][2].variation][3], 0, 0, firstPersonViewSizeX, firstPersonViewSizeY);
  }
  /*
  if (visionCone[1][3] == 1) {
    firstPersonView.image(images[9], 0, 0, firstPersonViewSizeX, firstPersonViewSizeY);
  }
  if (visionCone[1][2] == 1) {
    firstPersonView.image(images[10], 0, 0, firstPersonViewSizeX, firstPersonViewSizeY);
  }
*/
  //Render front row

  if (visionConeTerrain[2][1].icon == 1) {
    firstPersonView.image(images  [visionConeTerrain[2][1].variation][0], 0, 0, firstPersonViewSizeX, firstPersonViewSizeY);
  }

  if (visionConeTerrain[2][3].icon == 1) {
    firstPersonView.image(images  [visionConeTerrain[2][3].variation][1], 0, 0, firstPersonViewSizeX, firstPersonViewSizeY);
  }


  
  // Renders monster in front - be careful that monsterSprite array and Json mapID match up
  for (let i = 0; i < Monsters.length; i++) {
    if (visionCone[1][2] == Monsters[i].icon) {
      
        if (Monsters[i].isAlive === true) {
Monsters[i].show();
          
          
    }
    }
  }
  

  //image(firstPersonView, 40, 40);
  
  
}



function playerLook() { //Replace instead of populating the vision cone array with values, populate with classes of Terrain // scrratch that, we use the vision to see monsters too, crossreference the position of what player is looking at with terrain array data
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

  
function getTerrain(x,y)
  {
            // Check if x and y are within bounds
        if (x >= 0 && y >= 0 && x < terrain.length && y < terrain[0].length) {
            return terrain[x][y] !== undefined ? terrain[x][y] : 1;
        }
        return 1; // Out-of-bounds indices
  }

  
  
  
      if (facing == 0) {
        // NORTH
        visionConeTerrain = [
            [
       
              visionConeTerrain[0] = getTerrain(Player.x-2,Player.y-2),
                visionConeTerrain[1] = getTerrain(Player.x-2,Player.y-1),
                visionConeTerrain[2] = getTerrain(Player.x-2,Player.y),
                visionConeTerrain[3] = getTerrain(Player.x-2,Player.y+1),
                visionConeTerrain[4] = getTerrain(Player.x-2,Player.y+2),

            ],
            [
              
              visionConeTerrain[0] = getTerrain(Player.x-1,Player.y-2),
                visionConeTerrain[1] = getTerrain(Player.x-1,Player.y-1),
                visionConeTerrain[2] = getTerrain(Player.x-1,Player.y),
                visionConeTerrain[3] = getTerrain(Player.x-1,Player.y+1),
                visionConeTerrain[4] = getTerrain(Player.x-1,Player.y+2),
            ],
            [
               
              visionConeTerrain[0] = getTerrain(Player.x,Player.y-2),
                visionConeTerrain[1] = getTerrain(Player.x,Player.y-1),
                visionConeTerrain[2] = getTerrain(Player.x,Player.y),
                visionConeTerrain[3] = getTerrain(Player.x,Player.y+1),
                visionConeTerrain[4] = getTerrain(Player.x,Player.y+2),
            ],
        ];
    }  else if (facing == 1) {
        // EAST
        visionConeTerrain = [
            [
               visionConeTerrain[0] = getTerrain(Player.x - 2, Player.y + 2),
                 visionConeTerrain[1] = getTerrain(Player.x - 1, Player.y + 2),
                 visionConeTerrain[2] = getTerrain(Player.x, Player.y + 2),
                 visionConeTerrain[3] = getTerrain(Player.x + 1, Player.y + 2),
                 visionConeTerrain[4] = getTerrain(Player.x + 2, Player.y + 2),
            ],
            [
                 visionConeTerrain[0] = getTerrain(Player.x - 2, Player.y + 1),
                 visionConeTerrain[1] = getTerrain(Player.x - 1, Player.y + 1),
                 visionConeTerrain[2] = getTerrain(Player.x, Player.y + 1),
                 visionConeTerrain[3] = getTerrain(Player.x + 1, Player.y + 1),
                 visionConeTerrain[4] = getTerrain(Player.x + 2, Player.y + 1),
            ],
            [
                 visionConeTerrain[0] = getTerrain(Player.x - 2, Player.y),
                 visionConeTerrain[1] = getTerrain(Player.x - 1, Player.y),
                 visionConeTerrain[2] = getTerrain(Player.x, Player.y),
                 visionConeTerrain[3] = getTerrain(Player.x + 1, Player.y),
                 visionConeTerrain[4] = getTerrain(Player.x + 2, Player.y),
            ],
        ];
    } else if (facing == 2) {
        // SOUTH
        visionConeTerrain = [
            [
                 visionConeTerrain[0] = getTerrain(Player.x + 2, Player.y + 2),
                 visionConeTerrain[1] = getTerrain(Player.x + 2, Player.y + 1),
                 visionConeTerrain[2] = getTerrain(Player.x + 2, Player.y),
                 visionConeTerrain[3] = getTerrain(Player.x + 2, Player.y - 1),
                 visionConeTerrain[4] = getTerrain(Player.x + 2, Player.y - 2),
            ],
            [
                 visionConeTerrain[0] = getTerrain(Player.x + 1, Player.y + 2),
                 visionConeTerrain[1] = getTerrain(Player.x + 1, Player.y + 1),
                 visionConeTerrain[2] = getTerrain(Player.x + 1, Player.y),
                 visionConeTerrain[3] = getTerrain(Player.x + 1, Player.y - 1),
                 visionConeTerrain[4] = getTerrain(Player.x + 1, Player.y - 2),
            ],
            [
                 visionConeTerrain[0] = getTerrain(Player.x, Player.y + 2),
                 visionConeTerrain[1] = getTerrain(Player.x, Player.y + 1),
                 visionConeTerrain[2] = getTerrain(Player.x, Player.y),
                 visionConeTerrain[3] = getTerrain(Player.x, Player.y - 1),
                 visionConeTerrain[4] = getTerrain(Player.x, Player.y - 2),
            ],
        ];
    } else if (facing == 3) {
        // WEST
        visionConeTerrain = [
            [
                 visionConeTerrain[0] = getTerrain(Player.x + 2, Player.y - 2),
                 visionConeTerrain[1] = getTerrain(Player.x + 1, Player.y - 2),
                 visionConeTerrain[2] = getTerrain(Player.x, Player.y - 2),
                 visionConeTerrain[3] = getTerrain(Player.x - 1, Player.y - 2),
                 visionConeTerrain[4] = getTerrain(Player.x - 2, Player.y - 2),
            ],
            [
                 visionConeTerrain[0] = getTerrain(Player.x + 2, Player.y - 1),
                 visionConeTerrain[1] = getTerrain(Player.x + 1, Player.y - 1),
                 visionConeTerrain[2] = getTerrain(Player.x, Player.y - 1),
                 visionConeTerrain[3] = getTerrain(Player.x - 1, Player.y - 1),
                 visionConeTerrain[4] = getTerrain(Player.x - 2, Player.y - 1),
            ],
            [
                 visionConeTerrain[0] = getTerrain(Player.x + 2, Player.y),
                 visionConeTerrain[1] = getTerrain(Player.x + 1, Player.y),
                 visionConeTerrain[2] = getTerrain(Player.x, Player.y),
                 visionConeTerrain[3] = getTerrain(Player.x - 1, Player.y),
                 visionConeTerrain[4] = getTerrain(Player.x - 2, Player.y),
            ],
        ];
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

