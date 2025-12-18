export default class GarmentInfoMenu {
  constructor(menuHandler, description) {
    this.menuKey = 'garmentModal';
    this.menuHandler = menuHandler;
   
    this.menuHandler.update({
      toggleBtnId: 'garment-menu-btn',
      menuLmId: 'garment-menu',
      closeBtnId: 'garment-menu__close-btn',
      infoContainerId: 'garment-menu__info-container',
      menuKey: this.menuKey
    });

    this.setDescription(description);
  }

  dispose() {
    this.menuHandler.dispose(this.menuKey);
  }

  setDescription(description) {
    this.menuHandler.setDescription(description, this.menuKey);
  }
}