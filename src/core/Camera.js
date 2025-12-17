import gsap from 'gsap';
import * as THREE from 'three';
import PointerControls from '../utils/PointerControls';

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

    this.cameraDefaultPos = this.instance.position.clone();

    this.lookAtTarget = new THREE.Vector3(0, 1.3, 0);
    this.instance.lookAt(this.lookAtTarget);
    this.animationDefaultTime = 0.8;

    this.history = [];

    this.pointerControlsStatus = true;

    this.pointerControls = new PointerControls(this.instance);

  }

  onResize() {
    this.instance.aspect = window.innerWidth / window.innerHeight;
    this.instance.updateProjectionMatrix();
  }

  setRaycasterControlsInstance(raycasterControls) {
    this.raycasterControls = raycasterControls;
  }

  pushCurrentStateToHistory() {
    // Check if pointer controls are active and get the default camera position
    if (this.history.length === 0) {
      this.history.push({
        position: this.cameraDefaultPos.clone(),
        lookAt: this.lookAtTarget.clone(),
        fov: this.instance.fov
      });
      console.warn('pushing default camera position to history')
    // Else we can safely push the current camera position as no pointer controls are active
    } else {
      this.history.push({
        position: this.instance.position.clone(),
        lookAt: this.lookAtTarget.clone(),
        fov: this.instance.fov
      });
    }
  }

  updatePointerState() {
    if (this.history.length > 0) {
      if (this.pointerControlsStatus) this.pointerControls.disable();
      console.warn('disable pointer')
    } 
    else {
      if (this.pointerControlsStatus) this.pointerControls.enable();
      console.warn('enable pointer')
    }
  }

  moveTo({ 
    targetPosition, 
    lookAt = null, 
    saveHistory = true, 
    duration = this.animationDefaultTime,
    fov = null
  }) {
    console.warn('CAMERA HOSTORY BEFORE MOVE TO: ', this.history)
    document.body.style.pointerEvents = 'none';
    this.raycasterControls.disable();

    if (saveHistory) {
      this.pushCurrentStateToHistory();
      this.updatePointerState();
    };

    if (this.pointerControlsStatus) this.pointerControls.disable();
    console.warn('CAMERA HISTORY AFTER MOVE TO: ', this.history)

    // Animate camera position
    gsap.to(this.instance.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: duration,
      ease: "power2.out",
      overwrite: "auto",
      onComplete: () => {
        if (this.pointerControlsStatus) this.pointerControls.updateBasePosition();
        if (this.pointerControlsStatus) this.updatePointerState();
        document.body.style.pointerEvents = 'auto';
        this.raycasterControls.enable();
      }
    });

    // Animate lookAt target
    if (lookAt) {
      gsap.to(this.lookAtTarget, {
        x: lookAt.x,
        y: lookAt.y,
        z: lookAt.z,
        duration: duration,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: () => {
          this.instance.lookAt(this.lookAtTarget);
        }
      });
    }

    // Animate FOV (zoom)
    if (fov) {
      gsap.to(this.instance, {
        fov,
        duration,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: () => this.instance.updateProjectionMatrix()
      });
    }
  }

  moveBack(duration = this.animationDefaultTime) {
    if (this.history.length === 0) {
      console.warn('no history');
      return;
    }

    const lastState = this.history.pop();

    this.updatePointerState();
    
    this.moveTo({ 
      targetPosition: lastState.position, 
      lookAt: lastState.lookAt, 
      fov: lastState.fov,
      saveHistory: false, 
      duration: duration
    });
  }

  update() {
    if (this.pointerControlsStatus) this.pointerControls.update()
  }
}