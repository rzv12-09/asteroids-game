const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Ship {
    constructor (x,y){
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 8;
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
        const rotationSpeed = 0.1;
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

const ship = new Ship(canvas.width/2, canvas.height/2);

const keys = {};

document.addEventListener("keydown",(e)=>{
    keys[e.key.toLowerCase()] = true;
})

document.addEventListener("keyup",(e)=>{
    keys[e.key.toLowerCase()] = false;
})

function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(keys["z"]) ship.rotate("left");
    if(keys["c"]) ship.rotate("right");
    if(keys["arrowup"]) ship.move("up");
    if(keys["arrowdown"]) ship.move("down");
    if(keys["arrowleft"]) ship.move("left");
    if(keys["arrowright"]) ship.move("right");

    ship.draw();
}

setInterval(update,16);