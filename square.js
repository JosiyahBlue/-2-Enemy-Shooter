import { shootBomb, shootBullet } from "./bullet.js";

export const square = document.getElementById('square');
const step = 2;
const keysPressed = {};
let animationFrameId = null;

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;

const squareStyle = window.getComputedStyle(square);
let topPos = parseFloat(squareStyle.top) || 0;
let leftPos = parseFloat(squareStyle.left) || 0;

square.style.top = topPos + 'px';
square.style.left = leftPos + 'px';

function moveSquare() {
  if (!square) {
    console.log('Square element not found!');
    return;
  }
  if (topPos - square.clientHeight/2 > 0) if (keysPressed['w']) topPos -= step;
  if (topPos - square.clientHeight/2 < innerHeight) if (keysPressed['s']) topPos += step;
  if (leftPos - square.clientWidth/2 > 0) if (keysPressed['a']) leftPos -= step;
  if (leftPos - square.clientWidth/2 < innerWidth) if (keysPressed['d']) leftPos += step;
  if (keysPressed['f']) shootBullet();
  if (keysPressed[' ']) shootBomb();

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
    // Stop animation if no arrow keys are pressed
  }
});