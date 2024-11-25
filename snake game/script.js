const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20; // Size of each block
const rows = canvas.height / box;
const cols = canvas.width / box;

// Game elements
let snake = [{ x: 10 * box, y: 10 * box }];
let food = { x: Math.floor(Math.random() * cols) * box, y: Math.floor(Math.random() * rows) * box };
let score = 0;
let direction = 'RIGHT';
let game;

// UI elements
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Event listener for direction control
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
  if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
});

// Function to draw the snake
function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    const gradient = ctx.createLinearGradient(
      snake[i].x,
      snake[i].y,
      snake[i].x + box,
      snake[i].y + box
    );
    gradient.addColorStop(0, i === 0 ? '#2ecc71' : '#27ae60');
    gradient.addColorStop(1, '#145a32');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
      snake[i].x + box / 2,
      snake[i].y + box / 2,
      box / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = '#000';
    ctx.stroke();
  }
}

// Function to draw food
function drawFood() {
  const gradient = ctx.createRadialGradient(
    food.x + box / 2,
    food.y + box / 2,
    5,
    food.x + box / 2,
    food.y + box / 2,
    box / 2
  );
  gradient.addColorStop(0, '#e74c3c');
  gradient.addColorStop(1, '#c0392b');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, Math.PI * 2);
  ctx.fill();
}

// Function to update the game state
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawFood();
  drawSnake();

  let head = { ...snake[0] };

  // Move the snake
  if (direction === 'UP') head.y -= box;
  if (direction === 'DOWN') head.y += box;
  if (direction === 'LEFT') head.x -= box;
  if (direction === 'RIGHT') head.x += box;

  // Check collision with food
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreDisplay.innerText = score;
    food = {
      x: Math.floor(Math.random() * cols) * box,
      y: Math.floor(Math.random() * rows) * box,
    };
  } else {
    snake.pop(); // Remove tail
  }

  // Add new head
  snake.unshift(head);

  // Check collisions with walls or itself
  if (
    head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height ||
    snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    gameOver();
  }
}

// Function to handle Game Over
function gameOver() {
  clearInterval(game);
  finalScore.innerText = score;
  gameOverScreen.style.display = 'flex';
}

// Restart the game
restartBtn.addEventListener('click', () => {
  snake = [{ x: 10 * box, y: 10 * box }];
  food = { x: Math.floor(Math.random() * cols) * box, y: Math.floor(Math.random() * rows) * box };
  score = 0;
  direction = 'RIGHT';
  scoreDisplay.innerText = score;
  gameOverScreen.style.display = 'none';
  game = setInterval(update, 100);
});

// Start the game
game = setInterval(update, 100);
