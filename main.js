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
    this.speed = Math.random() * 2 + 1; // 1–3 px/frame
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

const ship = new Ship(canvas.width/2, canvas.height/2);

const keys = {};

document.addEventListener("keydown",(e)=>{
    keys[e.key.toLowerCase()] = true;
})

document.addEventListener("keyup",(e)=>{
    keys[e.key.toLowerCase()] = false;
})

const asteroids = [];

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

    ship.draw();

     asteroids.forEach(asteroid => {
    asteroid.update(canvas);
    asteroid.draw(ctx);
  });
  requestAnimationFrame(update)
}
update()