const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");

const userScoreDiv = document.getElementById("user-score");
const saveScoreBtn = document.getElementById("saveScore");
const nameInput = userScoreDiv.querySelector("input");
const finalScoreText = document.getElementById("score");


const highScoresBtn = document.getElementById("scores");
const highScoresScreen = document.getElementById("high-scores");
const highScoresList = document.getElementById("highScoresList");
const closeScoresBtn = document.getElementById("closeScoresBtn");

const HIGH_SCORES_KEY = 'asteroidsHighScores';

let gameLevel = 1;
let score = 0;
let animationId;

const POINTS_FOR_EXTRA_LIFE = 500;
let nextLifePointsLimit = POINTS_FOR_EXTRA_LIFE;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;



class Ship {
    constructor (x,y){
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 4;
        this.size = 20;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.angle);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0,-this.size);
        ctx.lineTo(this.size/2,this.size);
        ctx.lineTo(-this.size/2,this.size);
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }

    rotate(direction){
        const rotationSpeed = 0.04;
        if(direction === "left") this.angle -= rotationSpeed;
        if(direction === "right") this.angle += rotationSpeed;
    }

    move(direction) {
        switch(direction){
            case "up":
                this.y -= this.speed;
                break;
            case "down":
                this.y += this.speed;
                break;
            case "left":
                this.x -= this.speed;
                break;
            case "right":
                this.x += this.speed;
        }
        this.wrapAround();
    }

    wrapAround() {
        if(this.x < 0) this.x = canvas.width;
        if(this.x > canvas.width) this.x = 0;
        if(this.y < 0) this.y = canvas.height;
        if(this.y > canvas.height) this.y = 0;
    }
}

class Asteroid {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.level = Math.floor(Math.random() * 4) + 1; 
    this.radius = this.level * 15;
    this.color = this.getColor();
    this.speed = Math.random() * 2;
    this.angle = Math.random() * Math.PI * 2;
    this.dx = Math.cos(this.angle) * this.speed;
    this.dy = Math.sin(this.angle) * this.speed;
  }

 getColor() {
  switch (this.level) {
    case 1: return "#4CAF50"; 
    case 2: return "#FFEB3B"; 
    case 3: return "#FF9800"; 
    case 4: return "#F44336"; 
  }
}

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI *2 );
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();

    //asteroid lvl text
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.level, this.x, this.y);
  }

  update(canvas) {
    this.x += this.dx;
    this.y += this.dy;

    //wrap around
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }
}

class Rocket {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle - Math.PI/2;
        this.speed = 7;
        this.size = 4; 
        this.dx = Math.cos(this.angle) * this.speed;
        this.dy = Math.sin(this.angle) * this.speed;
    }x

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI *2);
        ctx.fill();
    }

    isOffScreen() {
        return (
            this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height
        );
    }
}

const ship = new Ship(canvas.width/2, canvas.height/2);

const keys = {};

document.addEventListener("keydown",(e)=>{
    keys[e.key.toLowerCase()] = true;
})

document.addEventListener("keyup",(e)=>{
    keys[e.key.toLowerCase()] = false;
})



const asteroids = [];
const rockets = [];

let lastShotTime = 0;
const shotCooldown = 300;

let lives = 3;


function resetGame() {
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
    ship.angle = 0;
    ship.dx = 0;
    ship.dy = 0;

    asteroids.length = 0;
    rockets.length = 0;
    
    gameLevel = 1;
    createAsteroids(5);

    for(let key in keys){
        keys[key] = false;
    }
}


function shootRocket() {
    const now = Date.now();

    if (now - lastShotTime < shotCooldown) return;

    if (rockets.length >= 3) return;
    lastShotTime = now;

    const angle = ship.angle - Math.PI/2;
    const noseX = ship.x + Math.cos(angle) * ship.size;
    const noseY = ship.y + Math.sin(angle) * ship.size;

    rockets.push(new Rocket(noseX, noseY, ship.angle));
}

function checkCollisions() {
    rockets.forEach((rocket, rIndex) => {
        asteroids.forEach((ast, aIndex) => {

            const dist = Math.hypot(rocket.x - ast.x, rocket.y - ast.y);

            if (dist < ast.radius) {
               
                const currentLevel = ast.level;
                ast.level--;
                score += currentLevel * 10;

                if( score >= nextLifePointsLimit){
                    lives++;
                    nextLifePointsLimit += POINTS_FOR_EXTRA_LIFE;
                }

                if (ast.level <= 0) {
                    asteroids.splice(aIndex, 1);
                } else {
                    ast.radius = ast.level * 15;
                    ast.color = ast.getColor();
                }
                rockets.splice(rIndex, 1); 
            }
        });
    });
}


function createAsteroids(number) {
    for (let i = 0; i < number; i++) {
        let x, y;
        let dist;
        const safeZone = 150;

        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
            dist = Math.hypot(ship.x - x, ship.y - y);
        } while (dist < safeZone);

        asteroids.push(new Asteroid(x, y));
    }
}


function checkShipCollision() {
    for (let ast of asteroids) {
        const dist = Math.hypot(ship.x - ast.x, ship.y - ast.y);

        if (dist < ast.radius + ship.size) {
            lives--;
            if (lives <= 0) {
                gameOver();
            }else{
                resetGame();
            }
            return;
        }
    }
}

function gameOver(){
    cancelAnimationFrame(animationId);
    finalScoreText.innerText = "Final Score: " + score; 
    userScoreDiv.style.display = "flex";
}

function drawLives() {
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Lives: " + "❤".repeat(lives), 20, 20);
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, 20, 50); 
}

function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if (asteroids.length === 0) {
        gameLevel++;
        createAsteroids(5 + gameLevel); 
    }


    if(keys["z"]) ship.rotate("left");
    if(keys["c"]) ship.rotate("right");
    if(keys["arrowup"]) ship.move("up");
    if(keys["arrowdown"]) ship.move("down");
    if(keys["arrowleft"]) ship.move("left");
    if(keys["arrowright"]) ship.move("right");
    if (keys["x"]) shootRocket();

    ship.draw();

     asteroids.forEach(asteroid => {
    asteroid.update(canvas);
    asteroid.draw(ctx);
  });
   rockets.forEach((rocket, index) => {
        rocket.update();
        rocket.draw();

        if (rocket.isOffScreen()) {
            rockets.splice(index, 1);
        }
    });
    checkCollisions();
    checkShipCollision();
    drawLives();
    drawScore();

    if (lives > 0){
    animationId = requestAnimationFrame(update)
    }
}

startBtn.addEventListener("click", () => {
    menu.style.display = "none";  
    canvas.style.display = "block";

    resetGame();
    update();
});

function saveHighScore(name, score) {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY)) || [];
    const newScore = { name: name, score: score };
    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(5);
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
}

saveScoreBtn.addEventListener("click", () => {
   const playerName = nameInput.value || "Anonymous";
    saveHighScore(playerName, score);
    userScoreDiv.style.display = "none";
    score = 0; 
    lives = 3;
    resetGame();
    
    nextLifePointsLimit = POINTS_FOR_EXTRA_LIFE;
    canvas.style.display = "none";
    menu.style.display = "flex";
    nameInput.value = "";
});

function showHighScores() {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY)) || [];
    highScoresList.innerHTML = "";
    highScores.forEach((scoreObj) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${scoreObj.name}</span> <span>${scoreObj.score}</span>`;
        highScoresList.appendChild(li);
    });
}

highScoresBtn.addEventListener("click", () => {
    menu.style.display = "none";
    highScoresScreen.style.display = "flex";
    showHighScores();
});

closeScoresBtn.addEventListener("click", () => {
    highScoresScreen.style.display = "none";
    menu.style.display = "flex";
});