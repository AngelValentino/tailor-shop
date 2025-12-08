import * as THREE from 'three';
import Utils from './Utils';

export default class HoverControls {
  constructor(camera, getTargets) {
    this.camera = camera;
    this.getTargets = getTargets; // Function that returns the meshes to test
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.utils = new Utils;

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
    
    this._onTouchMove = this.#onTouchMove.bind(this);
    this._onTouchStart = this.#onTouchStart.bind(this);

    // Desktop
    if (!this.utils.isTouchBasedDevice()) {
      window.addEventListener('mousemove', this._onMouseMove);
      window.addEventListener('click', this._onClick);
    } 
    // Mobile
    else {
      window.addEventListener('touchstart', this._onTouchStart);
      window.addEventListener('touchmove', this._onTouchMove);
      window.addEventListener('touchend', this._onClick); // treat tap as click
    }
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

  dispose() {
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('click', this._onClick);

    window.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchmove', this._onTouchMove);
    window.removeEventListener('touchend', this._onClick);
  }


  #isOverUIPanel(e) {
    if (!this.uiBlocker) return false;
    const x = e.clientX;
    const y = e.clientY;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;

    const element = document.elementFromPoint(x, y);
    return element && this.uiBlocker.contains(element);
  }

  #onTouchStart(e) {
    if (e.touches.length > 0) {
      this.mouse.x = e.touches[0].clientX / window.innerWidth * 2 - 1;
      this.mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      this.isOverUI = this.#isOverUIPanel(e.touches[0]);
    }
  }

  #onTouchMove(e) {
    if (e.touches.length > 0) {
      this.mouse.x = e.touches[0].clientX / window.innerWidth * 2 - 1;
      this.mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      this.isOverUI = this.#isOverUIPanel(e.touches[0]);
    }
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
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(targets);

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