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
    // Clone already exists 
    if (this.activeGarmentClone && this.activeGarmentClone.userData.original === mesh) {
      return;
    }

    this.activeGarmentClone = mesh.clone();

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
    // Side is already hidden
    if (this.hiddenSide === side) {
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
  }

  showHiddenGarments(onRestored) {
    // Nothing is hidden
    if (!this.hiddenSide || this.hiddenGarments.length === 0) {
      return;
    }
    setTimeout(() => {
      this.hiddenGarments.forEach(mesh => {
        mesh.visible = true;
        this.garmentManager.setAllMeshes(mesh);
      });

      this.hiddenGarments.length = 0;
      this.hiddenSide = null;

      if (onRestored) {
        onRestored();
      }
    }, 250);
  }

  deleteGarmentClone() {
    if (this.activeGarmentClone) {
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
    const gridPos = this.roomGrid.getGridPosition(targetCol, targetRow);
    
    const cloned = this.cloneGarment(activeGarment);
    if (!cloned) return;

    this.hideSide(opposite);

    // Position new clone
    cloned.position.x = gridPos.x;
    cloned.position.z = gridPos.z;
    cloned.rotation.set(0, 0, 0); 

    cloned.updateMatrixWorld(true);
  }
}