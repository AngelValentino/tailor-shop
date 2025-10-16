import * as THREE from 'three';

export default class Camera {
  constructor(scene) {
    this.instance = new THREE.PerspectiveCamera(
      35, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      100
    );

    this.instance.position.set(0, 1, 4);
    scene.add(this.instance);

    this.defaultPosition = this.instance.position.clone();
    this.defaultLookAt = new THREE.Vector3(0, 1, 0);

    this.targetPosition = this.instance.position.clone();
    this.lookAtTarget = null;
    this.currentLookAt = new THREE.Vector3(0, 1, 0);
  }

  onResize() {
    this.instance.aspect = window.innerWidth / window.innerHeight;
    this.instance.updateProjectionMatrix();
  }

    reset() {
  this.targetPosition.copy(this.defaultPosition);
  this.lookAtTarget.copy(this.defaultLookAt);
  }

  moveTo(position) {
    this.targetPosition.copy(position);
  }

  lookAt(position) {
    this.lookAtTarget = position.clone();
    this.instance.lookAt(this.lookAtTarget);
  }

  update() {
    const lerpFactor = 0.1; // adjust speed here
    this.instance.position.lerp(this.targetPosition, lerpFactor);

    if (this.lookAtTarget) {
      this.currentLookAt.lerp(this.lookAtTarget, lerpFactor);
      this.instance.lookAt(this.currentLookAt);
    }
  }
}