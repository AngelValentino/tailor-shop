export default class GarmentRotationHandler {
  constructor(activeClone, utils) {
    this.activeClone = activeClone;
    this.utils = utils;

    this.isDragging = false;
    this.lastX = 0;
    this.velocityY = 0;
    this.speed = 0.5;
    this.inertiaFactor = 0.95;

    if (this.utils.isTouchBasedDevice()) {
      this.speed = 0.25;
    }

    this.onDown = this.onPointerDown.bind(this);
    this.onMove = this.onPointerMove.bind(this);
    this.onUp = this.onPointerUp.bind(this);

    if (this.utils.isTouchBasedDevice()) {
      window.addEventListener("touchstart", this.onDown, { passive: false });
      window.addEventListener("touchmove", this.onMove, { passive: false });
      window.addEventListener("touchend", this.onUp);
      window.addEventListener("touchcancel", this.onUp);
    } 
    else {
      window.addEventListener("mousedown", this.onDown);
      window.addEventListener("mousemove", this.onMove);
      window.addEventListener("mouseup", this.onUp);
    }
  }

  dispose() {
    // Remove desktop listeners
    window.removeEventListener("mousedown", this.onDown);
    window.removeEventListener("mousemove", this.onMove);
    window.removeEventListener("mouseup", this.onUp);

    // Remove mobile listeners
    window.removeEventListener("touchstart", this.onDown);
    window.removeEventListener("touchmove", this.onMove);
    window.removeEventListener("touchend", this.onUp);
    window.removeEventListener("touchcancel", this.onUp);
  }

  onPointerDown(e) {
    if (this.utils.isTouchBasedDevice()) {
      if (e.touches.length !== 1) return;
    }
    const currentX = this.utils.isTouchBasedDevice() ? e.touches[0].clientX : e.clientX;
    this.isDragging = true;
    this.lastX = currentX;
  }

  onPointerMove(e) {
    if (!this.isDragging) return;

    const currentX = this.utils.isTouchBasedDevice() ? e.touches[0].clientX : e.clientX;

    const dx = currentX - this.lastX;
    const normalizedDx = dx / window.innerWidth;
    
    this.velocityY = normalizedDx * this.speed * 1000;
    
    this.lastX = currentX;

    if (this.utils.isTouchBasedDevice()) e.preventDefault(); // prevent scrolling while dragging
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