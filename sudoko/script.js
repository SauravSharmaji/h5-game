// script.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

// Game variables
let ball = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  radius: 10,
  color: "red",
  angle: 0, // Ball rotation angle
  velocity: 0,
};
let gravity = 0.6;
let obstacles = [];
let colors = ["red", "blue", "yellow", "green"];
let rotationAngle = 0;
let gameOver = false;

// Create rotating obstacles
function createObstacle(y) {
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const shapes = ["circle", "cross"]; // Different shapes
  const type = shapes[Math.floor(Math.random() * shapes.length)];

  obstacles.push({
    x: canvas.width / 2,
    y: y || 0,
    radius: 70,
    type: type,
    colors: shuffleArray(colors),
    rotationSpeed: 0.02, // Speed of rotation
  });
}

// Shuffle array for randomized obstacle colors
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Draw the ball
function drawBall() {
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.angle);
  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
  ctx.closePath();
  ctx.restore();
}

// Draw the obstacles
function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.save();
    ctx.translate(obstacle.x, obstacle.y);
    ctx.rotate(rotationAngle);

    if (obstacle.type === "circle") {
      // Draw circular obstacle
      obstacle.colors.forEach((color, index) => {
        ctx.beginPath();
        ctx.arc(0, 0, obstacle.radius, (index * Math.PI) / 2, ((index + 1) * Math.PI) / 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 10;
        ctx.stroke();
      });
    } else if (obstacle.type === "cross") {
      // Draw cross obstacle
      ctx.lineWidth = 10;
      obstacle.colors.forEach((color, index) => {
        ctx.beginPath();
        ctx.moveTo(-obstacle.radius + index * 35, -obstacle.radius);
        ctx.lineTo(obstacle.radius, obstacle.radius);
        ctx.strokeStyle = color;
        ctx.stroke();
      });
    }

    ctx.restore();
  });
}

// Update the ball's position
function updateBall() {
  ball.velocity += gravity;
  ball.y += ball.velocity;

  // Prevent the ball from falling off the canvas
  if (ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius;
    ball.velocity = 0;
  }
}

// Update obstacles
function updateObstacles() {
  obstacles.forEach((obstacle) => {
    obstacle.y += 2; // Move the obstacle downward

    // Collision detection
    if (
      obstacle.y - obstacle.radius < ball.y + ball.radius &&
      obstacle.y + obstacle.radius > ball.y - ball.radius
    ) {
      const currentColor = obstacle.colors[Math.floor((rotationAngle % (Math.PI * 2)) / (Math.PI / 2))];
      if (currentColor !== ball.color) {
        gameOver = true;
        document.getElementById("message").textContent = "Game Over! Refresh to play again.";
      }
    }
  });

  // Remove obstacles that move out of the canvas
  obstacles = obstacles.filter((obstacle) => obstacle.y < canvas.height + obstacle.radius);
}

// Switch the ball's color
function switchColor() {
  const currentColorIndex = colors.indexOf(ball.color);
  ball.color = colors[(currentColorIndex + 1) % colors.length];
}

// Rotate the ball with arrow keys
document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") {
    ball.angle -= 0.1; // Rotate left
  } else if (e.code === "ArrowRight") {
    ball.angle += 0.1; // Rotate right
  } else if (e.code === "Space" && !gameOver) {
    ball.velocity = -10; // Jump
  }
});

// Game loop
function gameLoop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  rotationAngle += 0.02; // Rotate obstacles
  drawBall();
  drawObstacles();
  updateBall();
  updateObstacles();

  requestAnimationFrame(gameLoop);
}

// Generate obstacles periodically
setInterval(() => {
  if (!gameOver) {
    createObstacle();
  }
}, 3000);

// Start the game
ball.color = colors[Math.floor(Math.random() * colors.length)];
createObstacle(canvas.height / 3); // First obstacle
gameLoop();
