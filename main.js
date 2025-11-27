const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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
    this.level = Math.floor(Math.random() * 4) + 1; // 1–4
    this.radius = this.level * 15; // dimensiunea depinde de nivel
    this.color = this.getColor();
    this.speed = Math.random() * 2; // 1–3 px/frame
    this.angle = Math.random() * Math.PI * 2;
    this.dx = Math.cos(this.angle) * this.speed;
    this.dy = Math.sin(this.angle) * this.speed;
  }

 getColor() {
  switch (this.level) {
    case 1: return "#4CAF50"; // verde intens
    case 2: return "#FFEB3B"; // galben puternic
    case 3: return "#FF9800"; // portocaliu aprins
    case 4: return "#F44336"; // roșu intens
  }
}

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();

    // text cu nivelul
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.level, this.x, this.y);
  }

  update(canvas) {
    this.x += this.dx;
    this.y += this.dy;

    // dacă iese din ecran, reapare pe partea opusă
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
const shotCooldown = 300; // milisecunde


function shootRocket() {
    const now = Date.now();

    // dacă nu a trecut cooldown-ul, nu trage
    if (now - lastShotTime < shotCooldown) return;

    // dacă sunt deja 3 rachete pe ecran, nu trage
    if (rockets.length >= 3) return;

    lastShotTime = now; // actualizăm momentul tragerii

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
                // lovit!
                ast.level--;

                if (ast.level <= 0) {
                    asteroids.splice(aIndex, 1); // asteroid distrus
                } else {
                    ast.radius = ast.level * 15; // actualizare dimensiune
                    ast.color = ast.getColor();  // actualizare culoare
                }

                rockets.splice(rIndex, 1); // racheta dispare
            }
        });
    });
}



for (let i = 0; i < 5; i++) {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  asteroids.push(new Asteroid(x, y));
}

function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

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
  requestAnimationFrame(update)
}
update()