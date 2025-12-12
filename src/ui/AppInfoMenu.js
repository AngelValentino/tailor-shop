import MenuHandler from "./MenuHandler";

export default class AppInfoMenu {
  constructor(modalHandler) {
    this.menuHandler = new MenuHandler(modalHandler, {
      toggleBtnId: 'toggle-menu-btn',
      menuLmId: 'info-menu',
      closeBtnId: 'info-menu__close-btn',
      menuKey: 'infoModal'
    })
  }

  close() {
    this.menuHandler.close();
  }

  open() {
    this.menuHandler.open();
  }
}