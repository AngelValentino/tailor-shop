import * as THREE from 'three';
import ModalHandler from 'vanilla-aria-modals';

import Camera from './Camera.js';
import Renderer from './Renderer.js';
import Lighting from './Lighting.js';
import AssetLoader from '../loaders/AssetLoader.js';
import AtelierExperience from '../experience/AtelierExperience.js';
import RaycasterControls from '../utils/RaycasterControls.js';
import GarmentManager from '../experience/GarmentManager.js';
import Utils from '../utils/Utils.js';
import CloneManager from '../experience/CloneManager.js';
import RoomGrid from '../experience/RoomGrid.js';
import AppInfoMenu from '../ui/AppInfoMenu.js';
import GarmentActionHub from '../ui/GarmentActionHub.js';
import MenuHandler from '../ui/MenuHandler.js';

export default class App {
  constructor(canvas) {
    this.scene = new THREE.Scene();
    this.time = performance.now();

    this.camera = new Camera(this.scene);
    this.renderer = new Renderer(canvas, this.scene, this.camera.instance);
    this.lighting = new Lighting(this.scene);
    this.assetLoader = new AssetLoader(this.scene, this.camera.instance);

    // Scene init
    const utils = new Utils;
    const roomGrid = new RoomGrid(this.scene);

    const modalHandler = new ModalHandler();
    modalHandler.setDebug(true);
    const menuHandler = new MenuHandler(modalHandler);
    new AppInfoMenu(menuHandler);

    // Garment logic handler
    const garmentManager = new GarmentManager(this.scene, utils, this.camera, modalHandler);
    const garmentActionHub = new GarmentActionHub(garmentManager, modalHandler, utils, menuHandler);
    garmentManager.setGarmentActionHubInstance(garmentActionHub);
    const cloneManager = new CloneManager(this.scene, this.camera, utils, roomGrid, garmentManager);
    garmentManager.setCloneManagerInstance(cloneManager);

    // Experience
    const raycasterControls = new RaycasterControls(this.camera.instance, () => garmentManager.getAllMeshes())
    this.camera.setRaycasterControlsInstance(raycasterControls);
    this.experience = new AtelierExperience(this.scene, this.camera.instance, garmentManager, raycasterControls, roomGrid);
    
    menuHandler.setAtelierExperienceInstance(this.experience);

    this.#resizeHandler();
  }

  async init() {
    // Wait until the model is fully loaded
    try {
      await this.assetLoader.loadTailorShop();
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

  updateDelta() {
    const now = performance.now();
    const delta = (now - this.time) / 1000;
    this.time = now;

    return delta;
  }

  #loop() {
    const delta = this.updateDelta();

    this.camera.update();
    this.experience.update(delta);

    this.renderer.render();
    requestAnimationFrame(() => {
      this.#loop();
    });
  }
}