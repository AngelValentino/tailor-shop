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

export default class App {
  constructor(canvas) {
    this.scene = new THREE.Scene();

    this.camera = new Camera(this.scene);
    this.renderer = new Renderer(canvas, this.scene, this.camera.instance);
    this.lighting = new Lighting(this.scene);
    this.assetLoader = new AssetLoader(this.scene);
    
    this.pointerControls = new PointerControls(this.camera.instance, { 
      maxOffset: { x: 0.1, y: 0.05 },
      basePosition: { x: 0, y: 1 },
      smoothing: 0.05
    });

    const utils = new Utils;
    const garmentManager = new GarmentManager(this.scene, utils);
    const hoverControls = new HoverControls(this.camera.instance, () => garmentManager.getAllMeshes())
    this.experience = new TailorShopExperience(this.scene, this.camera.instance, garmentManager, hoverControls);

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
    this.pointerControls.update();
    this.experience.update()
    this.renderer.render();
    requestAnimationFrame(() => {
      this.#loop();
    });
  }
}