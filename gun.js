import { mouseX, mouseY } from "./bullet.js";
import { square } from "./square.js";
const gun = document.getElementById('gun');


class Gun{
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.angleR = Math.atan2(mouseY - this.y, mouseX - this.x);
        this.angle = this.angleR * (180 / Math.PI);

        this.distance = 40;

        this.el = gun;
        this.updateStyle();
    }
    update() {
        const square = document.getElementById('square');
        const squareRect = square.getBoundingClientRect();
        const squareCenterX = squareRect.left + squareRect.width / 2;
        const squareCenterY = squareRect.top + squareRect.height / 2;

        this.angleR = Math.atan2(mouseY - squareCenterY, mouseX - squareCenterX);
        this.angle = this.angleR * (180 / Math.PI);

        this.x = squareCenterX - 40+ this.distance * Math.cos(this.angleR);
        this.y = squareCenterY - 22 + this.distance * Math.sin(this.angleR);
        
        gun.style.transform = `rotate(${this.angle}deg)`;
        this.updateStyle();
    }
    updateStyle() {
        this.el.style.left = `${this.x}px`;
        this.el.style.top = `${this.y}px`;
    }
}
let g = new Gun(parseInt(square.style.left) + 10, parseInt(square.style.top) + 10);
export function updateGun() {
    g.update();
}