import { enemyBullet } from './bullet.js';
import { endGame, enemies, enemyS, enemyPlayerCollision, enemyShooterPlayerCollision,
    bulletEnemyCollision, enemyBulletPlayerCollision} from './code.js';
let squareX = parseInt(square.style.left, 10);
let squareY = parseInt(square.style.top, 10);
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
let squareHealth = 100;
let gameOver = false;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const slimeImg = new Image();
slimeImg.src = 'assets/slimeSpriteSheet.png';

const frameCellWidth = 32;
const frameCellHeight = 32;
const frameCropOffsetX = 0;
const frameCropOffsetY = 4;
let totalFrames = 10;

let framesPerRow = null;
let totalRows = 1;
slimeImg.onload = () => {
    framesPerRow = 10;
    totalRows = 20;
    totalFrames = 200;
};

export function isShot(obj1, obj2) {
    const rect1 = obj1.el.getBoundingClientRect();
    const rect2 = obj2.el.getBoundingClientRect();
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
             
}

class Enemy {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;

        this.health = 100;

        const dx = targetX - x;
        const dy = targetY - y;
        const speed = 1.5;
        const length = Math.sqrt(dx * dx + dy * dy);

        this.vx = (dx/length) * speed;
        this.vy = (dy/length) * speed;

        this.el = document.createElement('div');
        this.el.classList.add('enemy');
        document.body.appendChild(this.el);

        this.updateStyle();
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        squareX = parseInt(square.style.left, 10);
        squareY = parseInt(square.style.top, 10);
        const dx = squareX - this.x;
        const dy = squareY - this.y;
        const speed = 1.5;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (squareX < this.x) {
            this.el.classList.add('flipped');
        } else {
            this.el.classList.remove('flipped');
        }

        this.vx = (dx/length) * speed;
        this.vy = (dy/length) * speed;

        enemyPlayerCollision();
        bulletEnemyCollision();
        this.updateStyle();
    }

    updateStyle() {
        this.el.style.left = `${this.x}px`;
        this.el.style.top = `${this.y}px`;
    }

    isAlive() {
        return this.health > 0;
    }

    destroy() {
        this.el.remove();
    }
}

class EnemyShooter extends Enemy {
    constructor(x, y, targetX, targetY) {
        super(x, y, targetX, targetY);
        this.x = x;
        this.y = y;

        this.health = 100;

        const dx = targetX - x;
        const dy = targetY - y;
        const speed = 1.5;
        const length = Math.sqrt(dx * dx + dy * dy);

        this.vx = (dx/length) * speed;
        this.vy = (dy/length) * speed;

        this.el.classList.add('shooter');
        const cs = window.getComputedStyle(this.el);
        this.drawWidth = parseFloat(cs.width) || 100;
        this.drawHeight = parseFloat(cs.height) || 100;
        this.el.style.visibility = 'hidden';
        this.el.style.pointerEvents = 'none';
        this.shotCooldown = 100;
        this.shootTimer = this.shotCooldown;


        this.jumpAnim = false;
        this.shootingAnim = false;
        this.idleAnim = false;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.frameDelay = 8 + Math.floor(Math.random() * 8);

        const cols = 10;
        const rows = 20;
        this.frameCols = cols;
        this.frameRows = rows;
        const rand = Math.floor(Math.random() * 2);
        this.color = 0;

        console.log(rand);

        if(rand == 0) {this.color = 0; console.log("green")}
        else if(rand == 1) {this.color = 5; console.log("blue")}
        else if(rand == 2) {this.color = 10; console.log("red")}
        else {this.color = 15; console.log("yellow")}

        console.log(this.color);

        this.rowIndex = 0;

        this.updateStyle();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        const squareEl = document.getElementById('square');
        if (!squareEl) return;
        const squareX = parseInt(squareEl.style.left, 10);
        const squareY = parseInt(squareEl.style.top, 10);

        const dx = squareX - this.x;
        const dy = squareY - this.y;
        const speed = 1.5;
        const length = Math.sqrt(dx * dx + dy * dy) || 1;

        let trig = Math.hypot(dy, dx);
        let maxDist = 300;

        if (squareX < this.x) {
            this.el.classList.add('flipped');
        } else {
            this.el.classList.remove('flipped');
        }

        if(!this.shootingAnim){
            this.rowIndex = (2 + this.color);
            if (Math.abs(trig) > maxDist || this.x < 0 || this.x > WIDTH) {
                this.vx = (dx / length) * speed;
            } else if  (Math.abs(trig) > maxDist - 20) {
                this.vx = 0;
            } else {
                this.vx = -(dx / length) * speed;
            }
            
            if (Math.abs(trig) > maxDist || this.y < 0 || this.y > HEIGHT) {
                this.vy = (dy / length) * speed;
            } else if (Math.abs(trig) > maxDist - 20) {
                this.vy = 0;
            } else {
                this.vy = -(dy / length) * speed;
            }
    }

        const inRange = trig < maxDist + 20;

        if(this.vx == 0 && this.vy == 0 && !this.jumpAnim && !this.shootingAnim) {
            this.rowIndex = this.color;
        }

        if(inRange) {
            this.shootTimer--;
             if(inRange && (this.shootTimer <= 0) && !this.jumpAnim) {
                this.vx = 0;
                this.vy = 0;
                this.rowIndex = (3 + this.color);
             }
        }

        if(this.shootingAnim) {
            if(this.currentFrame == 6) {
                enemyBullet(this.x, this.y);
                this.shootTimer = this.shotCooldown;
            }
        }

        // animation handled by canvas rendering; nothing to do per-frame here

        // keep existing collision and style updates
        enemyShooterPlayerCollision();
        bulletEnemyCollision();
        this.updateStyle();
    }

    updateStyle() {
        this.el.style.left = `${this.x}px`;
        this.el.style.top = `${this.y}px`;
    }

    isAlive() {
        return this.health > 0;
    }

    destroy() {
        this.el.remove();
    }
}

export function updateEnemy() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (e.el) {
            e.update();
        }
        if (!e.isAlive()) {
        e.destroy();
            enemies.splice(i, 1);
        }
    }
    

    
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = enemyS.length - 1; i >= 0; i--) {
        const e = enemyS[i];
        if (e.el) {
            e.update();
            e.frameTimer++;
            if (e.frameTimer >= e.frameDelay) {
                e.frameTimer = 0;
                if(e.currentFrame >= e.frameCols - 1) {
                    e.currentFrame = 0;
                    if(e.rowIndex == (2 + e.color)) e.jumpAnim = false;
                    if(e.rowIndex == (3 + e.color)) e.shootingAnim = false;
                }
                else {
                    if(e.rowIndex == (2 + e.color)) e.jumpAnim = true;
                    if(e.rowIndex == (3 + e.color)) e.shootingAnim = true;
                    e.currentFrame++;
                }
            }
            const sx = e.currentFrame * frameCellWidth;
            const sy = e.rowIndex * frameCellHeight;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(slimeImg, sx, sy, frameCellWidth, frameCellHeight, e.x, e.y, e.drawWidth, e.drawHeight);
        }
        if (!e.isAlive()) {
            e.destroy();
            enemyS.splice(i, 1);
        }
    }
}

export function spawnEnemy() {
    const side = ["top", "right", "bottom", "left"][Math.floor(Math.random() * 4)];
    let spawnLeft, spawnTop;

    if (side === "top") {
        spawnLeft = Math.random() * (WIDTH - 40);
        spawnTop = -40; // Spawn above the canvas
        console.log("top")
    } else if (side === "right") { 
        spawnLeft = WIDTH + 40; // Spawn to the right of the canvas
        spawnTop = Math.random() * (HEIGHT - 40);
        console.log("right")
    } else if (side === "bottom") {
        spawnLeft = Math.random() * (WIDTH - 40);
        spawnTop = HEIGHT + 40; // Spawn below the canvas
        console.log("bottom")
    } else if (side === "left") {
        spawnLeft = -40; // Spawn to the left of the canvas
        spawnTop = Math.random() * (HEIGHT - 40);
        console.log("left")
    }
    let isShooter = Math.random() < 0.75;
    // compute current square position at spawn time (safe lookup)
    const squareEl = document.getElementById('square');
    const squareX = squareEl ? parseInt(squareEl.style.left, 10) : WIDTH/2;
    const squareY = squareEl ? parseInt(squareEl.style.top, 10) : HEIGHT/2;
    if(isShooter) {
        enemyS.push(new EnemyShooter(spawnLeft, spawnTop, squareX, squareY));
    } else enemies.push(new Enemy(spawnLeft, spawnTop, squareX, squareY));
}
