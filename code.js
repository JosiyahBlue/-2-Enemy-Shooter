import { updatePlayer, square } from './square.js';
import { updateBullets, bullets, enemyBullets, bombs } from './bullet.js';
import { spawnEnemy, updateEnemy } from './enemy.js';
import { updateGun } from './gun.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

export let enemies = []
export let enemyS = []

const squareStyle = window.getComputedStyle(square);

let maxHealth = 100;
let squareHealth = maxHealth;
let displayedHealth = maxHealth;
let animationFrameId = null;
let spawnEnemyintervalId = null;
let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
export let gameOver = false;
let gameState = "playing";
const restartButton = document.getElementById('restartButton');
const gameOverMessage = document.getElementById('gameOverMessage');

function destroyAllEnemies() {
    enemies.forEach(e => e.destroy());
    enemies.length = 0;
    enemyS.forEach(e => e.destroy());
    enemyS.length = 0;
}

function destroyAllProjectiles() {
    bullets.forEach(b => b.destroy());
    bullets.length = 0;
    enemyBullets.forEach(b => b.destroy());
    enemyBullets.length = 0;
    bombs.forEach(b => b.destroy());
    bombs.length = 0;
}

function gameLoop() {
    if(squareHealth <= 0) {
        gameState = "game-over";
        endGame();
    }
    if(gameState == "playing") {
        updateBullets();
        bulletEnemyCollision();
        enemyBulletPlayerCollision();
        updateEnemy();
        updatePlayer();
        updateGun();
        updateHealthBar();

        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

export function endGame() {
    gameState = "game-over";
    clearInterval(spawnEnemyintervalId);
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    destroyAllEnemies();
    destroyAllProjectiles();

    restartButton.style.visibility = 'visible';
    if (gameOverMessage) {
        gameOverMessage.style.visibility = 'visible';
    }
}

if (gameState == "playing") {
    spawnEnemyintervalId = setInterval(spawnEnemy, 2000);

    gameLoop();
}

document.getElementById('restartButton').addEventListener("click", restart);

function restart() {
    destroyAllEnemies();
    destroyAllProjectiles();
    gameState = "playing";
    squareHealth = 100;
    restartButton.style.visibility = 'hidden';
    if (gameOverMessage) {
        gameOverMessage.style.visibility = 'hidden';
    }
    spawnEnemyintervalId = setInterval(spawnEnemy, 2000);
    gameLoop();
}

function isColliding(rect1, rect2) {
    if (!(rect1.right < rect2.left || rect1.left > rect2.right || 
        rect1.bottom < rect2.top || rect1.top > rect2.bottom)) {
        return true;
    } else return false;

}

function drawHealthBar() {
    // Draw only the health bar (do not clear the canvas here — enemies are drawn elsewhere)
    const squareEl = document.getElementById('square');
    if (!squareEl) return;
    const rect = squareEl.getBoundingClientRect();

    const barWidth = 100;
    const barHeight = 10;
    const x = rect.left - 25;
    const y = rect.top - 30;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    ctx.fillStyle = "#555";
    ctx.fillRect(x, y, barWidth, barHeight);

    const healthPercent = squareHealth / maxHealth;
    const healthWidth = barWidth * healthPercent;

    if (healthPercent > 0.6) {
        ctx.fillStyle = "#4caf50";
    } else if (healthPercent > 0.3) {
        ctx.fillStyle = "#ffeb3b";
    } else {
        ctx.fillStyle = "#f44336";
    }

    if(healthWidth < 0) ctx.fillRect(x, y, 0, barHeight);
    else ctx.fillRect(x, y, healthWidth, barHeight);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);

    ctx.restore();
    }

    function updateHealthBar() {
        const speed = 1;
        displayedHealth += (squareHealth - displayedHealth) * speed;

        if (Math.abs(squareHealth - displayedHealth) < 0.1) {
            displayedHealth = squareHealth;
        }
        drawHealthBar();
    }

export function enemyPlayerCollision() {
    const squareEl = document.getElementById('square');
    if (!squareEl) return;

    const rect2 = squareEl.getBoundingClientRect();

    // enemies hitting player (existing behavior)
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (!enemy.el || !enemy) continue;
        const el = enemy.el;
        const rect1 = el.getBoundingClientRect();

        if (isColliding(rect1, rect2)) {
            console.log("💥 Collision detected!");
            squareHealth -= 50;
            console.log(`Square health: ${squareHealth}`);
            enemy.destroy();
            enemies.splice(i, 1);
        }
    }
}

export function enemyShooterPlayerCollision() {
    const squareEl = document.getElementById('square');
    if (!squareEl) return;

    const rect2 = squareEl.getBoundingClientRect();
    for(let i = enemyS.length - 1; i >= 0; i--) {
        const en = enemyS[i];

        if(!en.el || !en) continue;
        const el = en.el;
        const rect1 = el.getBoundingClientRect();
        if (isColliding(rect1, rect2)) {
            console.log("💥 Collision detected!");
            squareHealth -= 50;
            console.log(`Square health: ${squareHealth}`);
            en.destroy();
            enemyS.splice(i, 1);
        }
        
    }
}

export function bulletEnemyCollision(){
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if(!b || !b.el) {
            bullets.splice(i, 1);
            continue;
        }
        const rectB = b.el.getBoundingClientRect();
        let hit = false;

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if(!enemy || !enemy.el) continue;
            const rectE = enemy.el.getBoundingClientRect();
            if (isColliding(rectB, rectE)) {
                enemy.health -= 50;
                b.destroy();
                bullets.splice(i, 1);
                hit = true;
                if (!enemy.isAlive()) {
                    enemy.destroy();
                    enemies.splice(j, 1);
                }
                break;
            }
        }
        if (hit) continue;

        for (let j = enemyS.length - 1; j >= 0; j--) {
            const enemy = enemyS[j];
            if(!enemy || !enemy.el) continue;
            const rectE = enemy.el.getBoundingClientRect();
            if (isColliding(rectB, rectE)) {
                // hit
                enemy.health -= 50;
                b.destroy();
                bullets.splice(i, 1);
                if (!enemy.isAlive()) {
                    enemy.destroy();
                    enemyS.splice(j, 1);
                }
                break;
            }
        }
    }
}
    
export function enemyBulletPlayerCollision() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const eb = enemyBullets[i];
        if(!eb || !eb.el) {
            enemyBullets.splice(i, 1);
            continue;
        }
        const squareEl = square.getBoundingClientRect();
        const rectEB = eb.el.getBoundingClientRect();
        if (isColliding(rectEB, squareEl)) {
            // hit player
            console.log('Player hit by enemy bullet');
            squareHealth -= 5;
            eb.destroy();
            enemyBullets.splice(i, 1);
        }
    }

}
    
