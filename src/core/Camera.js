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
  }

  onResize() {
    this.instance.aspect = window.innerWidth / window.innerHeight;
    this.instance.updateProjectionMatrix();
  }
}