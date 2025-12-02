export default class TailorShopExperience {
  constructor(scene, camera, garmentManager, hoverControls, roomGrid) {
    this.scene = scene;
    this.camera = camera;
    this.garmentManager = garmentManager;
    this.hoverControls = hoverControls;
    this.roomGrid = roomGrid;

    this.hoverControls.setOnClick(mesh => this.garmentManager.onClick(mesh));
    this.hoverControls.setOnMouseEnter(mesh => this.garmentManager.onMouseEnter(mesh));
    this.hoverControls.setOnMouseLeave(mesh => this.garmentManager.onMouseLeave(mesh));
  }

  init() {
    this.roomGrid.init();
    this.garmentManager.init();
  }

  disposeHoverControls() {
    this.hoverControls.dispose();
  }

  update(delta) {
    this.hoverControls.update();
    this.garmentManager.update(delta);
  }
}