import * as THREE from 'three';

export default class PointerControls {
  constructor(camera) {
    this.camera = camera;

    this.maxOffset = { x: 0.1, y: 0.05 };

    // Save full base camera position (x, y, z)
    this.basePosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    };

    this.cursor = {
      x: 0,
      y: 0
    };

    this.enabled = true;

    this._onMouseMove = this.onMouseMove.bind(this);
    window.addEventListener('mousemove', this._onMouseMove);

  }

  onMouseMove(e) {
    if (!this.enabled) return; 

    this.cursor.x = e.clientX / window.innerWidth - 0.5;
    this.cursor.y = - (e.clientY / window.innerHeight - 0.5);
  
    //this.updatePointer();
  }

  dispose() {
    window.removeEventListener('mousemove', this._onMouseMove);
  }


  resetCursor() {
    const rect = document.body.getBoundingClientRect(); // or canvas/container
    this.cursor.x = (window.mouseX || window.innerWidth / 2) / window.innerWidth - 0.5;
    this.cursor.y = -(window.mouseY || window.innerHeight / 2) / window.innerHeight + 0.5;
  }
  updatePointer() {
    if (!this.enabled) return;

    // gsap.to(this.camera.position, {
    //   x: this.basePosition.x + this.cursor.x * this.maxOffset.x,
    //   y: this.basePosition.y + this.cursor.y * this.maxOffset.y,
    //   z: this.basePosition.z, // keep z fixed
    // });


    const targetPos = new THREE.Vector3(
      this.basePosition.x + this.cursor.x * this.maxOffset.x,
      this.basePosition.y + this.cursor.y * this.maxOffset.y,
      this.basePosition.z
    );

    // lerp the camera position toward target
    this.camera.position.lerp(targetPos, 0.05); 
  }

    // Temporarily disable pointer controls
  disable() {
    this.enabled = false;
    this.dispose();
  }

  // Re-enable pointer controls
  enable() {
    this.enabled = true;
    window.addEventListener('mousemove', this._onMouseMove);
  }


  // Update base position after camera moves
  updateBasePosition() {
  
    this.cursor = {
      x: 0,
      y: 0
    };


    this.basePosition.x = this.camera.position.x;
    this.basePosition.y = this.camera.position.y;
    this.basePosition.z = this.camera.position.z;
  }

  update() {
    this.updatePointer()
  }
}