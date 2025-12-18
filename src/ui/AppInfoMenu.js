export default class AppInfoMenu {
  constructor(menuHandler) {
    this.menuKey = 'infoModal';

    menuHandler.update({
      toggleBtnId: 'toggle-menu-btn',
      menuLmId: 'info-menu',
      closeBtnId: 'info-menu__close-btn',
      menuKey: this.menuKey
    });
  }

  dispose() {
    this.menuHandler.dispose(this.menuKey)
  }
}