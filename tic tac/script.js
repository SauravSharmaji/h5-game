const gameBoard = document.getElementById('gameBoard');
const gameOverScreen = document.getElementById('gameOverScreen');
const winnerMessage = document.getElementById('winnerMessage');
const restartBtn = document.getElementById('restartBtn');

// Game state
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let isGameActive = true;

// Winning combinations
const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Create the game board dynamically
function createBoard() {
  gameBoard.innerHTML = '';
  board.forEach((cell, index) => {
    const cellElement = document.createElement('div');
    cellElement.classList.add('cell');
    cellElement.dataset.index = index;
    cellElement.addEventListener('click', handleCellClick);
    gameBoard.appendChild(cellElement);
  });
}

// Handle cell click
function handleCellClick(e) {
  const cellIndex = e.target.dataset.index;

  if (board[cellIndex] === '' && isGameActive) {
    board[cellIndex] = currentPlayer;
    e.target.textContent = currentPlayer;
    e.target.classList.add('taken');

    if (checkWin()) {
      endGame(false);
    } else if (board.every(cell => cell !== '')) {
      endGame(true);
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
  }
}

// Check if a player has won
function checkWin() {
  return winningCombos.some(combo => {
    return combo.every(index => board[index] === currentPlayer);
  });
}

// End the game
function endGame(draw) {
  isGameActive = false;
  if (draw) {
    winnerMessage.textContent = "It's a Draw!";
  } else {
    winnerMessage.textContent = `Player ${currentPlayer} Wins!`;
  }
  gameOverScreen.style.display = 'flex';
}

// Restart the game
restartBtn.addEventListener('click', () => {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  isGameActive = true;
  gameOverScreen.style.display = 'none';
  createBoard();
});

// Initialize the game
createBoard();
