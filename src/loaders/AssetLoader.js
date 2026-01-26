import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';

export default class AssetLoader {
    constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.loadingBarLm = document.querySelector('.loading-bar');
    this.loadingOverlayLm = document.getElementById('loading-overlay');
    this.domLoaderLm = document.getElementById('dom-loader');

    this.startPlaceholderAppLoader();

    this.loadingManager = new THREE.LoadingManager(
      () => this.onLoad(),
      (url, loaded, total) => this.onProgress(url, loaded, total),
      (url) => this.onError(url)
    );

    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco/');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    this.assets = {};
    this.progress = 0;
  }

  generateRandomNumberBetween(min, max) {
    // + 1 includes the max number also
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  startPlaceholderAppLoader() {
    this.domLoaderLm.classList.add('hidden');

    this.placeHolderInterval = setInterval(() => {
      if (this.progress >= 0.4) {
        return;
      }

      this.progress += 0.05;
      this.loadingBarLm.style.transform = `scaleX(${this.progress})`;

    }, this.generateRandomNumberBetween(50, 500));
  }

  onLoad() {
    // wait 500ms from the last progress call to make
    // sure the loading bar has ended
    setTimeout(() => {
      this.loadingBarLm.style.transform = '';
      this.loadingBarLm.classList.add('ended');

      // small timeout to start fading the background
      setTimeout(() => {
        this.loadingOverlayLm.classList.add('hidden');
          // after the background is fully faded, hide it from the dom 
          setTimeout(() => {
            this.loadingOverlayLm.style.display = 'none';
          }, 3000);
      }, 250);
    }, 500);
  }

  onProgress(itemUrl, itemsLoaded, itemsTotal) {
    if (this.placeHolderInterval) {
      clearInterval(this.placeHolderInterval);
      this.placeHolderInterval = null;
    }

    const progressRatio = itemsLoaded / itemsTotal;
    this.loadingBarLm.style.transform = `scaleX(${progressRatio})`;
  }

  onError(url) {
    console.error(`Failed to load: ${url}`);
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