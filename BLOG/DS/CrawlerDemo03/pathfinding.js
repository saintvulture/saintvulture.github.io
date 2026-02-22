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