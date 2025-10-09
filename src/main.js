// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/Addons.js';
// import { DRACOLoader } from 'three/examples/jsm/Addons.js';
// import GUI from 'lil-gui';
// const gui = new GUI();

import App from './core/App.js';

const canvas = document.querySelector('canvas.webgl');
const app = new App(canvas);
app.init();


// const viewMoreBtn = document.getElementById('view-more-btn');

// const mannequins = {
//   left: [],
//   right: []
// };

// const roomBounds = {
//   width: 0,
//   depth: 0,
//   height: 0,
//   cols: 8,
//   rows: 8,
//   gridY: 0.01
// }

// let roomBox = null;

// let allMeshes = [];
// let lastHovered = null;
// let currentActiveMannequin = null;

// const debug = {
//   ambientColor: 0xbfdfff,
//   ambientIntensity: 2,
//   pointColor: 0xffe0b0,
//   pointIntensity: 10
// };

// const mouse = new THREE.Vector2();

// class PointerControls {
//   constructor(camera, options = {}) {
//     this.camera = camera;
//     this.options = options;

//     this.maxOffset = options.maxOffset || { x: 0.1, y: 0.05 };
//     this.smoothing = options.smoothing || 0.05;
//     this.basePosition = options.basePosition || { x: 0, y: 0 };

//     this.cursor = {
//       x: 0,
//       y: 0
//     }

//     window.addEventListener('mousemove', this.onMouseMove.bind(this));
//   }

//   onMouseMove(e) {
//     this.cursor.x = e.clientX / window.innerWidth - 0.5;
//     this.cursor.y = - (e.clientY / window.innerHeight - 0.5);
//   }

//   update() {
//     const targetX = this.basePosition.x + this.cursor.x * this.maxOffset.x;
//     const targetY = this.basePosition.y + this.cursor.y * this.maxOffset.y;

//     this.camera.position.lerp(
//       new THREE.Vector3(targetX, targetY, this.camera.position.z),
//       this.smoothing
//     );
//   }
// }

// function setViewport(camera, renderer) {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();

//   renderer.setSize(window.innerWidth, window.innerHeight);
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// }

// function handleMannequinHover() {
//   raycaster.setFromCamera(mouse, camera);
//   const intersects = raycaster.intersectObjects(allMeshes);

//   if (intersects.length) {
//     const hit = intersects[0].object;

//     if (hit !== lastHovered) {
//       // If there was a previously hovered object, trigger "mouse leave" logic
//       if (lastHovered) {
//         console.log(`Mouse left: ${lastHovered.name}`);
//         lastHovered.material.emissive.setHex(0x000000);
//       }

//       // Trigger "mouse enter" logic for the new hit object
//       console.log(`Mouse entered: ${hit.name}`);
//       hit.material.emissive.setHex(0xff0000);
//       lastHovered = hit;
//     }
//   }
//   // If no intersections are found but there was a previously hovered object
//   else if (lastHovered) {
//     console.log(`Mouse left: ${lastHovered.name}`);
//     lastHovered.material.emissive.setHex(0x000000);
//     lastHovered = null;
//   }
// }

// // loaders
// const dracoLoader = new DRACOLoader();
// dracoLoader.setDecoderPath('/draco/');

// const gltfLoader = new GLTFLoader();
// gltfLoader.setDRACOLoader(dracoLoader);

// gltfLoader.load(
//   '/models/tailorshop.glb',
//   (gltf) => {
//     console.log(gltf)
//       gltf.scene.traverse((child) => {
//         if (child.isMesh) {
//           child.castShadow = true;
//           child.receiveShadow = true;
//           child.material.side = THREE.FrontSide; 
//         }
//     });
//     scene.add(gltf.scene);

//     mannequins.left = scene.getObjectByName('mannequins-left').children;
//     mannequins.right = scene.getObjectByName('mannequins-right').children;

//     mannequins.left.forEach(mesh => mesh.userData.side = 'left');
//     mannequins.right.forEach(mesh => mesh.userData.side = 'right');

//     allMeshes.push(...mannequins.left, ...mannequins.right);

//     console.log(mannequins);

//     const roomMesh = gltf.scene.getObjectByName('room');
//     roomBox = new THREE.Box3().setFromObject(roomMesh);

//     roomBounds.width = roomBox.max.x - roomBox.min.x;
//     roomBounds.depth = roomBox.max.z - roomBox.min.z;
//     roomBounds.height = roomBox.max.y - roomBox.min.y;

//     roomBounds.cellWidth = roomBounds.width / roomBounds.cols;
//     roomBounds.cellDepth = roomBounds.depth / roomBounds.rows;

//     drawRoomGrid(roomBox);
//   }
// );

// function drawRoomGrid(roomBox) {
//   // size along X and Z
//   const width = roomBounds.width;
//   const depth = roomBounds.depth;

//   // number of divisions
//   const divisionsX = roomBounds.cols;
//   const divisionsZ = roomBounds.rows;

//   // GridHelper draws square grids, so pick the larger dimension for size
//   const size = Math.max(width, depth);
//   const divisions = Math.max(divisionsX, divisionsZ);

//   // create the grid
//   const gridHelper = new THREE.GridHelper(size, divisions, 0xff0000, 0x00ff00);
//   gridHelper.position.set(
//     (roomBox.min.x + roomBox.max.x) / 2,
//     roomBounds.gridY, // y-position
//     (roomBox.min.z + roomBox.max.z) / 2
//   );

//   scene.add(gridHelper);
// }

// const gridOrigin = {
//   x: -roomBounds.width / 2,
//   z: -roomBounds.depth / 2,
//   y: 0
// };

// function getGridPosition(col, row, options = {}) {
//   // options.flipRows: when true, row=0 is front; when false, row=0 is back.
//   if (!roomBox) return null;

//   // If your model's orientation is reversed, you can flip rows by options.flipRows = true
//   const rowIndex = options.flipRows ? (roomBounds.rows - 1 - row) : row;

//   const x = roomBox.min.x + roomBounds.cellWidth * (col + 0.5);
//   const z = roomBox.min.z + roomBounds.cellDepth * (rowIndex + 0.5);
//   const y = 0; // floor

//   return { x, y, z };
// }

// // scene
// const scene = new THREE.Scene();

// // camera
// const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
// camera.position.set(0, 1, 4);
// scene.add(camera);

// // renderer
// const canvas = document.querySelector('canvas.webgl');
// const renderer = new THREE.WebGLRenderer({
//   canvas: canvas
// });
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// renderer.shadowMap.enabled = true;

// // light
// const ambientLight = new THREE.AmbientLight(debug.ambientColor, debug.ambientIntensity);
// scene.add(ambientLight);

// const pointLight = new THREE.PointLight(debug.pointColor, debug.pointIntensity, 10);
// pointLight.position.set(0, 2, 0);
// scene.add(pointLight);
// pointLight.castShadow = true;

// pointLight.shadow.mapSize.width = 1024;
// pointLight.shadow.mapSize.height = 1024;
// pointLight.shadow.bias = -0.001; // reduce shadow acne
// pointLight.shadow.normalBias = 0.05; // helps on glancing angles
// pointLight.shadow.camera.near = 0.5;
// pointLight.shadow.camera.far = 20;

// // controls
// const pointerControls = new PointerControls(camera, { 
//   maxOffset: { x: 0.1, y: 0.05 },
//   basePosition: { x: 0, y: 1 },
//   smoothing: 0.05
// });

// // raycaster
// const raycaster = new THREE.Raycaster();

// // debug
// gui
//   .addColor(debug, 'ambientColor')
//   .onChange(value => {
//     ambientLight.color.set(value);
//   });

// gui
//   .add(ambientLight, 'intensity', 0, 5);

// gui
//   .addColor(debug, 'pointColor')
//   .onChange(value => {
//     pointLight.color.set(value);
//   });

// gui
//   .add(pointLight, 'intensity', 0, 20);

// // events
// window.addEventListener('resize', () => {
//   setViewport(camera, renderer);
// });

// window.addEventListener('mousemove', e => {
//   mouse.x = e.clientX / window.innerWidth * 2 - 1;
//   mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
// });

// function mannequinsLoaded() {
//   if (mannequins.left.length || mannequins.right.length) {
//     return true;
//   }
//   return false;
// }


// function hideMannequins(sideToHide) {
//   const hidden = [];
//   allMeshes = allMeshes.filter(mesh => {
//     if (mesh.userData.side === sideToHide) {
//       mesh.visible = false;
//       hidden.push(mesh);
//       return false; // remove from allMeshes
//     }
//     return true; // keep in allMeshes
//   });
//   return hidden;
// }

// function showMannequins(hidden) {
//   hidden.forEach(mesh => {
//     mesh.visible = true;
//     allMeshes.push(mesh);
//   });
// }

// function createMeshCloneHandler() {
//   console.log(currentActiveMannequin);

//   console.log(currentActiveMannequin.userData.side)
//   console.log(mannequinsLoaded())

//   if (mannequinsLoaded()) {
//     if (currentActiveMannequin.userData.side === 'left') {

//       console.log(allMeshes)
//       //hide right
//       const hiddenMeshes = hideMannequins('right');
//       //clone current elemnt to right
//       const clonedMannequin = currentActiveMannequin.clone();
//       clonedMannequin.geometry = currentActiveMannequin.geometry.clone();
//       clonedMannequin.material = currentActiveMannequin.material.clone();

//       scene.add(clonedMannequin);

//       const gridPos = getGridPosition(roomBounds.cols - 2, 1, {flipRows: false});
//       clonedMannequin.position.x = gridPos.x;
//       clonedMannequin.position.z = gridPos.z;
//       clonedMannequin.rotation.set(0, 0, 0); 

//       clonedMannequin.updateMatrixWorld(true);

//       console.log(gridPos)
  
//     } 
//     else {
//       const hiddenMeshes = hideMannequins('left');

//       const clonedMannequin = currentActiveMannequin.clone();
//       clonedMannequin.geometry = currentActiveMannequin.geometry.clone();
//       clonedMannequin.material = currentActiveMannequin.material.clone();

//       scene.add(clonedMannequin);

//       const gridPos = getGridPosition(1, 1, {flipRows: false});
//       clonedMannequin.position.x = gridPos.x;
//       clonedMannequin.position.z = gridPos.z;
//       clonedMannequin.rotation.set(0, 0, 0); 

//       clonedMannequin.updateMatrixWorld(true);

//       console.log(gridPos)
//     }
//   }
// }

// function toggleUiBtn() {
//   viewMoreBtn.classList.add('visible');

//   if (viewMoreBtn.classList.contains('visible')) {
//     viewMoreBtn.addEventListener('click', createMeshCloneHandler);
//   } 
//   else {
//     viewMoreBtn.removeEventListener('click', createMeshCloneHandler);
//   }
// }

// window.addEventListener('click', () => {
//   if (lastHovered) {
//     console.log(`Clicked ${lastHovered.userData.side} mannequin!`, lastHovered.name);
//     currentActiveMannequin = lastHovered;
//     toggleUiBtn();
//   }
// });

// // render loop
// function renderLoop() {
//   pointerControls.update();

//   if (allMeshes.length) {
//     handleMannequinHover();
//   }

//   renderer.render(scene, camera);
//   requestAnimationFrame(renderLoop);
// }

// renderLoop();