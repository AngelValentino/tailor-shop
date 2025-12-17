export default class AppInfoMenu {
  constructor(menuHandler) {
    menuHandler.update({
      toggleBtnId: 'toggle-menu-btn',
      menuLmId: 'info-menu',
      closeBtnId: 'info-menu__close-btn',
      menuKey: 'infoModal'
    });
  }
}