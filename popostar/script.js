const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
const gridSize = 10;
let score = 0;

const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart');

let grid = [];

// Initialize the game board
function initGame() {
  grid = [];
  score = 0;
  scoreElement.textContent = score;
  gameBoard.innerHTML = '';

  for (let row = 0; row < gridSize; row++) {
    grid[row] = [];
    for (let col = 0; col < gridSize; col++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      grid[row][col] = color;

      const block = document.createElement('div');
      block.className = 'block';
      block.style.backgroundColor = color;
      block.dataset.row = row;
      block.dataset.col = col;

      block.addEventListener('click', () => handleBlockClick(row, col));
      gameBoard.appendChild(block);
    }
  }
}

// Handle block clicks
function handleBlockClick(row, col) {
  const targetColor = grid[row][col];
  if (!targetColor) return;

  const blocksToRemove = getConnectedBlocks(row, col, targetColor);
  if (blocksToRemove.length > 1) {
    blocksToRemove.forEach(([r, c]) => {
      grid[r][c] = null;
      const block = document.querySelector(`.block[data-row='${r}'][data-col='${c}']`);
      block.style.visibility = 'hidden';
    });

    score += blocksToRemove.length * 10;
    scoreElement.textContent = score;
    dropBlocks();
  }
}

// Get connected blocks of the same color
function getConnectedBlocks(row, col, color, visited = new Set()) {
  const key = `${row},${col}`;
  if (
    row < 0 ||
    col < 0 ||
    row >= gridSize ||
    col >= gridSize ||
    visited.has(key) ||
    grid[row][col] !== color
  ) {
    return [];
  }

  visited.add(key);
  let connected = [[row, col]];

  connected = connected.concat(getConnectedBlocks(row - 1, col, color, visited));
  connected = connected.concat(getConnectedBlocks(row + 1, col, color, visited));
  connected = connected.concat(getConnectedBlocks(row, col - 1, color, visited));
  connected = connected.concat(getConnectedBlocks(row, col + 1, color, visited));

  return connected;
}

function dropBlocks() {
    for (let col = 0; col < gridSize; col++) {
      let emptyRow = gridSize - 1; // Start from the bottom row
      for (let row = gridSize - 1; row >= 0; row--) {
        if (grid[row][col]) {
          if (emptyRow !== row) {
            // Move the block to the empty row
            grid[emptyRow][col] = grid[row][col];
            grid[row][col] = null;
  
            // Update the DOM element's row attribute
            const block = document.querySelector(`.block[data-row='${row}'][data-col='${col}']`);
            if (block) {
              block.dataset.row = emptyRow;
              block.style.transform = `translateY(${(emptyRow - row) * 55}px)`;
            }
          }
          emptyRow--;
        }
      }
    }
  
    // Remove the invisible blocks from the DOM after updating
    const blocks = document.querySelectorAll('.block');
    blocks.forEach((block) => {
      const row = parseInt(block.dataset.row);
      const col = parseInt(block.dataset.col);
      if (!grid[row][col]) {
        block.remove();
      }
    });
  }
  
// Restart the game
restartButton.addEventListener('click', initGame);

// Start the game
initGame();
