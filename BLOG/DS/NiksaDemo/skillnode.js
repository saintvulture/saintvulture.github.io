let scaleFactor = 1; // Example scaling factor
let canvasOffsetX = 20; // Example image offset in X direction (related to image(skillTreeUI, 200, 0))
let canvasOffsetY = 20;
let offsetX = 0; // Example translation in X direction
let offsetY = 0; // Example translation in Y direction

let scaleMod = 0.2;


function skillTree() {
    // Apply the transformations to the UI
    skillTreeUI.push(); // Save the current state of the canvas
    skillTreeUI.translate(offsetX, offsetY); // Apply translation
    skillTreeUI.scale(scaleFactor); // Apply scaling

    skillTreeUI.background(125);

    for (let i = 0; i < nodeInstances.length; i++) {
        nodeInstances[i].skillNodeDraw();
    }

    skillTreeUI.pop(); // Restore the canvas state (remove transformations)

    // Draw the skill tree UI onto the main canvas with transformations
    image(skillTreeUI, canvasOffsetX, canvasOffsetY);
}


playerIsHandlingNode = false;
class skillNode {
    constructor(ID, posX, posY) {
        this.ID = ID;
        this.posX = posX;
        this.posY = posY;

        this.outClasses = [];


        for (let i = 0; i < perks.entry.length; i++) {
            if (perks.entry[i].ID === this.ID) {
              
               this.inBool = new Array(perks.entry[i].inBoundNode)
                    .fill(false);
               this.outBool = new Array(perks.entry[i].outBoundNode)
                    .fill(false);
              
                this.num = perks.entry[i].num;
               this.inNodes = perks.entry[i].inBoundNode;  
              this.outNodes = perks.entry[i].outBoundNode;
      
            }
        }

        this.offsetX = 0;
        this.offsetY = 0;

       this.inNodePos = [];
        this.outNodePos = [];

        this.inputNodeID = 0;
        this.inputNodeIndex = 0;

        this.isNodeSelected = false;
        this.isNodeDragged = false;
        this.boxScaleX = 120;
        this.boxScaleY = 160;
        this.isConnected = false;
     
        this.inConnectedTo = new Array(this.inNodes).fill(null);
      this.outConnectedTo = []
        this.outNodeIndex = -1;

      this.enableSignalThrough = true;
      
        this.isMouseOverNode = false;
        nodeInstances.push(this);
      

      
      this.isActive = false
      
      
    }


    getRelativeMouseX() {
        return (mouseX - canvasOffsetX) / scaleFactor;
    }

    getRelativeMouseY() {
        return (mouseY - canvasOffsetY) / scaleFactor;
    }

    isMouseOver() {
        let relMouseX = this.getRelativeMouseX();
        let relMouseY = this.getRelativeMouseY();

        return (
            relMouseX > this.posX &&
            relMouseX < this.posX + this.boxScaleX &&
            relMouseY > this.posY &&
            relMouseY < this.posY + this.boxScaleY - 20

        );
    }

  
  
    isMouseOverNodes() {
        let relMouseX = this.getRelativeMouseX();
        let relMouseY = this.getRelativeMouseY();

        return (
            relMouseX > this.posX &&
            relMouseX < this.posX + this.boxScaleX &&
            relMouseY > this.posY +40 &&
            relMouseY < this.posY + this.boxScaleY + 40

        );
    }
  
    mousePressed() {
        if (this.isMouseOver()) {
            let relMouseX = this.getRelativeMouseX();
            let relMouseY = this.getRelativeMouseY();

            this.offsetX = this.posX - relMouseX;
            this.offsetY = this.posY - relMouseY;
            this.isNodeDragged = true;
        } else {
            this.isNodeDragged = false;
        }
    }

    mouseDragged() {
        if (this.isNodeDragged) {
            let relMouseX = this.getRelativeMouseX();
            let relMouseY = this.getRelativeMouseY();

            this.posX = relMouseX + this.offsetX;
            this.posY = relMouseY + this.offsetY;
        }
    }

    mouseReleased() {
        this.isNodeDragged = false;
    }

    connector(posX, posY, endPosX, endPosY) {
       // skillTreeUI.line(posX, posY, endPosX, endPosY);
     //skillTreeUI.noFill();
      skillTreeUI.push()
      skillTreeUI.noFill();
      skillTreeUI.bezier(posX, posY, posX, endPosY, endPosX, posY, endPosX, endPosY);
      skillTreeUI.pop()
      
      
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

    checkConnections() {
        this.isConnected = this.inConnectedTo.every(nodeID => nodeID !== null);
    }
  
updateActiveStatus() {
  
  if(this.inNodes > 0 )
    {
    // Only proceed if there are inbound connections
    if (this.inConnectedTo.length === 0) {
        this.isActive = false;
        
        return;
    }

    // Check if all nodes in 'isConnectedTo' are connected and active
    let allConnectedAndActive = this.inConnectedTo.every(nodeID => {
        if (nodeID === null) {
            return false;  // Not connected, so can't be active
        }
        
        let connectedNode = nodeInstances.find(node => node.ID === nodeID);
        return connectedNode && connectedNode.isActive && connectedNode.enableSignalThrough;  // Must be active
    });

    // Set this node's isActive status based on all connections being valid and active
    this.isActive = allConnectedAndActive;
    }
    }
  
    skillNodeDraw() {

  
      this.updateActiveStatus()
      
        for (let i = 0; i < perks.entry.length; i++) {
            if (perks.entry[i].ID === this.ID) {

              
               skillTreeUI.fill(92,58,34)
              
                    for (let i = 0; i < this.inNodes; i++) {
                
                        //loop through nodeInstances to find input connector

                        // inbound circles
                        let circleX =
                            this.posX +
                            i * (this.boxScaleX / this.inNodes) +
                            this.boxScaleX / this.inNodes / 2;
                        let circleY = this.posY;

              this.inNodePos[i] = [circleX, circleY];
                
                
                  if (dist(circleX, circleY, this.getRelativeMouseX(), this.getRelativeMouseY()) <= 20 && isMousePressed) {
                    
                            skillTreeUI.ellipse(circleX, circleY, 40, 40); //"highlights" the circle the mouse is near
                             
                          
                          this.inBool[i] = true;
                          this.inNodeIndex = findTrueIndex(this.inBool);
                          //console.log( this.inNodePos[this.inNodeIndex] )
                   
                        } else {
                         
                            skillTreeUI.ellipse(circleX, circleY, 20, 20);
                          this.inBool[i] = false;
                        }
              
            }
              
              
              
              for (let i = 0; i < this.outNodes; i++) {
                
                        //loop through nodeInstances to find input connector

                        // outbound circles
                        let circleX =
                            this.posX +
                            i * (this.boxScaleX / this.outNodes) +
                            this.boxScaleX / this.outNodes / 2;
                        let circleY = this.posY + this.boxScaleY;

              this.outNodePos[i] = [circleX, circleY];
                
                
                  if (dist(circleX, circleY, this.getRelativeMouseX(), this.getRelativeMouseY()) <= 20 && isMousePressed) {
                            skillTreeUI.ellipse(circleX, circleY, 40, 40); //"highlights" the circle the mouse is near
                             
                          
                            this.outBool[i] = true;
                            this.outNodeIndex = findTrueIndex(this.outBool);

                   
                        } else {
                            skillTreeUI.ellipse(circleX, circleY, 20, 20);
                          if (!isMousePressed) {
                                this.outBool[i] = false;
                                this.isNodeSelected = false;
                          }
                        }
              
                
                
                                     // connector handling
                        if (this.outBool[i] === true) {
                            this.connector(circleX, circleY, this.getRelativeMouseX(), this.getRelativeMouseY());
                            this.isNodeSelected = true;
//playerIsHandlingNode = true;

                        }
                
                
            }
        
              
              
              
      
              
                              // BOX DESIGN

                let inputCircleX = this.posX + this.boxScaleX / 2;
                let inputCircleY = this.posY;
              
              skillTreeUI.push()
               if(this.isActive)
                {
                  
                   skillTreeUI.fill(255,255,0)
                   skillTreeUI.rect(this.posX-10, this.posY-10, this.boxScaleX+20, this.boxScaleY+20,5);
              
               //skillTreeUI.rect(this.posX-10, this.posY-10, this.boxScaleX+20, this.boxScaleY+20); // overall Box
                }
              
              if(this.inConnectedTo.every(nodeID => nodeID !== null))
                {
              skillTreeUI.fill(112,78,54)
               
              
             }
              else
                {
                   skillTreeUI.fill(200)
                }
              
              
              skillTreeUI.rect(this.posX, this.posY, this.boxScaleX, this.boxScaleY,5); // overall Box
              
              
                  skillTreeUI.line(this.posX, this.posY+20,this.posX+ this.boxScaleX, this.posY+20); // name part box
              skillTreeUI.fill(200)
              skillTreeUI.rect(this.posX+5, this.posY+25, this.boxScaleX-10, 70); // art part box
            
                skillTreeUI.fill(0)
                 // Skill name
                skillTreeUI.text(
                     perks.entry[i].perkName,
                    this.posX + 5,
                    this.posY + 5,
                    this.boxScaleX - 5,
                    this.boxScaleY - 5
                );
                // Skill Text, we use a replacer to indicate the variable num
                  skillTreeUI.textSize(10)
                skillTreeUI.text(
                    perks.entry[i].text.replace("{{num}}", this.num),
                    this.posX + 5,
                    this.posY + 105,
                    this.boxScaleX - 5,
                    this.boxScaleY - 5
                );
              
                 skillTreeUI.pop()
              
                   for (let j = 0; j < nodeInstances.length; j++) {
                 
                    
                     //this gets which node is going towards which
    for (let k = 0; k < nodeInstances[j].inNodePos.length; k++) {
        if (
            dist(
                nodeInstances[j].inNodePos[k][0],
                nodeInstances[j].inNodePos[k][1],
                this.getRelativeMouseX(),
                this.getRelativeMouseY()
            ) <= 20 && this.isNodeSelected === true
        ) {
            console.log(
                "I, " +
                this.ID +
                " am approaching input node " +
                nodeInstances[j].inNodeIndex +
                " of " +
                nodeInstances[j].ID +
                " from outbound node " +
                findTrueIndex(this.outBool)
            );

     
            // Check if the current node's input position is already connected to another node
            if (nodeInstances[j].inConnectedTo[nodeInstances[j].inNodeIndex] === null) {
                // Only connect if the position is not already occupied
                this.outConnectedTo[findTrueIndex(this.outBool)] = nodeInstances[j].ID;
                nodeInstances[j].inConnectedTo[nodeInstances[j].inNodeIndex] = this.ID;
            } else {
                console.log("Position already occupied, cannot overwrite existing connection.");
            }
        }
    }

                     
                     for (let j = 0; j < this.outNodePos.length; j++) {
    if (
        dist(
            this.outNodePos[j][0],
            this.outNodePos[j][1],
            nodeInstances[j].getRelativeMouseX(),
            nodeInstances[j].getRelativeMouseY()
        ) <= 20 && nodeInstances[j].isNodeSelected === true
    ) {
        console.log(
            "Node " +
            this.ID +
            " is connecting its outbound node " +
            this.outNodeIndex +
            " to inbound node of " +
            nodeInstances[j].ID
        );

        // Ensure the 'outConnectedTo' position is available
        if (this.outConnectedTo[findTrueIndex(this.outBool)] === undefined) {
            this.outConnectedTo[findTrueIndex(this.outBool)] = nodeInstances[j].ID;
        } else {
            console.log("Outbound connection already exists at this position, cannot overwrite.");
        }
    }
}
                     
                   //////
                    
                   
                   }
              
              
              
        }
        }
      
      
      
      
      
      
       // Drawing existing connections between nodes
            for (let j = 0; j < this.outConnectedTo.length; j++) {
                if (this.outConnectedTo[j]) {
                    // Find the matching node that this node is connected to
                    let targetNode = nodeInstances.find(node => node.ID === this.outConnectedTo[j]);

                    if (targetNode) {
                        // Get the index of the connected input node on the targetNode
                        let targetIndex = targetNode.inConnectedTo.indexOf(this.ID);

                        if (targetIndex !== -1) {
                            // Draw the connector from the outNodePos of this node to the inNodePos of the targetNode
                            this.connector(
                                this.outNodePos[j][0], // Start position (this node's output)
                                this.outNodePos[j][1],
                                targetNode.inNodePos[targetIndex][0], // End position (target node's input)
                                targetNode.inNodePos[targetIndex][1]
                            );
                        }
                    }
                }
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

let isDraggingAll = false; // Track if dragging all nodes
let dragAllOffsetX = 0; // Store drag offset for all nodes
let dragAllOffsetY = 0;




function isMouseOverAnyNodeOutput() {
    for (let i = 0; i < nodeInstances.length; i++) {
        if (nodeInstances[i].isMouseOverNodes() ) {
            return true;
        }
    }
    return false;
}



// Function to check if the mouse is over any node
function isMouseOverAnyNode() {
    for (let i = 0; i < nodeInstances.length; i++) {
        if (nodeInstances[i].isMouseOver() ) {
            return true;
        }
    }
    return false;
}

// Function to handle mouse pressed for dragging all nodes