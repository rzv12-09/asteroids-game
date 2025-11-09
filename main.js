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
}

const ship = new Ship(canvas.width/2, canvas.height/2);

function update(){
    ship.draw();
}

setInterval(update,16);