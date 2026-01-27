import * as THREE from 'three';
import garmentData from "../data/garmentData.js";
import GarmentInfoPanel from "../ui/GarmentInfoPanel.js";
import GarmentRotationHandler from './GarmentRotationHandler.js';

export default class GarmentManager {
  constructor(scene, camera, renderer, utils, modalHandler, ) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    this.utils = utils;
    
    this.modalHandler = modalHandler;
    this.cloneManager = null;
    this.garmentActionHub = null;
    this.garmentInfoPanel = null;
    this.garmentRotationHandler = null;

    this.currentActiveGarment = null;
    this.left = [];
    this.right = [];
    this.allMeshes = [];
    this.eventHandler = {};
    this.focusableBtns = [];
  }

  init() {
    // Regex to match interactive meshes
    const regex = /^prop__interactive__(.*)__(left|right)(?:__(\d+))$/;

    // Create focusable buttons container
    const uiContainerLm = document.getElementById('ui-container');
    const buttonContainerLm = document.createElement('div');
    uiContainerLm.append(buttonContainerLm);

    this.scene.traverse(obj => {
      const match = obj.name.match(regex);

      if (match) {
        const name = match[1];
        const side = match[2];
        const order = match[3] ? parseInt(match[3], 10) : 0;

        obj.userData.garmentKey = name;
        obj.userData.order = order;

        if (side === 'left') {
          this.left.push(obj);
        } 
        else if (side === 'right') {
          this.right.push(obj);
        }
      }
    });

    // Tag mesh side
    this.left.forEach(m => (m.userData.side = 'left'));
    this.right.forEach(m => (m.userData.side = 'right'));

    // Order meshes
    this.left.sort((a, b) => a.userData.order - b.userData.order);
    this.right.sort((a, b) => a.userData.order - b.userData.order);

    // Add all meshes
    this.allMeshes.push(...this.left, ...this.right);

    // Create focusable buttons based on the number of interactive meshes
    this.allMeshes.forEach(mesh => {
      // Create button
      const btn = document.createElement('button');
      btn.dataset.garmentKey = mesh.userData.garmentKey
      btn.innerText = 'See details about ' + garmentData[mesh.userData.garmentKey].title;
      btn.classList.add('aria-btn');

      // Add button 
      this.focusableBtns.push(btn);
      buttonContainerLm.append(btn);
    });

    buttonContainerLm.addEventListener('click', () => {
      this.onClick(this.currentFocusedGarment);
    });

    this.focusableBtns.forEach(btn => {
      btn.addEventListener('focus', () => this.handleButtonFocus(btn));
      btn.addEventListener('blur', () => this.handleButtonBlur(buttonContainerLm));
    });
  }

  setGarmentActionHubInstance(garmentActionHub) {
    this.garmentActionHub = garmentActionHub;
  }

  setCloneManagerInstance(cloneManager) {
    this.cloneManager = cloneManager;
  }

  getAllMeshes() {
    return this.allMeshes;
  }

  setAllMeshes(meshes) {
    // If it's an array, push all elements
    if (Array.isArray(meshes)) {
      this.allMeshes.length = 0;
      this.allMeshes.push(...meshes);
    } 
    // If it's a single mesh, push it directly
    else {
      this.allMeshes.push(meshes);
    }
  }

  getActiveGarment() {
    return this.currentActiveGarment;
  }

  handleButtonFocus(btn) {
    const newActiveMesh = this.allMeshes.find(mesh => mesh.userData.garmentKey === btn.dataset.garmentKey);

    if (this.currentFocusedGarment !== newActiveMesh) {
      // If there was a previously active mesh, fire mouse leave
      if (this.currentFocusedGarment) {
        this.onMouseLeave(this.currentFocusedGarment);
      }

      // Fire mouse enter for the new mesh
      this.onMouseEnter(newActiveMesh);

      // Update the active mesh reference
      this.currentFocusedGarment = newActiveMesh;
    }
  }

  handleButtonBlur(buttonContainerLm) {
    if (
      !buttonContainerLm.contains(document.activeElement) && 
      this.currentFocusedGarment
    ) {
      this.onMouseLeave(this.currentFocusedGarment);
      this.currentFocusedGarment = null;
    }
  }

  hideFocusableBtns() {
    this.focusableBtns.forEach(btn => {
      btn.classList.add('hidden');
    });
  }

  showFocusableBtns() {
    this.focusableBtns.forEach(btn => {
      btn.classList.remove('hidden');
    });
  }

  restoreOppositeSide() {
    // Hide garment action hub
    this.garmentActionHub.hide();

    // Reset garment rotation
    this.garmentRotationHandler.dispose();
    this.garmentRotationHandler = null;

    // Delete the current clone and show hidden
    this.cloneManager.deleteGarmentClone();
    this.cloneManager.showHiddenGarments(this.renderer.freezeShadows.bind(this.renderer));
   
    // Show garment info panel and return camera to previous position
    this.garmentInfoPanel = new GarmentInfoPanel(garmentData, this.currentActiveGarment.userData.garmentKey, this, this.modalHandler, false);
    this.camera.moveBack();
  }

  enterCloneView() {
    // Unfroze shadows
    this.renderer.unfreezeShadows();

    // Display action hub
    this.garmentActionHub.display(garmentData[this.currentActiveGarment.userData.garmentKey].longDescription);

    // Clone the active mannequin and focus camera
    this.cloneManager.cloneActiveGarment(this.getActiveGarment());
    this.focusOnActiveGarment(this.cloneManager.getActiveGarmentClone(), true, 17);

    // Close garment info panel and add rotation controls
    this.garmentInfoPanel.close({ resetPanel: false, deleteActiveGarmentRef: false });
    this.garmentRotationHandler = new GarmentRotationHandler(this.cloneManager.getActiveGarmentClone(), this.utils);
  }

  onMouseEnter(mesh) {
    mesh.userData.indicator.scale.set(1.3, 1.3, 1.3);
  }

  onMouseLeave(mesh) {
    mesh.userData.indicator.scale.set(1, 1, 1);
  }

  focusOnActiveGarment(mesh, saveHistory = true, fov = null) {
    const box = new THREE.Box3().setFromObject(mesh);
    const center = new THREE.Vector3();
    box.getCenter(center);
    center.y += 0.5;

    const targetPosition = center.clone().add(new THREE.Vector3(0, 0, 4));

    this.camera.moveTo({ 
      targetPosition: targetPosition, 
      lookAt: center, 
      saveHistory: saveHistory,
      fov: fov
    });
  }

  updateActive(name, saveHistory, focusOnActiveGarment) {
    this.resetMeshStyle(this.currentActiveGarment);
    const newActiveGarment = this.allMeshes.find(obj => obj.userData.garmentKey === name);
    this.currentActiveGarment = newActiveGarment;
    this.applyActiveMeshStyle(this.currentActiveGarment);

    if (focusOnActiveGarment) {
      this.focusOnActiveGarment(newActiveGarment, saveHistory);
    }
  }
  
  applyActiveMeshStyle(group) {
    group.userData.indicator.visible = false;
  }

  resetMeshStyle(group) {
    group.userData.indicator.visible = true;
  }

  resetActiveGarment({ resetCamera = true, deleteActiveGarmentRef = true } = {}) {
    this.garmentInfoPanel = null;
    this.resetMeshStyle(this.currentActiveGarment);
    deleteActiveGarmentRef && (this.currentActiveGarment = null); //? This argument may not be needed 
    resetCamera && this.camera.moveBack();
  }

  onClick(mesh) {
    if (this.currentActiveGarment === mesh) {
      return;
    }

    // Remove styles from the previously active garment
    if (this.currentActiveGarment) {
      this.resetMeshStyle(this.currentActiveGarment);
    }

    this.applyActiveMeshStyle(mesh); // Apply styles to the newly clicked mesh
    this.currentActiveGarment = mesh; // Update active garment reference

    // If panel is open just update the UI
    if (this.garmentInfoPanel) {
      // Update garment information and set up a new active garment
      this.garmentInfoPanel.updateGarment(garmentData[this.currentActiveGarment.userData.garmentKey], { updateSliderPos: true, garmentKey: this.currentActiveGarment.userData.garmentKey });
    }
    // Create a new UI instance
    else {
      // Update garment information and set up a new active garment
      this.garmentInfoPanel = new GarmentInfoPanel(garmentData, this.currentActiveGarment.userData.garmentKey, this, this.modalHandler);
    }
  }

  update(delta) {
    if (this.garmentRotationHandler) {
      this.garmentRotationHandler.update(delta);
    }
  }
}