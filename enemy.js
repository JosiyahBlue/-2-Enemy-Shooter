import { enemyBullet } from './bullet.js';
import { endGame, enemies, enemyS, enemyPlayerCollision, enemyShooterPlayerCollision,
    bulletEnemyCollision, enemyBulletPlayerCollision,
    waveNumber} from './code.js';
let squareX = parseInt(square.style.left, 10);
let squareY = parseInt(square.style.top, 10);
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
let squareHealth = 100;
let gameOver = false;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let slimeAttack1 = new Audio('assets/Sounds/SlimeAttack.wav');
let slimeAttack2 = new Audio('assets/Sounds/SlimeAttack2.wav');
let slimeJump = new Audio('assets/Sounds/SlimeJump.wav');

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

        this.health = (waveNumber * 10) + 90;

        const dx = targetX - x;
        const dy = targetY - y;
        const speed = 2.5;
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

        this.health = (waveNumber * 15) + 90;

        const dx = targetX - x;
        const dy = targetY - y;
        this.speed = 1.5;
        const length = Math.sqrt(dx * dx + dy * dy);

        this.vx = (dx/length) * this.speed;
        this.vy = (dy/length) * this.speed;

        this.el.classList.add('shooter');
        const cs = window.getComputedStyle(this.el);
        this.drawWidth = parseFloat(cs.width) || 100;
        this.drawHeight = parseFloat(cs.height) || 100;
        this.el.style.visibility = 'hidden';
        this.el.style.pointerEvents = 'none';
        this.shotCooldown = 100;
        this.shootTimer = this.shotCooldown;
        this.shot = false;
        this.redCooldown = 0;

        this.jumpAnim = false;
        this.shootingAnim = false;
        this.idleAnim = false;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.frameDelay = 8 + Math.floor(Math.random() * 8);
        this.flipped = false;

        const cols = 10;
        const rows = 20;
        this.frameCols = cols;
        this.frameRows = rows;
        const rand = Math.floor(Math.random() * 4);
        this.colorIndex = 0;
        this.colorName = 'green';

        if (rand === 0) {
            this.colorIndex = 0;
            this.health = (waveNumber * 15) + 190;
            this.colorName = 'green';
        } else if (rand === 1) {
            this.colorIndex = 5;
            this.speed = 4;
            this.shotCooldown = 60;
            this.frameDelay = 5 + Math.floor(Math.random() * 8);
            this.colorName = 'blue';
        } else if (rand === 2) {
            this.colorIndex = 10;
            this.colorName = 'red';
        } else {
            this.colorIndex = 15;
            this.shotCooldown = 40;
            this.colorName = 'yellow';
        }

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
        const length = Math.sqrt(dx * dx + dy * dy) || 1;

        let trig = Math.hypot(dy, dx);
        
        if(this.colorName == "yellow") {
            this.maxDist = 550
            this.inRange = trig < this.maxDist + 50
        } else this.maxDist = 300;

        this.inRange = trig < this.maxDist + 20;

        if (squareX > this.x) {
            this.el.classList.add('flipped');
            this.flipped = true;
        } else {
            this.el.classList.remove('flipped');
            this.flipped = false;
        }

        if(!this.shootingAnim){
            this.rowIndex = (2 + this.colorIndex);
            if (Math.abs(trig) > this.maxDist || this.x < 0 || this.x > WIDTH) {
                this.vx = (dx / length) * this.speed;
            } else if  (Math.abs(trig) > this.maxDist - 20) {
                this.vx = 0;
            } else {
                this.vx = -(dx / length) * this.speed;
            }
            
            if (Math.abs(trig) > this.maxDist || this.y < 0 || this.y > HEIGHT - 60) {
                this.vy = (dy / length) * this.speed;
            } else if (Math.abs(trig) > this.maxDist - 20) {
                this.vy = 0;
            } else {
                this.vy = -(dy / length) * this.speed;
            }
        }

        if(this.vx == 0 && this.vy == 0 && !this.jumpAnim && !this.shootingAnim) {
            this.rowIndex = this.colorIndex;
        }

        if(this.inRange && this.y < HEIGHT - 60 && this.y > 0 && this.x > 0 && this.x < WIDTH) {
            this.shootTimer--;
             if(this.inRange && (this.shootTimer <= 0) && !this.jumpAnim) {
                this.vx = 0;
                this.vy = 0;
                this.rowIndex = (3 + this.colorIndex);
             }
        }
        if(this.redCooldown != 0) {
            this.redCooldown--;
        }
        if(this.colorName == "red") {
            if(this.shootingAnim && this.redCooldown == 0 && (this.currentFrame == 6 || this.currentFrame == 7 || this.currentFrame == 8)) {
                if(this.currentFrame == 6 && !this.shot) {
                    if(Math.random() < .50) {
                    slimeAttack1.play();
                } else slimeAttack2.play();
                    enemyBullet(this.x, this.y, this.colorName);
                    this.shootTimer = this.shotCooldown;
                    this.redCooldown = 3;
                }
            }
        }
        else if(this.colorName == "yellow") {
            if(this.shootingAnim) {
                this.frameDelay = 4;
                if(this.shootingAnim && this.currentFrame == 6 && !this.shot) {
                    if(Math.random() < .50) {
                    slimeAttack1.play();
                } else slimeAttack2.play();
                    enemyBullet(this.x, this.y, this.colorName);
                    this.shootTimer = this.shotCooldown;
                    this.shot = true;
                }
            } else {
                this.frameDelay = 8 + Math.floor(Math.random() * 8);
            }
        }
        else if(this.shootingAnim && this.currentFrame == 6 && !this.shot) {
            if(Math.random() < .50) {
                    slimeAttack1.play();
                } else slimeAttack2.play();
            enemyBullet(this.x, this.y, this.colorName);
            this.shootTimer = this.shotCooldown;
            this.shot = true;
        }

        if(this.jumpAnim && this.currentFrame == 8) {
            slimeJump.play();
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
                    if(e.rowIndex == (2 + e.colorIndex)) e.jumpAnim = false;
                    if(e.rowIndex == (3 + e.colorIndex)) e.shootingAnim = false;
                    e.shot = false;
                }
                else {
                    if(e.rowIndex == (2 + e.colorIndex)) e.jumpAnim = true;
                    if(e.rowIndex == (3 + e.colorIndex)) e.shootingAnim = true;
                    e.currentFrame++;
                }
            }
            const sx = e.currentFrame * frameCellWidth;
            const sy = e.rowIndex * frameCellHeight;
            ctx.imageSmoothingEnabled = false;
            if (e.flipped) {
                ctx.save();
                ctx.translate(e.x + e.drawWidth, e.y);
                ctx.scale(-1, 1);
                ctx.drawImage(slimeImg, sx, sy, frameCellWidth, frameCellHeight, 0, 0 - 35, e.drawWidth, e.drawHeight);
                ctx.restore();
            } else {
                ctx.drawImage(slimeImg, sx, sy, frameCellWidth, frameCellHeight, e.x, e.y - 35, e.drawWidth, e.drawHeight);
            }
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
    let isShooter = Math.random() < 0.45;
    const squareEl = document.getElementById('square');
    const squareX = squareEl ? parseInt(squareEl.style.left, 10) : WIDTH/2;
    const squareY = squareEl ? parseInt(squareEl.style.top, 10) : HEIGHT/2;
    if(isShooter) {
        enemyS.push(new EnemyShooter(spawnLeft, spawnTop, squareX, squareY));
    } else enemies.push(new Enemy(spawnLeft, spawnTop, squareX, squareY));
}
