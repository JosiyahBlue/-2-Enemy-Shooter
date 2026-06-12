export const collectables = [];

export class Collectable {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.lifetime = 1000;
    this.visible = true;
    this.collectableFlashTimer = 0;

    this.type = type;
    this.el = document.createElement('div');
    this.el.classList.add('collectable', type);
    document.body.appendChild(this.el);
    this.updateStyle();
  }

  update() {
    this.lifetime--;
    if(this.lifetime < 500) {
        this.collectableFlashTimer++;
        const animationSpeed = Math.max(1, Math.ceil(this.lifetime / 20));
        if (this.collectableFlashTimer >= animationSpeed) {
            this.collectableFlashTimer = 0;
            if(this.visible) {
                this.visible = false;
                this.el.classList.add('hide');
            } else {
                this.visible = true;
                this.el.classList.remove('hide');
            }
        }

    }
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

export function spawnCollectable(type, x, y) {
  collectables.push(new Collectable(x, y, type));
}

export function updateCollectables() {
  const collected = [];
  for (let i = collectables.length - 1; i >= 0; i--) {
    const item = collectables[i];
    item.update();

    if (!item.isAlive()) {
        item.destroy();
        collectables.splice(i, 1);
    }

    const square = document.getElementById('square');
    if (!square) continue;
    const rect1 = square.getBoundingClientRect();
    const rect2 = item.el.getBoundingClientRect();

    if (!(rect2.right < rect1.left || rect2.left > rect1.right ||
          rect2.bottom < rect1.top || rect2.top > rect1.bottom)) {
      collected.push(item.type);
      item.destroy();
      collectables.splice(i, 1);
    }
  }

  return collected;
}