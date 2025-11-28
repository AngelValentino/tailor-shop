import * as THREE from 'three';
import Camera from './Camera.js';
import Renderer from './Renderer.js';
import Lighting from './Lighting.js';
import AssetLoader from '../loaders/AssetLoader.js';
import PointerControls from '../utils/PointerControls.js';
import TailorShopExperience from '../experience/TailorShopExperience.js';
import HoverControls from '../utils/HoverControls.js';
import GarmentManager from '../experience/GarmentManager.js';
import Utils from '../utils/Utils.js';
import CloneManager from '../experience/CloneManager.js';
import RoomGrid from '../experience/RoomGrid.js';

export default class App {
  constructor(canvas) {
    this.scene = new THREE.Scene();

    this.camera = new Camera(this.scene);
    this.renderer = new Renderer(canvas, this.scene, this.camera.instance);
    this.lighting = new Lighting(this.scene);
    this.assetLoader = new AssetLoader(this.scene, this.camera.instance);

    const utils = new Utils;
    const roomGrid = new RoomGrid(this.scene);
    const cloneManager = new CloneManager(this.scene, this.camera, utils, roomGrid);
    const garmentManager = new GarmentManager(this.scene, utils, this.camera, cloneManager);
    const hoverControls = new HoverControls(this.camera.instance, () => garmentManager.getAllMeshes())
    this.camera.setHoverControlsInstance(hoverControls);
    this.experience = new TailorShopExperience(this.scene, this.camera.instance, garmentManager, hoverControls, roomGrid);
    garmentManager.setTailorShopExperienceInstance(this.experience);
    cloneManager.setGarmentManagerInstance(garmentManager);

    this.#resizeHandler();
  }

  async init() {
    // Wait until the model is fully loaded
    try {
      await this.assetLoader.loadTailorShop();
      console.log('Tailor shop ready!');
    } 
    catch (err) {
      console.error('Error loading assets:', err);
    }

    // Continue app logic
    this.experience.init();

    this.#loop();
  }

  #resizeHandler() {
    window.addEventListener('resize', () => {
      this.camera.onResize();
      this.renderer.onResize();
    });
  }

  #loop() {
    this.experience.update()

    // Update garment manager (camera movement)
    this.camera.update();

    this.renderer.render();
    requestAnimationFrame(() => {
      this.#loop();
    });
  }
}