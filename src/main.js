import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
const gui = new GUI();

const debug = {
  ambientColor: 0xbfdfff,
  ambientIntensity: 2,
  pointColor: 0xffe0b0,
  pointIntensity: 10
};

class PointerControls {
  constructor(camera, options = {}) {
    this.camera = camera;
    this.options = options;

    this.maxOffset = options.maxOffset || { x: 0.1, y: 0.05 };
    this.smoothing = options.smoothing || 0.05;
    this.basePosition = options.basePosition || { x: 0, y: 0 };

    this.cursor = {
      x: 0,
      y: 0
    }

    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseMove(e) {
    this.cursor.x = e.clientX / window.innerWidth - 0.5;
    this.cursor.y = - (e.clientY / window.innerHeight - 0.5);
  }

  update() {
    const targetX = this.basePosition.x + this.cursor.x * this.maxOffset.x;
    const targetY = this.basePosition.y + this.cursor.y * this.maxOffset.y;

    this.camera.position.lerp(
      new THREE.Vector3(targetX, targetY, this.camera.position.z),
      this.smoothing
    );
  }
}

function setViewport(camera, renderer) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// loaders
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
  }
);

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1, 4);
scene.add(camera);

// renderer
const canvas = document.querySelector('canvas.webgl');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// light
const ambientLight = new THREE.AmbientLight(debug.ambientColor, debug.ambientIntensity);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(debug.pointColor, debug.pointIntensity, 10);
pointLight.position.set(0, 2, 0);
scene.add(pointLight);
pointLight.castShadow = true;

pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.bias = -0.001; // reduce shadow acne
pointLight.shadow.normalBias = 0.05; // helps on glancing angles
pointLight.shadow.camera.near = 0.5;
pointLight.shadow.camera.far = 20;

// controls
const pointerControls = new PointerControls(camera, { 
  maxOffset: { x: 0.1, y: 0.05 },
  basePosition: { x: 0, y: 1 },
  smoothing: 0.05
});

// debug
gui
  .addColor(debug, 'ambientColor')
  .onChange(value => {
    ambientLight.color.set(value);
  });

gui
  .add(ambientLight, 'intensity', 0, 5);

gui
  .addColor(debug, 'pointColor')
  .onChange(value => {
    pointLight.color.set(value);
  });

gui
  .add(pointLight, 'intensity', 0, 20);


// events
window.addEventListener('resize', () => {
  setViewport(camera, renderer);
});


// render loop
function renderLoop() {
  pointerControls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(renderLoop);
}

renderLoop();