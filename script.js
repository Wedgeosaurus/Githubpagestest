const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart");
const pauseBtn = document.getElementById("pause");

const tileSize = 20;
const tileCount = canvas.width / tileSize;

let snake;
let direction;
let nextDirection;
let food;
let score;
let gameLoopId;
let speed = 120; // ms per frame
let paused = false;

function initGame() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  speed = 120;
  scoreEl.textContent = score;
  placeFood();
  if (gameLoopId) clearInterval(gameLoopId);
  gameLoopId = setInterval(gameLoop, speed);
}

function placeFood() {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
    if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      break;
    }
  }
  food = newFood;
}

function gameLoop() {
  if (paused) return; // Skip updates while paused
  update();
  draw();
}

function update() {
  // Apply buffered direction (prevents reversing instantly)
  if (
    (nextDirection.x !== -direction.x || nextDirection.y !== -direction.y)
  ) {
    direction = nextDirection;
  }

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Wall collision (wrap or end)
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    return gameOver();
  }

  // Self collision
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    return gameOver();
  }

  snake.unshift(head);

  // Food collision
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    placeFood();
    // Slightly increase speed
    if (speed > 50) {
      speed -= 3;
      clearInterval(gameLoopId);
      gameLoopId = setInterval(gameLoop, speed);
    }
  } else {
    snake.pop();
  }
}

function draw() {
  // Clear
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid (optional subtle)
  ctx.strokeStyle = "#02081f";
  ctx.lineWidth = 1;
  for (let i = 0; i < tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tileSize, 0);
    ctx.lineTo(i * tileSize, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * tileSize);
    ctx.lineTo(canvas.width, i * tileSize);
    ctx.stroke();
  }

  // Draw snake
  snake.forEach((segment, index) => {
    const gradient = ctx.createLinearGradient(
      segment.x * tileSize,
      segment.y * tileSize,
      (segment.x + 1) * tileSize,
      (segment.y + 1) * tileSize
    );
    if (index === 0) {
      gradient.addColorStop(0, "#22c55e");
      gradient.addColorStop(1, "#16a34a");
    } else {
      gradient.addColorStop(0, "#15803d");
      gradient.addColorStop(1, "#166534");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(
      segment.x * tileSize + 1,
      segment.y * tileSize + 1,
      tileSize - 2,
      tileSize - 2
    );
  });

  // Draw food
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.roundRect(
    food.x * tileSize + 3,
    food.y * tileSize + 3,
    tileSize - 6,
    tileSize - 6,
    4
  );
  ctx.fill();
}

function gameOver() {
  clearInterval(gameLoopId);
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#e5e7eb";
  ctx.textAlign = "center";
  ctx.font = "28px system-ui, sans-serif";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 10);

  ctx.font = "18px system-ui, sans-serif";
  ctx.fillText(
    `Score: ${score}  —  Press Restart`,
    canvas.width / 2,
    canvas.height / 2 + 20
  );
}

function togglePause() {
  if (!paused) {
    paused = true;
    clearInterval(gameLoopId);

    // Optional: draw a pause overlay
    ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#e5e7eb";
    ctx.textAlign = "center";
    ctx.font = "28px system-ui, sans-serif";
    ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
  } else {
    paused = false;
    gameLoopId = setInterval(gameLoop, speed);
  }
}


// Input handling
window.addEventListener("keydown", e => {
  switch (e.key) {
    case "ArrowUp":
    case "w":
    case "W":
      if (direction.y === 0) nextDirection = { x: 0, y: -1 };
      break;
    case "ArrowDown":
    case "s":
    case "S":
      if (direction.y === 0) nextDirection = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      if (direction.x === 0) nextDirection = { x: -1, y: 0 };
      break;
    case "ArrowRight":
    case "d":
    case "D":
      if (direction.x === 0) nextDirection = { x: 1, y: 0 };
      break;
  }
});

restartBtn.addEventListener("click", initGame);
pauseBtn.addEventListener("click", togglePause);

document.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") { 
    initGame();
  } 
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    togglePause();
  }
});


// Start
initGame();
