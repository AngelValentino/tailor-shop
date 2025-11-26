import gsap from 'gsap';
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

    this.lookAtTarget = new THREE.Vector3(0, 1.3, 0);
    this.instance.lookAt(this.lookAtTarget);
    this.animationDefaultTime = 1;

    this.history = [];
  }

  setPointerControlsInstace(pointerControls) {
    this.pointerControls = pointerControls;
  }

  onResize() {
    this.instance.aspect = window.innerWidth / window.innerHeight;
    this.instance.updateProjectionMatrix();
  }

  pushCurrentStateToHistory() {
    this.history.push({
      position: this.instance.position.clone(),
      lookAt: this.lookAtTarget.clone()
    });

  }

  moveTo({ targetPosition, lookAt = null, saveHistory = true, duration = this.animationDefaultTime }) {
    console.warn('CAMERA HOSTORY BEFORE MOVE TO: ', this.history)
    
    if (saveHistory) this.pushCurrentStateToHistory();

    console.warn('CAMERA HOSTORY AFTER MOVE TO: ', this.history)

    // Animate camera position
    gsap.to(this.instance.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: duration,
      ease: "power2.out"
    });

    // Animate lookAt target
    if (lookAt) {
      gsap.to(this.lookAtTarget, {
        x: lookAt.x,
        y: lookAt.y,
        z: lookAt.z,
        duration: duration,
        ease: "power2.out",
        onUpdate: () => {
          this.instance.lookAt(this.lookAtTarget);
        }
      });
    }
  }

  moveBack(duration = this.animationDefaultTime) {
    if (this.history.length === 0) {
      console.warn('no history');
      return;
    }

    const lastState = this.history.pop();
    this.moveTo({ 
      targetPosition: lastState.position, 
      lookAt: lastState.lookAt, 
      saveHistory: false, 
      duration: duration
    });
  }

  lookAt(position, duration = this.animationDefaultTime) {
    this.pushCurrentStateToHistory();
    gsap.to(this.lookAtTarget, {
      x: position.x,
      y: position.y,
      z: position.z,
      duration: duration,
      ease: "power2.out",
      onUpdate: () => this.instance.lookAt(this.lookAtTarget)
    });
  }

  update() {

  }
}