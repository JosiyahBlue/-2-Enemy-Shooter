import { shootBomb, shootBullet } from "./bullet.js";
import { gameState } from "./code.js";

export const square = document.getElementById('square');
const step = 2;
const keysPressed = {};
let animationFrameId = null;

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;

let shot = new Audio('assets/Sounds/Shot.wav');

const squareStyle = window.getComputedStyle(square);
export let topPos = parseFloat(squareStyle.top) || 0;
export let leftPos = parseFloat(squareStyle.left) || 0;

square.style.top = topPos + 'px';
square.style.left = leftPos + 'px';

function moveSquare() {
  if (!square) {
    console.log('Square element not found!');
    return;
  }
  if (topPos - square.clientHeight/2 > 0) if (keysPressed['w']) topPos -= step;
  if (topPos - square.clientHeight/2 < innerHeight - 40) if (keysPressed['s']) topPos += step;
  if (leftPos - square.clientWidth/2 > 0) if (keysPressed['a']) leftPos -= step;
  if (leftPos - square.clientWidth/2 < innerWidth) if (keysPressed['d']) leftPos += step;
  if (keysPressed['f']) if(shootBullet()) shot.play();
  if (keysPressed[' ']) if(shootBomb()) shot.play();

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
  if(gameState == 'playing') {
    if(e.button == 0) {
    intervalId = setInterval(mouseDownBullet, 20);
    } 
    if(e.button == 2) {
      intervalIdBomb = setInterval(mouseDownBomb, 20);
    }
  }
});

document.addEventListener('mouseup', (e) => {
  if(e.button == 0) {
    clearInterval(intervalId);
  }
  if(e.button == 2) {
    clearInterval(intervalIdBomb);
  }
})

