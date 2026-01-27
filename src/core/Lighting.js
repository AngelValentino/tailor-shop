import * as THREE from 'three';

export default class Lighting {
  constructor(scene) {
    this.params = {
      ambientColor: 0xbfdfff,
      ambientIntensity: 0.25
    }
    this.ambient = new THREE.AmbientLight(this.params.ambientColor, this.params.ambientIntensity);

    scene.add(this.ambient);
  }
}