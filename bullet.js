export let bombs = [];
export let bullets = [];
export let enemyBullets = [];
let bombX = 0;
let bombY = 0;
let explodingPosX = 0;
let explodingPosY = 0;
export let mouseX = window.innerWidth / 2;
export let mouseY = window.innerHeight / 2;

document.addEventListener('mousemove' , (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

class Bullet {
    constructor(x , y , targetX , targetY) {
        this.x = x;
        this.y = y;

        this.lifetime = 100;

        const dx = targetX - x;
        const dy = targetY - y;
        const speed = 5;
        const length = Math.sqrt(dx * dx + dy * dy);

        this.vx = (dx/length) * speed;
        this.vy = (dy/length) * speed;

        this.angleR = Math.atan2(dy, dx);
        this.angle = this.angleR * (180 / Math.PI);

        this.el = document.createElement('div');
        this.el.classList.add('bullet');
        document.body.appendChild(this.el);

        this.updateStyle();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.lifetime--;

        this.updateStyle();
    }

    updateStyle() {
        this.el.style.left = `${this.x}px`;
        this.el.style.top = `${this.y}px`;
        this.el.style.transform = `translate(-50%, -50%) rotate(${this.angle}deg)`;
    }

    isAlive() {
        return this.lifetime > 0;
    }

    destroy() {
        this.el.remove();
    }
}

class EnemyBullet extends Bullet {
  constructor(x, y, targetX, targetY) {
    super(x, y, targetX, targetY);

    this.x = x;
    this.y = y;

    this.lifetime = 100;
    this.el.classList.add('enemy');

    this.updateStyle();
  }

  updateStyle() {
    this.el.style.left = `${this.x}px`;
    this.el.style.top = `${this.y}px`;
    this.el.style.transform = `translate(-50%, -50%) rotate(${this.angle}deg)`;
  }

  isAlive() {
    return this.lifetime > 0;
  }

  destroy() {
    this.el.remove();
  }
}

class BombBullet extends Bullet {
  constructor(x, y, targetX, targetY) {
    super(x, y, targetX, targetY)
    this.x = x;
    this.y = y;
    this.lifetime = 200;

    const dx = targetX - x;
    const dy = targetY - y;
    const speed = 15;
    const length = Math.sqrt(dx * dx + dy * dy);

    this.vx = (dx/length) * speed;
    this.vy = (dy/length) * speed;

    this.el.classList.add('bomb');
    this.friction = 0.94; // Friction factor for slowing down
  }

  returnPos() {
    explodingPosX = this.x
    explodingPosY = this.y
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.lifetime--;

    this.updateStyle();

    
  }

  updateStyle() {
    this.el.style.left = `${this.x}px`;
    this.el.style.top = `${this.y}px`;
  }
  
  isAlive() {
    return this.lifetime > 0;
  }

  destroy() {
    this.el.remove();
  }
}

// Animation loop only updates bullets
export function updateBullets() { 
  // update player bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    if (!b || !b.el) {
      bullets.splice(i, 1);
      continue;
    }
    if(b)
    b.update();
    if (!b.isAlive()) {
      b.destroy();
      bullets.splice(i, 1);
    }
  }

  // update enemy bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eb = enemyBullets[i];
    if (!eb || !eb.el) {
      enemyBullets.splice(i, 1);
      continue;
    }
    eb.update();
    if (!eb.isAlive()) {
      eb.destroy();
      enemyBullets.splice(i, 1);
    }
  }
  
  //update bombs
  for(let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i];
    if(!b || !b.el) {
      bombs.splice(i, 1);
      continue;
    }
    
    b.update();
    if(!b.isAlive()) {
      b.returnPos();
      explode(explodingPosX, explodingPosY);
      b.destroy();
      bombs.splice(i, 1);
    }
  }
}
const bombCooldown = 2000;
let lastBombTime = 0;
const bulletCooldown = 400;
let lastBulletTime = 0;

export function shootBullet() {
  const now = Date.now();
  if(now - lastBulletTime < bulletCooldown) {
    return;
  }
  lastBulletTime = now;
  const square = document.getElementById('square');
  const squareRect = square.getBoundingClientRect();
  const squareCenterX = squareRect.left + squareRect.width / 2;
  const squareCenterY = squareRect.top + squareRect.height / 2;
  bullets.push(new Bullet(squareCenterX, squareCenterY, mouseX, mouseY));
}

function explode(x, y) {
  bullets.push(new Bullet(x, y, x, y + 10));
  bullets.push(new Bullet(x, y, x + 10, y));
  bullets.push(new Bullet(x, y, x + 10, y - 10));
  bullets.push(new Bullet(x, y, x + 10, y + 10));

  bullets.push(new Bullet(x, y, x + 5, y + 10));
  bullets.push(new Bullet(x, y, x + 10, y + 5));
  bullets.push(new Bullet(x, y, x + 10, y - 5));
  bullets.push(new Bullet(x, y, x + 5, y - 10));

  bullets.push(new Bullet(x, y, x, y - 10));
  bullets.push(new Bullet(x, y, x - 10, y));
  bullets.push(new Bullet(x, y, x - 10, y - 10));
  bullets.push(new Bullet(x, y, x - 10, y + 10));

  bullets.push(new Bullet(x, y, x - 10, y + 5));
  bullets.push(new Bullet(x, y, x - 5, y + 10));
  bullets.push(new Bullet(x, y, x - 5, y - 10));
  bullets.push(new Bullet(x, y, x - 10, y - 5));
  
}

export function shootBomb() {
  const now = Date.now();
  if (now - lastBombTime < bombCooldown) {
    return;
  }
  lastBombTime = now;
  const square = document.getElementById('square');
  const squareRect = square.getBoundingClientRect();
  const squareCenterX = squareRect.left + squareRect.width / 2;
  const squareCenterY = squareRect.top + squareRect.height / 2;
  
  bombs.push(new BombBullet(squareCenterX, squareCenterY, mouseX, mouseY));
}

export function enemyBullet(enemyX, enemyY) {
  const square = document.getElementById('square');
  const squareRect = square.getBoundingClientRect();
  const squareCenterX = squareRect.left + squareRect.width / 2;
  const squareCenterY = squareRect.top + squareRect.height / 2;
  console.log(enemyX, enemyY, squareCenterX, squareCenterY);
  enemyBullets.push(new EnemyBullet(enemyX + 20, enemyY + 20, squareCenterX, squareCenterY));
  console.log('Bullet SHot');
}


