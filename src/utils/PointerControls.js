import * as THREE from 'three';

export default class PointerControls {
  constructor(camera, options = {}) {
    this.camera = camera;
    this.options = options;

    this.maxOffset = options.maxOffset || { x: 0.1, y: 0.05 };
    this.smoothing = options.smoothing || 0.05;
    this.basePosition = options.basePosition || { x: 0, y: 0 };

    this.cursor = {
      x: 0,
      y: 0
    }

    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseMove(e) {
    this.cursor.x = e.clientX / window.innerWidth - 0.5;
    this.cursor.y = - (e.clientY / window.innerHeight - 0.5);
  }

  update() {
    const targetX = this.basePosition.x + this.cursor.x * this.maxOffset.x;
    const targetY = this.basePosition.y + this.cursor.y * this.maxOffset.y;

    this.camera.position.lerp(
      new THREE.Vector3(targetX, targetY, this.camera.position.z),
      this.smoothing
    );
  }
}