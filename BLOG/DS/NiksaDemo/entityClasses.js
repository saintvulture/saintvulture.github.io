//Classes

class item {
  constructor(x, y, icon, sprite) {
    this.x = 0;
    this.y = 0;
    this.icon = ".";
    this.sprite = "Placeholder";
  }
  show() {

  }
}

class Player {
  constructor(x, y, icon, attack) {
    this.x = 0;
    this.y = 0;
    this.icon = "@";
    this.attack = 5;
    this.healthRegen = 0.0;
    this.maxHealth = 100;
    this.health = 100;
    this.manaRegen = 2;
    this.maxMana = 50;
    this.mana = 50;

    this.maxHunger = 100;
    this.baseHunger = 0.5;
    this.hungerMod = 0;
    this.hunger = 100;

    this.speed = 1;
    this.isAlive = true;
    this.myTurn = true;

    this.level = 1;
    this.XP = 0;

    this.baseArmor = 0.1; //apply armor increases here
    this.armorMod = 0; //apply armor mods here
    this.armorRating = this.baseArmor + this.armorMod; //final armorr calculation

    this.damageReduction = 1;
    this.damageReductionMod = 0;

    this.isSneaking = false;
    this.visibility = 1;
    this.isCombat = false;

    this.levelArraySelect = 0;
    this.levelArray = [15, 45, 135, 405];
  }
  
  
    clampStats() {
    if (this.health < 0) {
      this.health = 0;
    }
    if (this.mana < 0) {
      this.mana = 0;
    }
        if (this.hunger < 0) {
      this.mana = 0;
    }
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

  inspectMonster() {
    for (let i = 0; i < Monsters.length; i++) {
      if (
        arraysEqual(this.inspect(), Monsters[i].myPos()) &&
        Monsters[i].isAlive
      ) {
        return Monsters[i];
      }
    }
    return null;
  }

  Attack() {
    if (this.inspectMonster() !== null) {
      console.log("Attack!");
      if (this.inspectMonster().isAlive) {
        if (this.mana >= 0 + 10) {
          this.inspectMonster().health =
            this.inspectMonster().health - this.attack;
          this.mana = this.mana - 5;
        }
      }
      if (this.inspectMonster().health <= 0) {
        this.XP = this.XP + this.inspectMonster().XP;
        this.inspectMonster().isAlive = false;

      }
    } else {
      console.log("No one here...");
    }
  }

  myPos() {
    let myPosition = [this.x, this.y];
    return myPosition;
  }

  turn() {
    this.myTurn = true;
    


  let newLevel = this.level; // Store the current level initially

    for (let i = 0; i < this.levelArray.length; i++) {
      // If XP is greater than or equal to the current threshold, calculate the new level
      if (this.XP >= this.levelArray[i]) {
        newLevel = i + 2; // Determine the new level based on XP thresholds
      }
    }

    // Check if level has increased
    if (newLevel > this.level) {
      this.level = newLevel; // Update the level
    //  this.levelUp();        // Call the level-up function when level changes
    }

   // this.hunger = this.hunger - 0.2;

    if(20 >= this.mana && this.isSneaking === true)
      {
        this.isSneaking = !this.isSneaking
      }
    
    if (this.isSneaking) {
      this.visibility = 0.5;
      this.mana = this.mana -2
    } else {
      this.visibility = 1;
      
    }

    if (this.hunger >= this.maxHunger * this.baseHunger) {
      if (this.health < this.maxHealth && !this.isCombat) {
        this.health = this.health + this.healthRegen;
      }
      //Player Mana regen
      if (this.mana < this.maxMana && !this.isCombat && !this.isSneaking) {
        this.mana = this.mana + this.manaRegen;
      }
    }
    
     this.clampStats(); 
  }
  
  levelUp() {
    let perkArr = [1,2,3,4,5,6,7,8]
    let randomIndex = Math.floor(Math.random() * perkArr.length);
    let randomNumber = perkArr[randomIndex];
    gainPerk(randomIndex)
    
    perkArr.splice(randomIndex, 1);
    console.log("Level up! Current level: " + this.level);
    // Add any additional logic for what should happen when leveling up
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
    this.visionMod = 5;
    this.attack = 5;
    this.inCombat = false;
    this.isAlive = true;
    this.XP = 0;
    
    
    
    this.imageX = 100;
    this.imageY = 60;
    this.imageWidth = 160; // assuming square images
    this.imageHeight = 160;
  }

  show() {

    firstPersonView.image(monsterSprite[this.sprite],80,40,firstPersonViewSizeX - 160,firstPersonViewSizeX - 160);
    
       if (this.isMouseOver()) {
      // Perform any action when the mouse is over the monster
      console.log("hello, I am " + this.name)
    }
  }
  
   isMouseOver() {
    // Check if the mouse is inside the image boundaries
    return (
      mouseX > this.imageX &&
      mouseX < this.imageX + this.imageWidth &&
      mouseY > this.imageY &&
      mouseY < this.imageY + this.imageHeight
    );
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
      Player.isCombat = true;
      this.isCombat = true;
      //Player.health -= this.attack * ((1 - Player.armorRating) * Player.damageReduction);

Player.health = Player.health - this.attack
      this.myTurn = false;
    } else {
      this.isCombat = false;
      Player.isCombat = false;
    }
  }

  getVision() {
    //Logic raycast towards a player with length of this.vision
    //if player seen, put A* to the place the player has last been seen
    //continue this loop until player is not visible, if not visible, random walk

    if (this.isAlive) {
    }
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
