export default class CloneManager {
  constructor(scene, camera, utils, roomGrid, garmentManager) {
    this.scene = scene;
    this.camera = camera;
    this.utils = utils;
    this.garmentManager = garmentManager;
    this.roomGrid = roomGrid;

    this.activeGarmentClone = null;
    this.hiddenGarments = [];
    this.hiddenSide = null;
  }

  getActiveGarmentClone() {
    return this.activeGarmentClone;
  }
  
  cloneGarment(mesh) {
    if (this.activeGarmentClone && this.activeGarmentClone.userData.original === mesh) {
      console.log('Clone already exists!');
      return;
    }

    this.activeGarmentClone = mesh.clone();
    console.warn('CURRENT ACTIVE CLONE ->>>',this.activeGarmentClone);

    // clone geometry/material references so we don't mutate originals
    if (mesh.geometry) this.activeGarmentClone.geometry = mesh.geometry.clone();
 
    if (mesh.material) {
      this.activeGarmentClone.material = Array.isArray(mesh.material)
        ? mesh.material.map(m => m.clone())
        : mesh.material.clone();
    }

    // Mark the clone with a reference to the original mesh
    this.activeGarmentClone.userData = { ...mesh.userData, original: mesh };
    this.scene.add(this.activeGarmentClone);
    return this.activeGarmentClone;
  }

  hideSide(side) {
    if (this.hiddenSide === side) {
      console.warn(`Side '${side}' is already hidden — skipping hideSide.`);
      return;
    }

    this.hiddenGarments.length = 0;
    const filterCurrentSideMeshes = this.garmentManager.getAllMeshes().filter(mesh => {
      if (mesh.userData.side === side) {
        mesh.visible = false;
        this.hiddenGarments.push(mesh);
        return false; // remove from allMeshes
      }
      return true; // keep in allMeshes
    });

    this.garmentManager.setAllMeshes(filterCurrentSideMeshes);

    this.hiddenSide = side;
    console.log(`Hid ${this.hiddenGarments.length} meshes on side '${side}'`);
  }

  showHiddenGarments() {
    if (!this.hiddenSide || this.hiddenGarments.length === 0) {
      console.warn('showHiddenGarments() called but nothing is hidden — skipping.');
      return;
    }
    setTimeout(() => {
      this.hiddenGarments.forEach(mesh => {
        mesh.visible = true;
        this.garmentManager.setAllMeshes(mesh);
      });

      console.log(this.hiddenGarments)

      console.log(`Restored ${this.hiddenGarments.length} meshes from side '${this.hiddenSide}'`);
      this.hiddenGarments.length = 0;
      this.hiddenSide = null;
    }, 250)

  }

  deleteGarmentClone() {
    if (this.activeGarmentClone) {
      console.warn('deleted CLONE!!!!!!', this.activeGarmentClone)
      this.utils.removeMesh(this.activeGarmentClone, this.scene);
      this.activeGarmentClone = null;
    }
  }

  cloneActiveGarment(activeGarment) {
    if (!activeGarment) return null;

    const side = activeGarment.userData.side;
    const opposite = side === 'left' ? 'right' : 'left';
    const targetCol = side === 'left' ? this.roomGrid.roomBounds.cols - 2 : 1;
    const targetRow = side === 'left' ? 1 : 1;
    const gridPos = this.roomGrid.getGridPosition(targetCol, targetRow)
    
    const cloned = this.cloneGarment(activeGarment);
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