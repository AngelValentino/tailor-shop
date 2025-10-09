// MannequinManager.js
export default class MannequinManager {
  constructor(scene, utils) {
    this.scene = scene;

    this.mannequinInfoPannel = null;
    this.utils = utils;

    this.currentActive = null;
    this.currentActiveClone = null;
    this.left = [];
    this.right = [];
    this.allMeshes = [];
    this.hidden = [];
    this.hiddenSide = null
  }

  setMannequinInfoPannel(mannequinInfoPannel) {
    this.mannequinInfoPannel = mannequinInfoPannel;
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

  getActiveMannequin() {
    return this.currentActive;
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
    console.log('deleted', this.currentActive)
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
    mesh.material.emissive.setHex(0xff0000);
  }

  onMouseLeave(mesh) {
    console.log(`Mouse left: ${mesh.name}`);
    mesh.material.emissive.setHex(0x000000);
  }

  onClick(mesh) {
    console.log(`Clicked ${mesh.userData.side} mannequin!`, mesh.name);
    this.currentActive = mesh;
    console.log(this.currentActive);
    this.mannequinInfoPannel.toggleUiBtn(mesh);
  }
}