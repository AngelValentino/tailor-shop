export default class TailorShopExperience {
  constructor(scene, camera, garmentManager, raycasterControls, roomGrid) {
    this.scene = scene;
    this.camera = camera;
    this.garmentManager = garmentManager;
    this.raycasterControls = raycasterControls;
    this.roomGrid = roomGrid;

    this.raycasterControls.setOnClick(mesh => this.garmentManager.onClick(mesh));
    this.raycasterControls.setOnMouseEnter(mesh => this.garmentManager.onMouseEnter(mesh));
    this.raycasterControls.setOnMouseLeave(mesh => this.garmentManager.onMouseLeave(mesh));
  }

  init() {
    this.roomGrid.init();
    this.garmentManager.init();
  }

  disposeRaycaster() {
    this.raycasterControls.dispose();
  }

  update(delta) {
    this.raycasterControls.update();
    this.garmentManager.update(delta);
  }
}