import * as THREE from 'three';

export default class Renderer {
  constructor(canvas, scene, camera) {
    this.instance = new THREE.WebGLRenderer({
      canvas: canvas
    });

    this.instance.setSize(window.innerWidth, window.innerHeight);
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.instance.shadowMap.enabled = true;

    this.scene = scene;
    this.camera = camera;
  }

  onResize() {
    this.instance.setSize(window.innerWidth, window.innerHeight);
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  render() {
    this.instance.render(this.scene, this.camera);
  }
}