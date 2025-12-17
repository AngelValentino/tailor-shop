export default class GarmentInfoMenu {
  constructor(menuHandler, description) {
    this.menuHandler = menuHandler;
    this.menuHandler.update({
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