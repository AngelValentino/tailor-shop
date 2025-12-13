import GarmentInfoMenu from "./GarmentInfoMenu";

export default class GarmentActionHub {
  constructor(garmentManager, modalHandler, utils) {
    this.garmentManager = garmentManager;
    this.modalHandler = modalHandler
    this.utils = utils;

    this.eventHandler = {};

    this.lms = {
      returnBtn: document.getElementById('return-to-garment-panel-btn'),
      infoBtn: document.getElementById('garment-menu-btn'),
      helper: document.getElementById('clone-view-helper'),
      helperHandIcon: document.getElementById('clone-view-helper__hand'),
      helperMouseIcon: document.getElementById('clone-view-helper__mouse')
    };
  }

  updateHelperIcon() {
    if (this.utils.isTouchBasedDevice()) {
      this.lms.helperMouseIcon.classList.remove('active');
      this.lms.helperHandIcon.classList.add('active');
    } 
    else {
      this.lms.helperHandIcon.classList.remove('active');
      this.lms.helperMouseIcon.classList.add('active');
    }
  }

  display(longDescription) {
    this.lms.infoBtn.classList.add('active');
    this.lms.returnBtn.classList.add('active');
    this.lms.helper.classList.add('active');
    this.updateHelperIcon();
    
    this.garmentInfoMenu = new GarmentInfoMenu(this.modalHandler, longDescription);

    this.eventHandler.restoreOppositeSide = this.garmentManager.restoreOppositeSide.bind(this.garmentManager);
    this.lms.returnBtn.addEventListener('click', this.eventHandler.restoreOppositeSide)
  }

  hide() {
    this.lms.infoBtn.classList.remove('active');
    this.lms.returnBtn.classList.remove('active');
    this.lms.helper.classList.remove('active');

    this.garmentInfoMenu.dispose();
    this.garmentInfoMenu = null;

    this.lms.returnBtn.removeEventListener('click', this.eventHandler.restoreOppositeSide);
  }
}