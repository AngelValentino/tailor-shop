import GarmentInfoMenu from "./GarmentInfoMenu";

export default class GarmentActionHub {
  constructor(garmentManager, modalHandler, utils, menuHandler) {
    this.garmentManager = garmentManager;
    this.modalHandler = modalHandler
    this.utils = utils;
    this.menuHandler = menuHandler;

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
    this.modalHandler.addModalFocus('cloneView', this.lms.returnBtn);
    
    this.garmentInfoMenu = new GarmentInfoMenu(this.menuHandler, longDescription);

    this.modalHandler.addModalEvents({
      eventHandlerKey: 'cloneView',
      closeLms: [ this.lms.returnBtn ],
      closeHandler: this.garmentManager.restoreOppositeSide.bind(this.garmentManager)
    });
  }

  hide() {
    this.lms.infoBtn.classList.remove('active');
    this.lms.returnBtn.classList.remove('active');
    this.lms.helper.classList.remove('active');

    this.garmentInfoMenu.dispose();
    this.garmentInfoMenu = null;

    this.modalHandler.returnModalFocus('cloneView');

    this.modalHandler.removeModalEvents({
      eventHandlerKey: 'cloneView',
      closeLms: [ this.lms.returnBtn ]
    });
  }
}