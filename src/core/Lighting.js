import * as THREE from 'three';

export default class Lighting {
  constructor(scene) {
    this.params = {
      ambientColor: 0xbfdfff,
      ambientIntensity: 0.25,
      pointColor: 0xffe0b0,
      pointIntensity: 10
    }
    this.ambient = new THREE.AmbientLight(this.params.ambientColor, this.params.ambientIntensity);

    this.point = new THREE.PointLight(this.params.pointColor, this.params.pointIntensity, 10);
    this.point.position.set(0, 2, 0);
    this.#setupPointLight(this.point);

    scene.add(this.ambient);
    //scene.add(this.point);
  }

  #setupPointLight(light) {
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.bias = -0.001; // reduce shadow acne
    light.shadow.normalBias = 0.05; // helps on glancing angles
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 20;
  }
}