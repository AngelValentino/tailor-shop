import * as THREE from 'three';
import garmentInfoCollection from "../data/garmentInfoCollection";
import GarmentInfoPanel from "../ui/GarmentInfoPanel";

export default class GarmentManager {
  constructor(scene, utils, camera) {
    this.scene = scene;

    this.utils = utils;
    this.camera = camera;

    this.currentActiveGarment = null;
    this.currentActiveClone = null;
    this.left = [];
    this.right = [];
    this.allMeshes = [];
    this.hidden = [];
    this.hiddenSide = null

    this.closeUiBtn = document.getElementById('close-ui-btn'); //? test purposes
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

  computeCollectionCenter(side) {
    const meshes = side === 'left' ? this.left : this.right;
    if (!meshes || meshes.length === 0) return new THREE.Vector3();

    const center = new THREE.Vector3();
    meshes.forEach(mesh => center.add(mesh.position));
    center.divideScalar(meshes.length); // average position
    return center;
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

  updateActive(name) {
    this.resetMeshStyle(this.currentActiveGarment);
    const newActiveMesh = this.allMeshes.find(obj => obj.name === name);
    this.currentActiveGarment = newActiveMesh;
    this.applyActiveMeshStyle(this.currentActiveGarment);

    console.warn('ACTIVE:', this.currentActiveGarment)

    const newSide = newActiveMesh.userData.side;
    if (this.currentSide !== newSide) {
      this.currentSide = newSide; // update stored side
      this.focusOnCollection(newSide); // only pan if side changed
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

  focusOnCollection(side) {
    const sideCenter = this.computeCollectionCenter(side);

    // Compute average Y height of mannequins
    let avgHeight = 0;
    const meshes = side === 'left' ? this.left : this.right;
    meshes.forEach(m => avgHeight += m.position.y);
    avgHeight /= meshes.length;

    // Camera offset in front
    const cameraOffset = new THREE.Vector3(0, 0, 4);
    const newCameraPos = sideCenter.clone();
    newCameraPos.y = avgHeight;
    newCameraPos.add(cameraOffset);

    this.camera.moveTo(newCameraPos);

    // Look at the collection center
    const lookAtPos = sideCenter.clone();
    this.camera.lookAt(lookAtPos);
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

    if (this.garmentInfoPanel) {
      console.warn('update INFO!')

      //TODO Pan to active mesh

      this.garmentInfoPanel.setCollection(this.currentActiveGarment.name);
      this.garmentInfoPanel.updateGarment(garmentInfoCollection[this.currentActiveGarment.name], { updateSliderPos: true, collection: this.currentActiveGarment.name });
    } 
    else {
      this.closeUiBtn.addEventListener(
        'click',
        () => {
          console.log('UI closed');
          this.resetMeshStyle(this.currentActiveGarment);
          this.garmentInfoPanel.dispose({ hidePanel: true });
          this.garmentInfoPanel = null;
          this.currentActiveGarment = null;

          this.camera.reset();
        },
        { once: true }
      );


      this.focusOnCollection(this.currentActiveGarment.userData.side) //! Better refactor this is doing repeated logic on pan and zoom at active click

      this.garmentInfoPanel = new GarmentInfoPanel(garmentInfoCollection, this.currentActiveGarment.name, this);
    }
  }
}