import * as THREE from 'three';
import garmentInfoCollection from "../data/garmentInfoCollection";
import GarmentInfoPanel from "../ui/GarmentInfoPanel";

export default class GarmentManager {
  constructor(scene, utils, camera) {
    this.scene = scene;

    this.utils = utils;
    this.camera = camera;
    this.tailorShopExperience = null;

    this.currentActiveGarment = null;
    this.currentActiveClone = null;
    this.left = [];
    this.right = [];
    this.allMeshes = [];
    this.hidden = [];
    this.hiddenSide = null;
    this.currentSide = null;
  }

  setTailorShopExperienceInstance(tailorShopExperience) {
    this.tailorShopExperience = tailorShopExperience;
  }

  init() {
    const leftGroup = this.scene.getObjectByName('mannequins-left');
    const rightGroup = this.scene.getObjectByName('mannequins-right');

    console.log(leftGroup)

    this.left = leftGroup ? leftGroup.children : [];
    this.right = rightGroup ? rightGroup.children : [];

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

  computeCollectionCenter(side, mesh) {
    const meshes = [];
    
    if (mesh) {
      meshes.push(mesh);
    } 
    else {
      const sideMeshes = side === 'left' ? this.left : this.right
      meshes.push(...sideMeshes);
    }

    if (!meshes || meshes.length === 0) return new THREE.Vector3();

    const center = new THREE.Vector3();
    meshes.forEach(mesh => center.add(mesh.position));
    center.divideScalar(meshes.length); // average position
    return center;
  }

  computeCollectionAvgHeight(side, mesh) {
    const meshes = [];

    if (mesh) {
      meshes.push(mesh)
    } 
    else {
      const sideMeshes = side === 'left' ? this.left : this.right;
      meshes.push(...sideMeshes);
    }

    if (!meshes || meshes.length === 0) return 0;

    let sum = 0;
    meshes.forEach(m => sum += m.position.y);
    return sum / meshes.length;
  }

  cloneActiveMannequin() {
    if (!this.getActiveMannequin()) return null;

    const currentActiveMannequin = this.getActiveMannequin();
    const side = currentActiveMannequin.userData.side;
    const opposite = side === 'left' ? 'right' : 'left';
    const targetCol = side === 'left' ? this.tailorShopExperience.roomBounds.cols - 2 : 1;
    const targetRow = side === 'left' ? 1 : 1;
    const gridPos = this.tailorShopExperience.getGridPosition(targetCol, targetRow)
    
    const cloned = this.cloneMannequin(currentActiveMannequin);
    if (!cloned) return;
    console.log('hide', opposite);
    this.hideSide(opposite);
    console.log('position new clone')
    cloned.position.x = gridPos.x;
    cloned.position.z = gridPos.z;
    cloned.rotation.set(0, 0, 0); 

    cloned.updateMatrixWorld(true);

    console.log('Cloning side:', side);
    console.log('Opposite hidden:', opposite);
    console.log('Clone position:', cloned.position);
    console.log('Clone visible:', cloned.visible);

    console.log('roomBox:', this.tailorShopExperience.roomBox);
    console.log('cellWidth:', this.tailorShopExperience.roomBounds.cellWidth);
    console.log('gridPos:', gridPos);
  }

  restoreOppositeSide() {
    // delete the curernt clone
    this.deleteActiveClone();
    // set up the stored hidden meshes
    this.showHidden();
    //? hide UI
    //? restore camera position
  }

  handleCloneInteraction() {
    this.cloneActiveMannequin();
    console.log(this.currentActiveClone)
    this.focusOnCollection(null, this.currentActiveClone);
    this.garmentInfoPanel.close({ resetCamera: false });
    // store position in camera to resotre back again
  }


  getActiveMannequin() {
    return this.currentActiveGarment;
  }

  getAllMeshes() {
    return this.allMeshes;
  }

  hideSide(side) {
    if (this.hiddenSide === side) {
      console.warn(`Side '${side}' is already hidden — skipping hideSide.`);
      return;
    }

    this.hidden.length = 0
    this.allMeshes = this.allMeshes.filter(mesh => {
      if (mesh.userData.side === side) {
        mesh.visible = false;
        this.hidden.push(mesh);
        return false; // remove from allMeshes
      }
      return true; // keep in allMeshes
    });

    this.hiddenSide = side;
    console.log(`Hid ${this.hidden.length} meshes on side '${side}'`);
  }

  showHidden() {
    if (!this.hiddenSide || this.hidden.length === 0) {
      console.warn('showHidden() called but nothing is hidden — skipping.');
      return;
    }
    console.log(this.hidden)
    this.hidden.forEach(mesh => {
      mesh.visible = true;
      this.allMeshes.push(mesh);
    });

    console.log(`Restored ${this.hidden.length} meshes from side '${this.hiddenSide}'`);
    this.hidden.length = 0;
    this.hiddenSide = null;
  }

  deleteActiveClone() {
    console.log('deleted', this.currentActiveGarment)
    if (this.currentActiveClone) {
      console.log('last mesh', this.currentActiveClone)
      this.utils.removeMesh(this.currentActiveClone, this.scene);
      this.currentActiveClone = null;
    }
  }

  cloneMannequin(mesh) {
    if (this.currentActiveClone && this.currentActiveClone.userData.original === mesh) {
      console.log('Clone already exists!');
      return;
    }

    this.deleteActiveClone();

    this.currentActiveClone = mesh.clone();
    // clone geometry/material references so we don't mutate originals
    if (mesh.geometry) this.currentActiveClone.geometry = mesh.geometry.clone();
 
    if (mesh.material) {
      this.currentActiveClone.material = Array.isArray(mesh.material)
        ? mesh.material.map(m => m.clone())
        : mesh.material.clone();
    }

    // Mark the clone with a reference to the original mesh
    this.currentActiveClone.userData = { ...mesh.userData, original: mesh };
    this.scene.add(this.currentActiveClone);
    return this.currentActiveClone;
  }

  onMouseEnter(mesh) {
    console.log(`Mouse entered: ${mesh.name}`);
    mesh.scale.set(1.05, 1.05, 1.05);
  }

  onMouseLeave(mesh) {
    console.log(`Mouse left: ${mesh.name}`);
    mesh.scale.set(1, 1, 1);
  }

  focusOnCollection(side, mesh) {
    const center = this.computeCollectionCenter(side, mesh);
    const avgHeight = this.computeCollectionAvgHeight(side, mesh);

    // Offset in front of collection
    const cameraOffset = new THREE.Vector3(0, 0, 4);
    const targetPos = center.clone();
    targetPos.y = avgHeight;
    targetPos.add(cameraOffset);

    this.camera.moveTo(targetPos);
    this.camera.lookAt(center);

    this.currentSide = side; // track currently focused side
  }

  updateActive(name) {
    this.resetMeshStyle(this.currentActiveGarment);
    const newActiveMesh = this.allMeshes.find(obj => obj.name === name);
    this.currentActiveGarment = newActiveMesh;
    this.applyActiveMeshStyle(this.currentActiveGarment);

    console.warn('ACTIVE:', this.currentActiveGarment)

    // Focus camera only if side changes
    if (newActiveMesh.userData.side !== this.currentSide) {
      this.focusOnCollection(newActiveMesh.userData.side);
    }
  }

  applyActiveMeshStyle(mesh) {
    if (mesh.material && mesh.material.emissive) {
      // Store original emissive to restore later
      mesh.userData.originalEmissive = mesh.material.emissive.clone();
      mesh.material.emissive.setHex(0xff0000); // hover-like glow
    }
  }

  resetMeshStyle(mesh) {
    if (mesh.material && mesh.userData.originalEmissive) {
      mesh.material.emissive.copy(mesh.userData.originalEmissive);
      delete mesh.userData.originalEmissive;
    }
  }

  resetActiveGarment({ resetCamera = true } = {}) {
    this.garmentInfoPanel = null;
    this.resetMeshStyle(this.currentActiveGarment);
    this.currentActiveGarment = null;
    resetCamera && this.camera.reset();
    this.currentSide = null;
  }

  onClick(mesh) {
    console.log(`Clicked ${mesh.userData.side} mannequin!`, mesh.name);

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
      this.garmentInfoPanel.updateGarment(garmentInfoCollection[this.currentActiveGarment.name], { updateSliderPos: true, collection: this.currentActiveGarment.name });
    }
    // Create a new UI instance
    else {
      console.warn('new garment info panel instance')
      // Update garment information and set up a new active garment
      this.garmentInfoPanel = new GarmentInfoPanel(garmentInfoCollection, this.currentActiveGarment.name, this);

      // TODO Move to clone and close UI
      // TODO Return from cloning view to former side before stored, and open the UI again
    }
  }
}