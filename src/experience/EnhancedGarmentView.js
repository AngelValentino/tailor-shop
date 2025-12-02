export default class EnhancedGarmentView {
  constructor(activeClone) {
    this.activeClone = activeClone;

    console.warn(activeClone)

    this.isDragging = false;
    this.lastX = 0;
    this.velocityY = 0;
    this.speed = 0.5;
    this.inertiaFactor = 0.95;

    this.onDown = this.onPointerDown.bind(this);
    this.onMove = this.onPointerMove.bind(this);
    this.onUp = this.onPointerUp.bind(this);

    window.addEventListener("mousedown", this.onDown);
    window.addEventListener("mousemove", this.onMove);
    window.addEventListener("mouseup", this.onUp);
  }

  dispose() {
    window.removeEventListener("mousedown", this.onDown);
    window.removeEventListener("mousemove", this.onMove);
    window.removeEventListener("mouseup", this.onUp);
  }

  onPointerDown(e) {
    this.isDragging = true;
    this.lastX = e.clientX;
  }

  onPointerMove(e) {
    if (!this.isDragging) return;

    const dx = e.clientX - this.lastX;
    
    this.velocityY = dx * this.speed;
    
    this.lastX = e.clientX;
  }

  onPointerUp() {
    this.isDragging = false;
  }

  update(delta) {
    if (!this.activeClone) return;

    // Apply rotation based on velocity and delta time
    this.activeClone.rotation.y += this.velocityY * delta;

    // Decay velocity for smooth inertia
    this.velocityY *= this.inertiaFactor;
  }
}