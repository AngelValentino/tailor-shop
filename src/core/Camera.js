import * as THREE from 'three';

export default class Camera {
  constructor(scene) {
    this.instance = new THREE.PerspectiveCamera(
      30, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      100
    );

    this.instance.position.set(0, 1.5, 4);
    scene.add(this.instance);
    this.instance.lookAt(0, 1.3, 0)

    this.defaultPosition = this.instance.position.clone();
    this.defaultLookAt = new THREE.Vector3(0, 1, 0);

    this.targetPosition = this.instance.position.clone();
    this.lookAtTarget = null;
    this.currentLookAt = new THREE.Vector3(0, 1, 0);

    this.lastPosition = this.instance.position.clone();
    this.lastLookAt = this.defaultLookAt.clone();
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
    this.lastPosition.copy(position);
    this.targetPosition.copy(position);
  }

  moveBack() {
    this.targetPosition.copy(this.lastPosition);
    this.lookAtTarget.copy(this.lastLookAt);
  }

  lookAt(position) {
    this.lastLookAt.copy(position);
    this.lookAtTarget = position.clone();
    this.instance.lookAt(this.lookAtTarget);
  }

  update() {
    const lerpFactor = 0.1; // adjust speed here
    this.instance.position.lerp(this.targetPosition, lerpFactor);

    if (this.lookAtTarget) {
      this.currentLookAt.lerp(this.lookAtTarget, lerpFactor);
      this.instance.lookAt(this.currentLookAt);

      const threshold = lerpFactor * 0.2;
      if (this.instance.position.distanceTo(this.defaultPosition) < threshold) {
          console.warn('RESET LOOK AT TARGET!');
          this.lookAtTarget = null;
      }
    }
  }
}