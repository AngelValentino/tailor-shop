import * as THREE from 'three';

export default class HoverControls {
  constructor(camera, getTargets) {
    this.camera = camera;
    this.getTargets = getTargets; // Function that returns the meshes to test
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.lastHovered = null;

    this.enabled = true;

    // Event callbacks
    this.onMouseEnter = null;
    this.onMouseLeave = null;
    this.onClick = null;

    this.uiBlocker = document.querySelector('.garment-info-panel');
    this.isOverUI = false;

    this._onMouseMove = this.#onMouseMove.bind(this);
    this._onClick = this.#onClick.bind(this); 

    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('click', this._onClick);
  }

  disable() {
    this.enabled = false;
    if (this.lastHovered && this.onMouseLeave) {
      this.onMouseLeave(this.lastHovered);
    }
    this.lastHovered = null;
  }

  enable() {
    this.enabled = true;
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

  #isOverUIPanel(e) {
    if (!this.uiBlocker) return false;
    const Lm = document.elementFromPoint(e.clientX, e.clientY);
    return Lm && this.uiBlocker.contains(Lm);
  }

  #onMouseMove(e) {
    this.isOverUI = this.#isOverUIPanel(e);
    if (this.isOverUI) return;

    this.mouse.x = e.clientX / window.innerWidth * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  #onClick(e) {
    this.isOverUI = this.#isOverUIPanel(e);
    if (this.isOverUI) return;

    if (this.lastHovered && this.onClick) {
      this.onClick(this.lastHovered);
    }
  }

  dispose() {
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('click', this._onClick);
  }

  update() {
    if (!this.enabled) return;

    if (this.isOverUI) {
      // handle leaving hover if UI is blocking
      if (this.lastHovered && this.onMouseLeave) {
        this.onMouseLeave(this.lastHovered);
      }
      this.lastHovered = null;
      return; // skip raycast this frame
    }

    const targets = this.getTargets();
    //console.log(targets);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(targets);

    //console.log(intersects)

    if (intersects.length) {
      const hit = intersects[0].object.parent;

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