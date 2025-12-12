import GarmentInfoMenu from "./GarmentInfoMenu";

export default class GarmentActionHub {
  constructor(garmentManager, modalHandler) {
    this.garmentManager = garmentManager;
    this.modalHandler = modalHandler

    this.eventHandler = {};

    this.lms = {
      returnBtn: document.getElementById('return-to-garment-panel-btn'),
      infoBtn: document.getElementById('garment-menu-btn')
    };
  }

  display(longDescription) {
    this.lms.infoBtn.classList.add('active');
    this.lms.returnBtn.classList.add('active');
    
    this.garmentInfoMenu = new GarmentInfoMenu(this.modalHandler, longDescription);

    this.eventHandler.restoreOppositeSide = this.garmentManager.restoreOppositeSide.bind(this.garmentManager);
    this.lms.returnBtn.addEventListener('click', this.eventHandler.restoreOppositeSide)
  }

  hide() {
    this.lms.infoBtn.classList.remove('active');
    this.lms.returnBtn.classList.remove('active');

    this.garmentInfoMenu.dispose();
    this.garmentInfoMenu = null;

    this.lms.returnBtn.removeEventListener('click', this.eventHandler.restoreOppositeSide);
  }
}