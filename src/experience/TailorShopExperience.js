import * as THREE from 'three';

export default class TailorShopExperience {
  constructor(scene, camera, garmentManager, hoverControls) {
    this.scene = scene;
    this.camera = camera;
    this.garmentManager = garmentManager;
    this.hoverControls = hoverControls;

    this.roomBounds = {
      width: 0,
      depth: 0,
      height: 0,
      cols: 8,
      rows: 8,
      gridY: 0.01
    }
    this.roomBox = null;

    this.hoverControls.setOnClick((mesh) => this.garmentManager.onClick(mesh));
    this.hoverControls.setOnMouseEnter((mesh) => this.garmentManager.onMouseEnter(mesh));
    this.hoverControls.setOnMouseLeave((mesh) => this.garmentManager.onMouseLeave(mesh));
  }

  init() {
    this.calculateRoomGrid();
    this.#drawRoomGrid();
    this.garmentManager.init();
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
}