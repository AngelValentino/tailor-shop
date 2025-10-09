import * as THREE from 'three';

export default class HoverControls {
  constructor(camera, getTargets) {
    this.camera = camera;
    this.getTargets = getTargets; // Function that returns the meshes to test
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.lastHovered = null;

    // Event callbacks
    this.onMouseEnter = null;
    this.onMouseLeave = null;
    this.onClick = null;

    window.addEventListener('mousemove', this.#onMouseMove.bind(this));
    window.addEventListener('click', this.#onClick.bind(this));
  }

  setOnMouseEnter(callback) {
    this.onMouseEnter = callback;
  }

  setOnMouseLeave(callback) {
    this.onMouseLeave = callback;
  }

  setOnClick(callback) {
    this.onClick = callback;
  }

  #onMouseMove(e) {
    this.mouse.x = e.clientX / window.innerWidth * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  #onClick() {
    if (this.lastHovered && this.onClick) {
      this.onClick(this.lastHovered);
    }
  }

  dispose() {
    window.removeEventListener('mousemove', this.#onMouseMove);
    window.removeEventListener('click', this.#onClick);
  }

  update() {
    const targets = this.getTargets();
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(targets);

    if (intersects.length) {
      const hit = intersects[0].object;

      if (hit !== this.lastHovered) {
        // If there was a previously hovered object, trigger "mouse leave" logic
        if (this.lastHovered && this.onMouseLeave) {
          this.onMouseLeave(this.lastHovered);
        }

        // Trigger "mouse enter" logic for the new hit object
        this.lastHovered = hit;
        if (this.onMouseEnter) this.onMouseEnter(hit);
      }
    }
    // If no intersections are found but there was a previously hovered object
    else if (this.lastHovered) {
      if (this.onMouseLeave) this.onMouseLeave(this.lastHovered);
      this.lastHovered = null;
    }
  }
}