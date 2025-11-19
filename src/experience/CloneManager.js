export default class CloneManager {
  constructor(scene, camera, utils, roomGrid) {
    this.scene = scene;
    this.camera = camera;
    this.utils = utils;
    this.garmentManager = null;
    this.roomGrid = roomGrid;

    this.currentActiveClone = null;
    this.hiddenCurrentSide = [];
    this.hiddenSide = null;
  }

  setGarmentManagerInstance(garmentManager) {
    this.garmentManager = garmentManager;
  }

  getActiveClone() {
    return this.currentActiveClone;
  }

  deleteActiveClone() {
    console.log('deleted', this.garmentManager.getActiveMannequin())
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

  hideSide(side) {
    if (this.hiddenSide === side) {
      console.warn(`Side '${side}' is already hidden — skipping hideSide.`);
      return;
    }

    this.hiddenCurrentSide.length = 0
    const filterCurrentSideMeshes = this.garmentManager.getAllMeshes().filter(mesh => {
      if (mesh.userData.side === side) {
        mesh.visible = false;
        this.hiddenCurrentSide.push(mesh);
        return false; // remove from allMeshes
      }
      return true; // keep in allMeshes
    });

    this.garmentManager.setAllMeshes(filterCurrentSideMeshes);

    this.hiddenSide = side;
    console.log(`Hid ${this.hiddenCurrentSide.length} meshes on side '${side}'`);
  }

  showHidden() {
    if (!this.hiddenSide || this.hiddenCurrentSide.length === 0) {
      console.warn('showHidden() called but nothing is hidden — skipping.');
      return;
    }
    console.log(this.hiddenCurrentSide)
    this.hiddenCurrentSide.forEach(mesh => {
      mesh.visible = true;
      this.garmentManager.setAllMeshes(mesh);
    });

    console.log(`Restored ${this.hiddenCurrentSide.length} meshes from side '${this.hiddenSide}'`);
    this.hiddenCurrentSide.length = 0;
    this.hiddenSide = null;
  }

  cloneActiveMannequin() {
    if (!this.garmentManager.getActiveMannequin()) return null;

    const currentActiveMannequin = this.garmentManager.getActiveMannequin();

    const side = currentActiveMannequin.userData.side;
    const opposite = side === 'left' ? 'right' : 'left';
    const targetCol = side === 'left' ? this.roomGrid.roomBounds.cols - 2 : 1;
    const targetRow = side === 'left' ? 1 : 1;
    const gridPos = this.roomGrid.getGridPosition(targetCol, targetRow)
    
    const cloned = this.cloneMannequin(currentActiveMannequin);
    if (!cloned) return;
    console.log('hide', opposite);
    this.hideSide(opposite);
    console.log('position new clone')
    cloned.position.x = gridPos.x;
    cloned.position.z = gridPos.z;
    cloned.rotation.set(0, 0, 0); 

    cloned.updateMatrixWorld(true);
  }
}