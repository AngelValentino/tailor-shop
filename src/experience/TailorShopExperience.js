import * as THREE from 'three';


export default class TailorShopExperience {
  constructor(scene, camera, mannequinManager, hoverControls, mannequinInfoPanel) {
    this.scene = scene;
    this.camera = camera;

    this.mannequinManager = mannequinManager;
    this.hoverControls = hoverControls;
    this.mannequinInfoPanel = mannequinInfoPanel;

    this.roomBounds = {
      width: 0,
      depth: 0,
      height: 0,
      cols: 8,
      rows: 8,
      gridY: 0.01
    }
    this.roomBox = null;

    this.hoverControls.setOnClick((mesh) => this.mannequinManager.onClick(mesh));
    this.hoverControls.setOnMouseEnter((mesh) => this.mannequinManager.onMouseEnter(mesh));
    this.hoverControls.setOnMouseLeave((mesh) => this.mannequinManager.onMouseLeave(mesh));
  }

  init() {
    this.mannequinManager.init();
    this.calculateRoomGrid();
    this.#drawRoomGrid();
  }

  disposeHoverControls() {
    this.hoverControls.dispose();
  }

  update() {
    this.hoverControls.update();
  }

  calculateRoomGrid() {
    const roomMesh = this.scene.getObjectByName('room');
    if (roomMesh) {
      this.roomBox = new THREE.Box3().setFromObject(roomMesh);
      this.roomBounds.width = this.roomBox.max.x - this.roomBox.min.x;
      this.roomBounds.depth = this.roomBox.max.z - this.roomBox.min.z;
      this.roomBounds.height = this.roomBox.max.y - this.roomBox.min.y;
      this.roomBounds.cellWidth = this.roomBounds.width / this.roomBounds.cols;
      this.roomBounds.cellDepth = this.roomBounds.depth / this.roomBounds.rows;
    }
  }

  getGridPosition(col, row, options = {}) {
    if (!this.roomBox || !this.roomBounds.cellWidth) return null;

    const { rows, cellWidth, cellDepth } = this.roomBounds;
    const flipRows = options.flipRows || false;
    const rowIndex = flipRows ? (rows - 1 - row) : row;

    const x = this.roomBox.min.x + cellWidth * (col + 0.5);
    const z = this.roomBox.min.z + cellDepth * (rowIndex + 0.5);
    const y = this.roomBox.min.y; // floor height
    return { x, y, z };
  }

  #drawRoomGrid() {
    if (!this.roomBox) return;
    const width = this.roomBounds.width;
    const depth = this.roomBounds.depth;
    const divisions = Math.max(this.roomBounds.cols, this.roomBounds.rows);
    const gridHelper = new THREE.GridHelper(Math.max(width, depth), divisions);
    gridHelper.position.set(
      (this.roomBox.min.x + this.roomBox.max.x) / 2,
      this.roomBounds.gridY,
      (this.roomBox.min.z + this.roomBox.max.z) / 2
    );
    this.scene.add(gridHelper);
  }

  cloneActiveMannequin() {
    if (!this.mannequinManager.getActiveMannequin()) return null;

    const currentActiveMannequin = this.mannequinManager.getActiveMannequin();
    const side = currentActiveMannequin.userData.side;
    const opposite = side === 'left' ? 'right' : 'left';
    const targetCol = side === 'left' ? this.roomBounds.cols - 2 : 1;
    const targetRow = side === 'left' ? 1 : 1;
    const gridPos = this.getGridPosition(targetCol, targetRow)
    
    const cloned = this.mannequinManager.cloneMannequin(currentActiveMannequin);
    if (!cloned) return;
    console.log('hide', opposite);
    this.mannequinManager.hideSide(opposite);
    console.log('position new clone')
    cloned.position.x = gridPos.x;
    cloned.position.z = gridPos.z;
    cloned.rotation.set(0, 0, 0); 

    cloned.updateMatrixWorld(true);
  }

  restoreOppositeSide() {
    // delete the curernt clone
    this.mannequinManager.deleteActiveClone();
    // set up the stored hidden meshes
    this.mannequinManager.showHidden();
    // hide UI
    this.mannequinInfoPanel.hideRestoreBtn();
    console.log('restored opposite')
  }
}