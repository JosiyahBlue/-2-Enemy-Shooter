import { updatePlayer, square } from './square.js';
import { updateBullets, bullets, enemyBullets, bombs, bombCount, addBomb, resetBombCount } from './bullet.js';
import { spawnEnemy, updateEnemy } from './enemy.js';
import { updateGun } from './gun.js';
import { spawnCollectable, updateCollectables } from './collectibles.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let zom1 = new Audio('assets/Sounds/ZombieHurt1.wav');
let zom2 = new Audio('assets/Sounds/ZombieHurt2.ogg');
let slimeHurt1 = new Audio('assets/Sounds/SlimeDamaged.wav');
let slimeHurt2 = new Audio('assets/Sounds/SlimeDamaged2.wav');
let pickUp = new Audio('assets/Sounds/Pickup.ogg');
let playerHurt = new Audio('assets/Sounds/PlayerHurt.wav');
let click = new Audio('assets/Sounds/Click.ogg');
let gameOverSound = new Audio('assets/Sounds/GameOver.wav');

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
export let gameState = "menu";
export let waveNumber = 0;
let waveEnemyTotal = 0;
let waveSpawnedCount = 0;
let waveSpawning = false;

const restartButton = document.getElementById('restartButton');
const menuButton = document.getElementById('menuButton');
const menuOverlay = document.getElementById('menuOverlay');
const playButton = document.getElementById('playButton');
const waveDisplay = document.getElementById('waveDisplay');
const bombCounter = document.getElementById('bombCounter');
const bombCountText = document.getElementById('bombCountText');
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
        const collected = updateCollectables();
        processCollectables(collected);
        if (!waveSpawning && enemies.length === 0 && enemyS.length === 0 && waveSpawnedCount >= waveEnemyTotal) {
            beginWave();
        }
        updateBombDisplay();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

export function endGame() {
    gameOverSound.play();
    gameState = "game-over";
    clearInterval(spawnEnemyintervalId);
    spawnEnemyintervalId = null;
    waveSpawning = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    destroyAllEnemies();
    destroyAllProjectiles();

    menuOverlay.style.display = 'none';
    menuOverlay.style.visibility = 'hidden';
    restartButton.style.visibility = 'visible';
    menuButton.style.visibility = 'visible';
    waveDisplay.style.visibility = 'hidden';
    gameOverMessage.style.visibility = 'visible';
}

document.getElementById('restartButton').addEventListener("click", function() {
    click.play();
    restart();
});
menuButton.addEventListener("click", function() {
    click.play();
    showMenu();
});
playButton.addEventListener("click", function() {
    click.play();
    startGame();
});

function showMenu() {
    gameState = "menu";
    clearInterval(spawnEnemyintervalId);
    spawnEnemyintervalId = null;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    menuOverlay.style.display = 'flex';
    menuOverlay.style.visibility = 'visible';
    restartButton.style.visibility = 'hidden';
    menuButton.style.visibility = 'hidden';
    waveDisplay.style.visibility = 'hidden';
    bombCounter.style.visibility = 'hidden';
    if (gameOverMessage) {
        gameOverMessage.style.visibility = 'hidden';
    }
}

function startGame() {
    destroyAllEnemies();
    destroyAllProjectiles();
    resetBombCount();
    squareHealth = 100;
    displayedHealth = 100;
    waveNumber = 0;
    waveEnemyTotal = 0;
    waveSpawnedCount = 0;
    waveSpawning = false;
    gameState = "playing";
    menuOverlay.style.display = 'none';
    menuOverlay.style.visibility = 'hidden';
    restartButton.style.visibility = 'hidden';
    menuButton.style.visibility = 'hidden';
    waveDisplay.style.visibility = 'visible';
    bombCounter.style.visibility = 'visible';
    if (gameOverMessage) {
        gameOverMessage.style.visibility = 'hidden';
    }
    updateBombDisplay();
    beginWave();
    gameLoop();
}

function restart() {
    startGame();
}

function updateBombDisplay() {
    if (bombCountText) {
        bombCountText.textContent = bombCount;
    }
}

function processCollectables(collected) {
    if (!collected || !collected.length) return;
    for (const type of collected) {
        if (type === 'health') {
            pickUp.play();
            squareHealth = Math.min(maxHealth, squareHealth + 30);
        } else if (type === 'bomb') {
            pickUp.play();
            addBomb(1);
            updateBombDisplay();
        }
    }
}

function updateWaveDisplay() {
    if (waveDisplay) {
        waveDisplay.textContent = `Wave ${waveNumber}`;
    }
}

function beginWave() {
    waveNumber += 1;
    const baseEnemies = 6;
    const extraPerWave = 4;
    waveEnemyTotal = baseEnemies + (waveNumber - 1) * extraPerWave;
    waveSpawnedCount = 0;
    const baseInterval = 1800;
    const decreasePerWave = 120;
    const spawnInterval = Math.max(300, baseInterval - (waveNumber - 1) * decreasePerWave);
    waveSpawning = true;
    updateWaveDisplay();
    if (spawnEnemyintervalId) {
        clearInterval(spawnEnemyintervalId);
    }
    spawnEnemyintervalId = setInterval(() => {
        if (gameState !== 'playing' || waveSpawnedCount >= waveEnemyTotal) {
            clearInterval(spawnEnemyintervalId);
            spawnEnemyintervalId = null;
            waveSpawning = false;
            return;
        }
        spawnEnemy();
        waveSpawnedCount += 1;
    }, spawnInterval);
}

showMenu();

function getHitboxRect(rect, inset = 10) {
    const xInset = Math.min(inset, rect.width / 2 - 1);
    const yInset = Math.min(inset, rect.height / 2 - 1);
    return {
        left: rect.left + xInset,
        right: rect.right - xInset,
        top: rect.top + yInset,
        bottom: rect.bottom - yInset,
    };
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

    const rect2 = getHitboxRect(squareEl.getBoundingClientRect(), 12);

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (!enemy.el || !enemy) continue;
        const el = enemy.el;
        const rect1 = getHitboxRect(el.getBoundingClientRect(), 10);

        if (isColliding(rect1, rect2)) {
            playerHurt.play();
            squareHealth -= 35;
            enemy.destroy();
            enemies.splice(i, 1);
        }
    }
}

export function enemyShooterPlayerCollision() {
    const squareEl = document.getElementById('square');
    if (!squareEl) return;

    const rect2 = getHitboxRect(squareEl.getBoundingClientRect(), 12);
    for(let i = enemyS.length - 1; i >= 0; i--) {
        const en = enemyS[i];

        if(!en.el || !en) continue;
        const el = en.el;
        const rect1 = getHitboxRect(el.getBoundingClientRect(), 16);
        if (isColliding(rect1, rect2)) {
            playerHurt.play();
            squareHealth -= 35;
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
        const rectB = getHitboxRect(b.el.getBoundingClientRect(), 4);
        let hit = false;

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if(!enemy || !enemy.el) continue;
            const rectE = getHitboxRect(enemy.el.getBoundingClientRect(), 10);
            if (isColliding(rectB, rectE)) {
                if(Math.random() < .50) {
                    zom1.play();
                } else zom2.play();

                enemy.health -= 50;
                b.destroy();
                bullets.splice(i, 1);
                hit = true;
                if (!enemy.isAlive()) {
                    if (Math.random() < 0.15) {
                        spawnCollectable('health', enemy.x + 20, enemy.y + 20);
                    } else if (Math.random() < 0.40) {
                        spawnCollectable('bomb', enemy.x, enemy.y);
                    }
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
            const rectE = getHitboxRect(enemy.el.getBoundingClientRect(), 16);
            if (isColliding(rectB, rectE)) {
                if(Math.random() < .50) {
                    slimeHurt1.play();
                } else slimeHurt2.play();

                enemy.health -= 50;
                b.destroy();
                bullets.splice(i, 1);
                if (!enemy.isAlive()) {
                    
                    if (Math.random() < 0.30) {
                        spawnCollectable('health', enemy.x + 20, enemy.y + 20);
                    } else if(Math.random() < 0.20) spawnCollectable('bomb', enemy.x, enemy.y);
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
        const squareEl = getHitboxRect(square.getBoundingClientRect(), 12);
        const rectEB = getHitboxRect(eb.el.getBoundingClientRect(), 4);
        if (isColliding(rectEB, squareEl)) {
            playerHurt.play();
            squareHealth -= 15;
            eb.destroy();
            enemyBullets.splice(i, 1);
        }
    }

}

document.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', event => {
            event.preventDefault();
        });
});

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});
document.addEventListener('selectstart', e => e.preventDefault());
