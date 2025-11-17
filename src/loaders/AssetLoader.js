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
            if (child.isGroup && (child.name.startsWith('prop__decor') || child.name.startsWith('prop__interactive'))) {
                child.traverse((mesh) => {
                  if (mesh.isMesh) {
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    mesh.material.side = THREE.FrontSide;
                  }
                });
              }

              if (child.name === 'room__main__atelier') {
                  child.traverse((mesh) => {
                  if (mesh.isMesh) {
                    //mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    mesh.material.side = THREE.FrontSide;
                  }
                });
              }

            if (child.name === 'light__window__area-light') {
              const dirLight = new THREE.DirectionalLight(0xffffff, 1); // color, intensity
              dirLight.position.copy(child.position);
              dirLight.target.position.set(0, 0, 0);
              dirLight.castShadow = true;

              this.scene.add(dirLight);
              this.scene.add(dirLight.target);
            }

            if (child.isLight) {
              const blenderToThreeScale = 1000; // adjust as needed
              const lightIntensity = child.intensity / blenderToThreeScale;
              
              const regex = /^light__wall/;

              child.shadow.mapSize.width = 1024;
              child.shadow.mapSize.height = 1024;
              // child.shadow.bias = -0.001; // reduce shadow acne
              // child.shadow.normalBias = 0.05; // helps on glancing angles
              child.shadow.camera.near = 0.5;
              child.shadow.camera.far = 20;

              if (child.name === 'light__ceiling__point-light') {
                child.intensity = lightIntensity * 1.8;
                child.castShadow = true;
              }

              if (regex.test(child.name)) {
                child.intensity = lightIntensity * 0.2;
              }

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