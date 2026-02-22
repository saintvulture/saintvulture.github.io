
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

    this.outClasses = [];

    this.outNums = [];

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
        this.num = perks.entry[i].num;
      }
    }

    for (let i = 0; i < perks.entry.length; i++) {
      if (perks.entry[i].ID === this.ID) {
        this.class = perks.entry[i].class;
      }
    }

    this.offsetX = 0;
    this.offsetY = 0;

    this.outNodePos = [];

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

  connector(posX, posY, endPosX, endPosY) {
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

        let inputCircleX = this.posX + this.boxScaleX / 2;
        let inputCircleY = this.posY;

        for (let i = 0; i < nodeInstances.length; i++) {
          //for loop to find any activation of isNodeSelected
          if (
            dist(inputCircleX, inputCircleY, mouseX, mouseY) <= 20 &&
            nodeInstances[i].isNodeSelected === true
          ) {
            skillTreeUI.ellipse(inputCircleX, inputCircleY, 40, 2 + 40); //inbound circle large
          } else {
            skillTreeUI.ellipse(inputCircleX, inputCircleY, 20, 20); //inbound circle small
          }
        }

        //////

        skillTreeUI.rect(this.posX, this.posY, this.boxScaleX, this.boxScaleY); // overall Box
        skillTreeUI.rect(this.posX, this.posY, this.boxScaleX, 20); // name part box

        for (let i = 0; i < this.outNodes; i++) {
          for (let j = 0; j < nodeInstances.length; j++) {
            //loop through nodeInstances to find input connector

            // outbound circles
            let circleX =
              this.posX +
              i * (this.boxScaleX / this.outNodes) +
              this.boxScaleX / this.outNodes / 2;
            let circleY = this.posY + this.boxScaleY + 40;

            let nodeMatch = false;

            this.outNodePos[i] = [circleX, circleY];

            // connector handling
            if (this.outBool[i] === true) {
              this.connector(circleX, circleY, mouseX, mouseY);
              this.isNodeSelected = true;

              if (
                nodeInstances[j].class ===
                this.outClasses[findTrueIndex(this.outBool)]
              ) {
                nodeMatch = true;
              }
            }

            //Transfer Data here, edit connect conditions

            if (
              dist(
                nodeInstances[j].posX + this.boxScaleX / 2,
                nodeInstances[j].posY,
                mouseX,
                mouseY
              ) <= 20 &&
              this.isNodeSelected === true &&
              nodeMatch === true &&
              !nodeInstances[j].calculationsDone
            ) {
              console.log(
                "I, " +
                  this.ID +
                  " am approaching input node for " +
                  nodeInstances[j].ID +
                  " from outbound node " +
                  findTrueIndex(this.outBool) +
                  " that belongs to " +
                  this.ID
              );

              nodeInstances[j].inputNodeID = this.ID;
              nodeInstances[j].inputNodeIndex = findTrueIndex(this.outBool);

              nodeInstances[j].isConnected = true;

              //Do new perk calculations here

              nodeInstances[j].num =
                this.outNums[findTrueIndex(this.outBool)] +
                nodeInstances[j].num;
              nodeInstances[j].calculationsDone = true;
            }

            if (
              nodeInstances[j].isConnected === true &&
              nodeInstances[j].inputNodeID === this.ID
            ) {
              this.connector(
                this.outNodePos[nodeInstances[j].inputNodeIndex][0],
                this.outNodePos[nodeInstances[j].inputNodeIndex][1],
                nodeInstances[j].posX + this.boxScaleX / 2,
                nodeInstances[j].posY
              );
            }

            if (
              dist(circleX, circleY, mouseX, mouseY) <= 20 &&
              isMousePressed
            ) {
              skillTreeUI.ellipse(circleX, circleY, 40, 40); //"highlights" the circle the mouse is near

              this.outBool[i] = true;
              this.outNodeIndex = findTrueIndex(this.outBool);

              //console.log(findTrueIndex(this.outBool))
              // console.log("I pressed outbound Node " + i + " that belongs to " + this.ID + " which is Node number " + this.returnPositionInArray(nodeInstances) );
              // console.log(this.outBool); // with this.outBool we get which out node is active. rolling through this.ID with this.outBool we can figure which data needs to be forwarded to this.input
            } else {
              skillTreeUI.ellipse(circleX, circleY, 20, 20);
              this.outNodeIndex = -1;
              // Set outBool to false when mouse is not pressed
              if (!isMousePressed) {
                this.outBool[i] = false;
                this.isNodeSelected = false;
              }
            }
          }

          skillTreeUI.rect(
            this.posX + i * (this.boxScaleX / this.outNodes),
            this.boxScaleY + this.posY,
            this.boxScaleX / this.outNodes,
            40
          );
        }

        // Skill name
        skillTreeUI.text(
          perks.entry[i].skill + ": " + perks.entry[i].perkName,
          this.posX + 5,
          this.posY + 5,
          this.boxScaleX - 5,
          this.boxScaleY - 5
        );

        // Skill Text, we use a replacer to indicate the variable num

        skillTreeUI.text(
          perks.entry[i].text.replace("{{num}}", this.num),
          this.posX + 5,
          this.posY + 25,
          this.boxScaleX - 5,
          this.boxScaleY - 5
        );

        // OUTBOUND NODES
        // Modifier Text

        for (let j = 0; j < this.outNodes; j++) {
          skillTreeUI.text(
            perks.entry[i].outBoundNode[j].outEffect,
            this.posX + 5 + j * (this.boxScaleX / this.outNodes),
            this.posY + this.boxScaleY + 5,
            this.boxScaleX - 5,
            this.boxScaleY - 5
          );

          skillTreeUI.text(
            perks.entry[i].outBoundNode[j].outClass,
            this.posX + 5 + j * (this.boxScaleX / this.outNodes),
            this.posY + 15 + this.boxScaleY + 5,
            this.boxScaleX - 5,
            this.boxScaleY - 5
          );
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
