import { shootBomb, shootBullet } from "./bullet.js";
import { gameState, innerHeight } from "./code.js";

export const square = document.getElementById('square');
const step = 2;
const keysPressed = {};
let animationFrameId = null;
const dashStep = 10;
const maxDashDuration = 15;
let dashDuration = maxDashDuration;
let dashCooldown = 200;
let extraDashCooldown = 15;
let dashBlocked = false;
let dashSound = new Audio('assets/Sounds/Swoosh.wav');

let innerWidth = window.innerWidth;

let shot = new Audio('assets/Sounds/Shot.wav');

const squareStyle = window.getComputedStyle(square);
export let topPos = parseFloat(squareStyle.top) || 0;
export let leftPos = parseFloat(squareStyle.left) || 0;

square.style.top = topPos + 'px';
square.style.left = leftPos + 'px';

export function updateDash() {
  if(dashDuration < maxDashDuration) {
    dashDuration += maxDashDuration / dashCooldown;
    console.log(dashDuration);
    if(extraDashCooldown > 15) {
      extraDashCooldown++;
    }
  } else extraDashCooldown = 15;
  if(extraDashCooldown >= 14) dashBlocked = false;
}

function moveSquare() {
  if (!square) {
    console.log('Square element not found!');
    return;
  }

  if(dashDuration <= 0) {
    dashBlocked = true;
  }

  if (topPos - square.clientHeight/2 > 0 && keysPressed['w'] && keysPressed[' '] && dashDuration > 0 && !dashBlocked) {
    dashSound.play();
    topPos -= dashStep;
    dashDuration--;
    extraDashCooldown = 0;

  } else if(topPos - square.clientHeight/2 > 0 && keysPressed['w']) topPos -= step;
  if (topPos - square.clientHeight/2 < innerHeight - 40 && keysPressed['s'] && keysPressed[' '] && dashDuration > 0 && !dashBlocked) {
    dashSound.play();
    topPos += dashStep;
    dashDuration--;
    extraDashCooldown = 0;
  } else if(topPos - square.clientHeight/2 < innerHeight - 40 && keysPressed['s']) topPos += step;
  if (leftPos - square.clientWidth/2 > 0 && keysPressed['a'] && keysPressed[' '] && dashDuration > 0 && !dashBlocked) {
    leftPos -= dashStep;
    if(!keysPressed['w'] && !keysPressed['s']) {
      dashDuration--;
      dashSound.play();
      extraDashCooldown = 0;
    };
  } else if (leftPos - square.clientWidth/2 > 0 && keysPressed['a']) leftPos -= step;
  if (leftPos - square.clientWidth/2 < innerWidth &&  keysPressed['d'] && keysPressed[' '] && dashDuration > 0 && !dashBlocked) {
    leftPos += dashStep;
    if(!keysPressed['w'] && !keysPressed['s']) {
      dashDuration--;
      dashSound.play();
      extraDashCooldown = 0;
    };
  } else if (leftPos - square.clientWidth/2 < innerWidth && keysPressed['d']) leftPos += step;

  if (keysPressed['f']) if(shootBullet()) shot.play();

  square.style.top = topPos + 'px';
  square.style.left = leftPos + 'px';
}

export function updatePlayer() {
  moveSquare();
}

// Movement event listeners
document.addEventListener('keydown', (e) => {
  if (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd' || e.key === 'f' || e.key === ' ') {
    keysPressed[e.key] = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd' || e.key === ' ' || e.key === 'f') {
    keysPressed[e.key] = false;
  }
});

function mouseDownBullet() {
  if(shootBullet()) {
    shot.play();
  }
}

function mouseDownBomb() {
  if(shootBomb()) {
    shot.play();
  }
}

let intervalId = null;
let intervalIdBomb = null;
document.addEventListener('mousedown', (e) => {
  if(gameState){if(gameState == 'playing') {
    if(e.button == 0) {
    intervalId = setInterval(mouseDownBullet, 20);
    } 
    if(e.button == 2) {
      intervalIdBomb = setInterval(mouseDownBomb, 20);
    }
  }}
});

document.addEventListener('mouseup', (e) => {
  if(e.button == 0) {
    clearInterval(intervalId);
  }
  if(e.button == 2) {
    clearInterval(intervalIdBomb);
  }
})

