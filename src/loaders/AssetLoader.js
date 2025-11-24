import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';

export default class AssetLoader {
    constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

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
          gltf.scene.traverse((obj) => {
            if (obj.isGroup && (obj.name.startsWith('prop__decor') || obj.name.startsWith('prop__interactive'))) {
                obj.traverse((mesh) => {
                  if (mesh.isMesh) {
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    mesh.material.side = THREE.FrontSide;
                  }
                });
              }


              if (obj.name.startsWith('prop__interactive')) {
                const indicator = new THREE.Mesh(
                  new THREE.CircleGeometry(0.05, 32),
                  new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.6,
                    depthTest: false
                  })
                );

                const box = new THREE.Box3().setFromObject(obj);
                const center = new THREE.Vector3();
                box.getCenter(center);

                obj.worldToLocal(center);

                obj.add(indicator);
                indicator.position.copy(center);
                indicator.lookAt(this.camera.position);
                obj.userData.indicator = indicator;
              }

              if (obj.name === 'room__main__atelier') {
                  obj.traverse((mesh) => {
                  if (mesh.isMesh) {
                    //mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    mesh.material.side = THREE.FrontSide;
                  }
                });
              }

            if (obj.name === 'light__window__area-light') {
              const dirLight = new THREE.DirectionalLight(0xffffff, 1); // color, intensity
              dirLight.position.copy(obj.position);
              dirLight.target.position.set(0, 0, 0);
              dirLight.castShadow = true;

              this.scene.add(dirLight);
              this.scene.add(dirLight.target);
            }

            if (obj.isLight) {
              const blenderToThreeScale = 1000; // adjust as needed
              const lightIntensity = obj.intensity / blenderToThreeScale;
              
              const regex = /^light__wall/;

              obj.shadow.mapSize.width = 1024;
              obj.shadow.mapSize.height = 1024;
              // obj.shadow.bias = -0.001; // reduce shadow acne
              // obj.shadow.normalBias = 0.05; // helps on glancing angles
              obj.shadow.camera.near = 0.5;
              obj.shadow.camera.far = 20;

              if (obj.name === 'light__ceiling__point-light') {
                obj.intensity = lightIntensity * 1.8;
                obj.castShadow = true;
              }

              if (regex.test(obj.name)) {
                obj.intensity = lightIntensity * 0.2;
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