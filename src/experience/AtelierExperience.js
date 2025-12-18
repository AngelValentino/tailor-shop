export default class AtelierExperience {
  constructor(scene, camera, garmentManager, raycasterControls, roomGrid) {
    this.scene = scene;
    this.camera = camera;
    this.garmentManager = garmentManager;
    this.raycasterControls = raycasterControls;
    this.roomGrid = roomGrid;
    this.enabled = true;

    this.raycasterControls.setOnClick(mesh => this.garmentManager.onClick(mesh));
    this.raycasterControls.setOnMouseEnter(mesh => this.garmentManager.onMouseEnter(mesh));
    this.raycasterControls.setOnMouseLeave(mesh => this.garmentManager.onMouseLeave(mesh));
  }

  init() {
    this.roomGrid.init();
    this.garmentManager.init();
  }

  pause() {
    console.error('PAUSED ATELIER EXPERIENCE')
    this.enabled = false;
  }

  resume() {
    console.error('RESUMED ATELIER EXPERIENCE')
    this.enabled = true;
  }

  disposeRaycaster() {
    this.raycasterControls.dispose();
  }

  update(delta) {
    if (!this.enabled) return;
    this.raycasterControls.update();
    this.garmentManager.update(delta);
  }
}