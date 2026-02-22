//Tools


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

