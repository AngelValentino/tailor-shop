import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import { GUI } from 'lil-gui';
const gui = new GUI();


const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();


const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load(
  '/models/tailorshop.glb',
  (gltf) => {
    console.log(gltf)
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
    });
    scene.add(gltf.scene);
  },
  () => {
    console.log('progress');
  },
  (error) => {
    console.log(error);
  }
);

const params = {
  ambientColor: 0xbfdfff,
  ambientIntensity: 2,
  pointColor: 0xffe0b0,
  pointIntensity: 10
};

// Ambient Light
const ambientLight = new THREE.AmbientLight(params.ambientColor, params.ambientIntensity);
scene.add(ambientLight);

gui.addColor(params, 'ambientColor').onChange(value => {
  ambientLight.color.set(value);
});
gui.add(params, 'ambientIntensity', 0, 4).onChange(value => {
  ambientLight.intensity = value;
});

// Point Light
const pointLight = new THREE.PointLight(params.pointColor, params.pointIntensity, 10);
pointLight.position.set(0, 2, 0);
scene.add(pointLight);
pointLight.castShadow = true;

// Shadow settings to fix acne/artifacts
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.bias = -0.001; // reduce shadow acne
pointLight.shadow.normalBias = 0.05; // helps on glancing angles
pointLight.shadow.camera.near = 0.5;
pointLight.shadow.camera.far = 20;

gui.addColor(params, 'pointColor').onChange(value => {
  pointLight.color.set(value);
});
gui.add(params, 'pointIntensity', 0, 10).onChange(value => {
  pointLight.intensity = value;
});

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
//scene.add(pointLightHelper);

gui.add(pointLight.position, 'x', -10, 10);
gui.add(pointLight.position, 'y', 0, 10);
gui.add(pointLight.position, 'z', -10, 10);


const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 1, 4);
scene.add(camera);


// Cursor-based parallax
let cursor = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
 cursor.x = (event.clientX / window.innerWidth - 0.5);
  cursor.y = (event.clientY / window.innerHeight - 0.5);
});


const maxOffset = { x: 0.1, y: 0.05 }; // limit movement

const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

function renderLoop() {
  // Calculate target camera position based on cursor
  const targetX = cursor.x * maxOffset.x;
  const targetY = 1 - cursor.y * maxOffset.y; // base height 1
  // Smoothly interpolate
  camera.position.x += (targetX - camera.position.x) * 0.05;
  camera.position.y += (targetY - camera.position.y) * 0.05;

  // camera.lookAt(0, 1, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(renderLoop);
}

renderLoop();