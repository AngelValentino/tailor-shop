import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';

export default class AssetLoader {
    constructor(scene) {
    this.scene = scene;

    this.gltfLoader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco/');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    this.assets = {};
  }

  loadTailorShop() {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        '/models/tailorshop.glb',
        (gltf) => {
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.material.side = THREE.FrontSide;
            }
          });

          this.scene.add(gltf.scene);
          this.assets.tailorShop = gltf.scene;
          resolve(gltf);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }
}