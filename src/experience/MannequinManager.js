// MannequinManager.js
export default class MannequinManager {
  constructor(scene) {
    this.scene = scene;

    this.mannequinInfoPannel = null;

    this.currentActive = null;
    this.left = [];
    this.right = [];
    this.allMeshes = [];
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
    const hidden = [];
    this.allMeshes = this.allMeshes.filter(mesh => {
      if (mesh.userData.side === side) {
        mesh.visible = false;
        hidden.push(mesh);
        return false; // remove from allMeshes
      }
      return true; // keep in allMeshes
    });
    return hidden;
  }

  showHidden(hiddenArray = []) {
    hiddenArray.forEach(mesh => {
      mesh.visible = true;
      this.allMeshes.push(mesh);
    });
  }

  cloneMannequin(mesh) {
    console.log('123')
    console.log(mesh)
    const cloned = mesh.clone();
    // clone geometry/material references so we don't mutate originals
    if (mesh.geometry) cloned.geometry = mesh.geometry.clone();
    if (mesh.material) {
      // handle array or single material
      if (Array.isArray(mesh.material)) {
        cloned.material = mesh.material.map(m => m.clone());
      } 
      else {
        cloned.material = mesh.material.clone();
      }
    }
    // cloned should not keep userData by reference
    cloned.userData = { ...mesh.userData };
    this.scene.add(cloned);
    return cloned;
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