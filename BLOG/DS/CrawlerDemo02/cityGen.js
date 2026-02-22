
fontsize = 10;


  let cellPick = 3






function generateWorld(){

  

let width = 600;
let height = 600;

let numPoints = Math.floor(Math.random() * 20) + 9;
  
  
   districts = generateVoronoiDiagram(
  numPoints,
  width / fontsize,
  height / fontsize
       );
       
       cityShape = generateVoronoiDiagram(
 50,
  width / fontsize,
  height / fontsize)

 

  districtMap = districts.map(function (arr) {
    return arr.slice();
  });
  
  
  
  rooms = generateRoom(width / fontsize, height / fontsize, 1, 0)

     centralCell = getCellNumber((width/fontsize)/2, (height/fontsize)/2, districtMap)
  //City shape generator
  
    for (let j = 0; j < cityShape.length; j++) {
    for (let i = 0; i < cityShape[j].length; i++) {
      
      if (isElementInCellNearBorder(j, i, cityShape) === false) {
        cityShape[j][i] = 0;
      }
 
    }
  }

      for (let j = 0; j < cityShape.length; j++) {
    for (let i = 0; i < cityShape[j].length; i++) {
      
      if (cityShape[j][i] !== 0) {
        cityShape[j][i] = 1;
      }
 
    }
  }
  
  switchElements(cityShape, 0, 1)
  
  //add border wall
  
  let borderID = numPoints+1
  replaceBordering(cityShape, 0, 1, borderID) 
  replaceBordering(cityShape, 1, borderID, borderID+1) 
  
  for (let j = 0; j < cityShape.length; j++) {
    for (let i = 0; i < cityShape[j].length; i++) {
      
      if (cityShape[j][i] === borderID+1) {
        cityShape[j][i] = borderID;
      }
 
    }
  }
  
  // overlay roads
  for (let j = 0; j < districtMap.length; j++) {
  for (let i = 0; i < districtMap[j].length; i++) {
    if (rooms[j][i] === 0 ) {
      districtMap[j][i] =  rooms[j][i]  ;
    }
  }
}


  
    //replace the borders with 0 to create roads
  for (let j = 0; j < districtMap.length; j++) {
    for (let i = 0; i < districtMap[j].length; i++) {
      
      if (isBorderCell(i, j, districts)) {
        districtMap[i][j] = 0;
      }
    }
  }
  
  
  
  
  //overlay maps
  
  for (let j = 0; j < cityShape.length; j++) {
  for (let i = 0; i < cityShape[j].length; i++) {
    if (cityShape[j][i] === 1 ) {
      cityShape[j][i] = districtMap[j][i];
    }
  }
}

  //creates empty center

  
    for (let j = 0; j < cityShape.length; j++) {
  for (let i = 0; i < cityShape[j].length; i++) {
    if (cityShape[j][i] === centralCell ) {
      cityShape[j][i] = 0;
    }
  }
}
  

  

  
  
    //Transcribe into map usable in crawler
   for (let j = 0; j < cityShape.length; j++) {
    for (let i = 0; i < cityShape[j].length; i++) {
      
      if (cityShape[j][i] !== 0 ) {
      cityShape[j][i] = 1;
    }


    }
  }
  
  
  
  

  return cityShape;
  
  /*
  //Isolate cell
  
  
   let isolatedCell = extractCell(districtMap, cellPick).extracted 
  
    for (let j = 0; j < isolatedCell.length; j++) {
    for (let i = 0; i < isolatedCell[j].length; i++) {
      let cellNumber = isolatedCell[i][j];

      textSize(fontsize);
      fill(colors[cellNumber % colors.length]);
      text(getCellNumber(i, j, isolatedCell), i * fontsize, j * fontsize);
    }
  }
  
  */
  
}




function generateRoom(mapWidth, mapHeight, wallChar, floorChar) {
  const minRoomWidth = 4;
  const stopRoomWidth = minRoomWidth * 2 + 1;

  // Initialize the level with walls all around.
  const level = new Array(mapHeight);
  for (let y = 0; y < mapHeight; y++) {
    level[y] = new Array(mapWidth).fill(wallChar);
    level[y][0] = level[y][mapWidth - 1] = floorChar;
  }
  level[0] = level[mapHeight - 1] = new Array(mapWidth).fill(wallChar);

  function subdivide(x1, y1, x2, y2) {
    const width = x2 - x1 + 1;
    const height = y2 - y1 + 1;

    if (width >= height && width >= stopRoomWidth) {
      subdivideWidth(x1, y1, x2, y2);
    } else if (height >= stopRoomWidth) {
      subdivideHeight(x1, y1, x2, y2);
    }
  }

  function subdivideWidth(x1, y1, x2, y2) {
    const x = randomInt(x1 + minRoomWidth, x2 - minRoomWidth);

    for (let y = y1; y <= y2; y++) {
      level[y][x] = floorChar;
    }

    subdivide(x1, y1, x - 1, y2);
    subdivide(x + 1, y1, x2, y2);
  }

  function subdivideHeight(x1, y1, x2, y2) {
    const y = randomInt(y1 + minRoomWidth, y2 - minRoomWidth);

    for (let x = x1; x <= x2; x++) {
      level[y][x] = floorChar;
    }

    subdivide(x1, y1, x2, y - 1);
    subdivide(x1, y + 1, x2, y2);
  }

  subdivide(1, 1, mapWidth - 2, mapHeight - 2);

  return level;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffle an array in place
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateRandomName(first, last) {
  // Generate a random index for each array
  const randomFirstNameIndex = Math.floor(Math.random() * first.length);
  const randomLastNameIndex = Math.floor(Math.random() * last.length);
  
  // Combine the two strings to create a random name
  const randomName = first[randomFirstNameIndex] + last[randomLastNameIndex];
  
  // Return the random name
  return randomName;
}


// replaces all occurrences of element x bordering element y with element z:
function replaceBordering(arr, x, y, z) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      if (arr[i][j] === y) {
        // Check the element to the left
        if (j > 0 && arr[i][j - 1] === x) {
          arr[i][j - 1] = z;
        }
        // Check the element to the right
        if (j < arr[i].length - 1 && arr[i][j + 1] === x) {
          arr[i][j + 1] = z;
        }
        // Check the element above
        if (i > 0 && arr[i - 1][j] === x) {
          arr[i - 1][j] = z;
        }
        // Check the element below
        if (i < arr.length - 1 && arr[i + 1][j] === x) {
          arr[i + 1][j] = z;
        }
      }
    }
  }
  
  return arr;
}

function countDistricts(arr) {
  let newArray = [];
  let seen = {};
  let largest = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      const val = arr[i][j];
      if (val === 0 || val === largest) {
        continue;
      } else if (val > largest) {
        largest = val;
      }
      if (!seen[val]) {
        newArray.push(val);
        seen[val] = true;
      }
    }
  }
  return newArray;
}

function replaceLessThan(arr, x, count) {
  let frequency = new Map();
  
  // Count the frequency of each element in the array
  for (let row of arr) {
    for (let val of row) {
      if (frequency.has(val)) {
        frequency.set(val, frequency.get(val) + 1);
      } else {
        frequency.set(val, 1);
      }
    }
  }
  
  // Replace elements with frequency less than count with 0
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      if (arr[i][j] === x && frequency.get(x) < count) {
        arr[i][j] = 0;
      }
    }
  }
  
  return arr;
}

function extractCell(cells, cellNumber) {
  const extracted = cells.map(arr => arr.slice());
  let firstRow = -1;
  let lastCol = -1;
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[i].length; j++) {
      if (cells[i][j] === cellNumber) {
        extracted[i][j] = cellNumber;
        if (firstRow === -1) {
          firstRow = i;
        }
        lastCol = j;
      } else {
        extracted[i][j] = 0;
      }
    }
  }
  return { extracted, firstRow, lastCol };
}

function getCellNumber(x, y, cells) {
  return cells[x][y];
}

// Define a function to calculate the distance between two points
function distance(p1, p2) {
  return Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
}

// Define a function to find the closest point to a given point from a set of points
function findClosestPoint(point, points) {
  let closest = null;
  let minDistance = Infinity;
  for (let i = 0; i < points.length; i++) {
    let d = distance(point, points[i]);
    if (d < minDistance) {
      minDistance = d;
      closest = points[i];
    }
  }
  return closest;
}

function getBorderElements(arr) {
  const numRows = arr.length;
  const numCols = arr[0].length;
  let borderElements = [];
  
  // Get top and bottom border elements
  for (let i = 0; i < numCols; i++) {
    borderElements.push(arr[0][i]);
    borderElements.push(arr[numRows - 1][i]);
  }
  
  // Get left and right border elements
  for (let i = 1; i < numRows - 1; i++) {
    borderElements.push(arr[i][0]);
    borderElements.push(arr[i][numCols - 1]);
  }
  
  // Remove duplicates
  borderElements = [...new Set(borderElements)];
  
  return borderElements;
}

function isElementInCellNearBorder(x, y, cells)
{

  
    if(getBorderElements(cells).includes(cells[x][y]))
            {
              return true
            }
  else
    {
      return false
    }
    
    
    
}


function switchElements(array, element1, element2) {
  for (var i = 0; i < array.length; i++) {
    for (var j = 0; j < array[i].length; j++) {
      if (array[i][j] === element1) {
        array[i][j] = element2;
      } else if (array[i][j] === element2) {
        array[i][j] = element1;
      }
    }
  }
  return array;
}

function isBorderCell(x, y, cells) {
  const currentCell = cells[x][y];

  // Check if any adjacent cell has a different index
  if (x > 0 && cells[x - 1][y] !== currentCell) {
    return true;
  }
  if (x < cells.length - 1 && cells[x + 1][y] !== currentCell) {
    return true;
  }
  if (y > 0 && cells[x][y - 1] !== currentCell) {
    return true;
  }
  if (y < cells[0].length - 1 && cells[x][y + 1] !== currentCell) {
    return true;
  }

  return false;
}


// Define a function to generate the Voronoi diagram for a set of points
function generateVoronoiDiagram(numPoints, width, height) {
  // Generate a random set of points within the specified range
  let points = [];
  for (let i = 0; i < numPoints; i++) {
    let x = Math.floor(Math.random() * width);
    let y = Math.floor(Math.random() * height);
    points.push({ x: x, y: y });
  }

  // Initialize an empty 2D array to store the cell indices
  let cells = new Array(width);
  for (let i = 0; i < width; i++) {
    cells[i] = new Array(height);
    for (let j = 0; j < height; j++) {
      cells[i][j] = -1;
    }
  }

  // For each point, find the closest point and mark the corresponding cell in the array
  for (let i = 0; i < points.length; i++) {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let closest = findClosestPoint({ x: x, y: y }, points);
        if (closest === points[i]) {
          cells[x][y] = i + 1;
        }
      }
    }
  }

  return cells;
}

//TO DO 
//fix flying bits
//clean strandy rows and columns
// bsp partition per cell
//pick random square to make a park
//name districts