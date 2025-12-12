import MenuHandler from "./MenuHandler";

export default class GarmentInfoMenu {
  constructor(modalHandler, description) {
    this.menuHandler = new MenuHandler(modalHandler, {
      toggleBtnId: 'garment-menu-btn',
      menuLmId: 'garment-menu',
      closeBtnId: 'garment-menu__close-btn',
      infoContainerId: 'garment-menu__info-container',
      menuKey: 'garmentModal'
    });

    this.setDescription(description);
  }

  dispose() {
    this.menuHandler.dispose();
  }

  setDescription(description) {
    this.menuHandler.setDescription(description);
  }

  close() {
    this.menuHandler.close();
  }

  open() {
    this.menuHandler.open();
  }
}