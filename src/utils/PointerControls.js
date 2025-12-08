import * as THREE from 'three';
import Utils from './Utils';

export default class PointerControls {
  constructor(camera) {
    this.camera = camera;
    this.utils = new Utils;

    this.maxOffset = { x: 0.1, y: 0.05 };
    this.eventHandler = {};

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

    this.lms = {
      portraitOverlayLm: document.getElementById('portrait-overlay')
    }

    this.enabled = true; 


    this.eventHandler.onMouseMove = this.onMouseMove.bind(this);
    this.eventHandler.onTouchMove = this.onTouchMove.bind(this);
    this.eventHandler.onOrientationChange = this.handleOrientationChange.bind(this)


    if (this.utils.isTouchBasedDevice()) {
      window.addEventListener('touchmove', this.eventHandler.onTouchMove);
      this.handleOrientationChange();
      window.addEventListener('resize', this.eventHandler.onOrientationChange);
    } 
    else {
      window.addEventListener('mousemove', this.eventHandler.onMouseMove);
    }
  }

  handleOrientationChange() {
    if (this.utils.isPortrait()) {
      this.lms.portraitOverlayLm.classList.add('active');
    } 
    else {
      this.lms.portraitOverlayLm.classList.remove('active');
    }
  }

  onMouseMove(e) {
    if (!this.enabled) return; 

    this.cursor.x = e.clientX / window.innerWidth - 0.5;
    this.cursor.y = - (e.clientY / window.innerHeight - 0.5);
  }

  onTouchMove(e) {
    if (!this.enabled) return;
    if (!e.touches || e.touches.length === 0) return;

    const touch = e.touches[0];
    this.cursor.x = touch.clientX / window.innerWidth - 0.5;
    this.cursor.y = - (touch.clientY / window.innerHeight - 0.5);
  }

  dispose() {
    window.removeEventListener('mousemove', this.eventHandler.onMouseMove);
    window.removeEventListener('touchmove', this.eventHandler.onTouchMove); 
    window.removeEventListener('resize', this.eventHandler.onOrientationChange);
  }

  updatePointer() {
    if (!this.enabled) return;

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
    if (this.utils.isTouchBasedDevice()) {
      window.addEventListener('touchmove', this.eventHandler.onTouchMove);
      this.handleOrientationChange();
      window.addEventListener('resize', this.eventHandler.onOrientationChange);
    } 
    else {
      window.addEventListener('mousemove', this.eventHandler.onMouseMove);
    }
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
    this.updatePointer();
  }
}