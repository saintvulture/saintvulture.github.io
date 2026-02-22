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
        this.healthRegen = 0.5;
        this.maxHealth = 100;
        this.health = 100;
        this.manaRegen = 2;
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
    
    
        firstPersonView.image(monsterSprite[this.sprite],80, 40,firstPersonViewSizeX - 160, firstPersonViewSizeX - 160)
      
       
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
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.icon = "icon";
        this.walkable = true;
        this.style = "string"; //Extract this from a JSON  above the map
      this.type = "string"; //Determined by the symbol. For instance door should be consistently "/" across all maps
      this.variation = 0; //For different tile variations, possibly determined by some random seed?
    }
  
  
}


