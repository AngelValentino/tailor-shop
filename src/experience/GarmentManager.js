import * as THREE from 'three';
import garmentData from "../data/garmentData.js";
import GarmentInfoPanel from "../ui/GarmentInfoPanel.js";
import GarmentRotationHandler from './GarmentRotationHandler.js';

export default class GarmentManager {
  constructor(scene, utils, camera) {
    this.scene = scene;

    this.utils = utils;
    this.camera = camera;
    this.cloneManager = null;
    this.garmentActionHub = null;
    this.garmentInfoPanel = null;
    this.garmentInfoMenu = null;
    this.garmentRotationHandler = null;

    this.currentActiveGarment = null;
    this.left = [];
    this.right = [];
    this.allMeshes = [];
    this.eventHandler = {};
  }

  init() {
    const regex = /^prop__interactive__(.*)__(left|right)$/;

    this.scene.traverse(obj => {
      const match = obj.name.match(regex);

      if (match) {
        const name = match[1];
        const side = match[2];

        obj.userData.garmentKey = name;

        console.log(side)

        if (side === 'left') {
          this.left.push(obj);
        } 
        else if (side === 'right') {
          this.right.push(obj);
        }
      }

    })
    // tag userData and create global list
    this.left.forEach(m => (m.userData.side = 'left'));
    this.right.forEach(m => (m.userData.side = 'right'));

    this.allMeshes.push(...this.left, ...this.right);

    console.log(this.allMeshes)
    return {
      left: this.left,
      right: this.right,
      all: this.allMeshes
    };
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

  restoreOppositeSide() {
    // Hide garment action hub
    this.garmentActionHub.hide();

    // Reset garment rotation
    this.garmentRotationHandler.dispose();
    this.garmentRotationHandler = null;

    // Delete the current clone and show hidden
    this.cloneManager.deleteGarmentClone();
    this.cloneManager.showHiddenGarments();
   
    // Show garment info panel and return camera to previous position
    this.garmentInfoPanel = new GarmentInfoPanel(garmentData, this.currentActiveGarment.userData.garmentKey, this, false);
    this.camera.moveBack();

  }

  enterCloneView() {
    console.warn('enter clone view')

    // Display action hub
    this.garmentActionHub.display(garmentData[this.currentActiveGarment.userData.garmentKey].longDescription);

    // Clone the active mannequin and focus camera
    this.cloneManager.cloneActiveGarment(this.getActiveGarment());
    this.focusOnActiveGarment(this.cloneManager.getActiveGarmentClone(), true, 17);

    // Close garment info panel and add rotation controls
    this.garmentInfoPanel.close({ resetCamera: false, deleteActiveGarmentRef: false });
    this.garmentRotationHandler = new GarmentRotationHandler(this.cloneManager.getActiveGarmentClone(), this.utils);
  }

  onMouseEnter(mesh) {
    console.log(`Mouse entered: ${mesh.userData.garmentKey}`);
    mesh.userData.indicator.scale.set(1.3, 1.3, 1.3);
  }

  onMouseLeave(mesh) {
    console.log(`Mouse left: ${mesh.userData.garmentKey}`);
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

    console.warn('HISTORY', saveHistory)
  }

  updateActive(name, saveHistory, focusOnActiveGarment) {
    this.resetMeshStyle(this.currentActiveGarment);
    const newActiveGarment = this.allMeshes.find(obj => obj.userData.garmentKey === name);
    this.currentActiveGarment = newActiveGarment;
    this.applyActiveMeshStyle(this.currentActiveGarment);

    console.warn('ACTIVE:', this.currentActiveGarment)
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
    console.warn(`Clicked ${mesh.userData.side}!`, mesh.userData.garmentKey);

    if (this.currentActiveGarment === mesh) {
      console.warn('same mesh!')
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
      console.warn('update garment info panel instance')
      // Update garment information and set up a new active garment
      this.garmentInfoPanel.updateGarment(garmentData[this.currentActiveGarment.userData.garmentKey], { updateSliderPos: true, garmentKey: this.currentActiveGarment.userData.garmentKey });
    }
    // Create a new UI instance
    else {
      console.warn('new garment info panel instance')
      // Update garment information and set up a new active garment
      this.garmentInfoPanel = new GarmentInfoPanel(garmentData, this.currentActiveGarment.userData.garmentKey, this);
    }
  }

  update(delta) {
    if (this.garmentRotationHandler) {
      this.garmentRotationHandler.update(delta);
    }
  }
}