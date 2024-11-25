const playerCar = document.getElementById("player-car");
const road = document.querySelector(".road");
const scoreDisplay = document.getElementById("score");

let playerPosition = 175; // Initial position of the player's car
let score = 0;
let obstacles = [];
let gameInterval;
let obstacleInterval;

// Move the player's car
// let playerPosition = 175; // Initial position of the player's car
let moveInterval = null; // To store the interval for continuous movement

document.addEventListener("keydown", (e) => {
    // Start moving if the key is pressed and no interval is running
    if (!moveInterval && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        moveInterval = setInterval(() => {
            if (e.key === "ArrowLeft" && playerPosition > 50) {
                playerPosition -= 20; // Move faster by reducing position more quickly
            }
            if (e.key === "ArrowRight" && playerPosition < 300) {
                playerPosition += 20;
            }
            playerCar.style.left = `${playerPosition}px`;
        }, 50); // Adjust speed by changing interval time (50ms = faster)
    }
});

document.addEventListener("keyup", () => {
    // Stop movement when the key is released
    clearInterval(moveInterval);
    moveInterval = null;
});

// Create obstacles
function createObstacle() {
    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");
    obstacle.style.left = `${Math.random() * 350}px`;
    
    // Add background image to the obstacle
    obstacle.style.backgroundImage = "url('./img/vehicle.png')";
    obstacle.style.backgroundSize = "cover"; // Ensure the image covers the entire obstacle
    obstacle.style.backgroundPosition = "center"; // Center the image
    
    road.appendChild(obstacle);
    obstacles.push(obstacle);
}


// Update game logic
function updateGame() {
    // Move obstacles down
    obstacles.forEach((obstacle, index) => {
        let top = parseInt(window.getComputedStyle(obstacle).top);
        if (top > 600) {
            obstacle.remove();
            obstacles.splice(index, 1);
            score++;
            scoreDisplay.textContent = score;
        } else {
            obstacle.style.top = `${top + 5}px`;
        }

        // Check for collisions
        const playerRect = playerCar.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();
        if (
            playerRect.x < obstacleRect.x + obstacleRect.width &&
            playerRect.x + playerRect.width > obstacleRect.x &&
            playerRect.y < obstacleRect.y + obstacleRect.height &&
            playerRect.height + playerRect.y > obstacleRect.y
        ) {
            endGame();
        }
    });
}

// End the game
function endGame() {
    clearInterval(gameInterval);
    clearInterval(obstacleInterval);
    alert(`Game Over! Your score: ${score}`);
    location.reload();
}

// Start the game
function startGame() {
    gameInterval = setInterval(updateGame, 20);
    obstacleInterval = setInterval(createObstacle, 1000);
}

startGame();
