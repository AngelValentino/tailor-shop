export default class MenuHandler {
  constructor(modalHandler) {
    this.modalHandler = modalHandler;
    this.atelierExperienceInstance = null;
    this.menus = {};
  }

  update({
    toggleBtnId,
    menuLmId,
    closeBtnId,
    infoContainerId,
    menuKey
  }) {
    if (!this.menus[menuKey]) {
      this.menus[menuKey] = {
        timIds: {},
        lms: {},
        open: this.open.bind(this, menuKey)
      }
    }

    const menu = this.menus[menuKey];

    console.log('UPDATE MENU HANDLER => ', menuKey, this.menus)

    menu.lms = {
      toggleBtn: document.getElementById(toggleBtnId),
      menuLm: document.getElementById(menuLmId),
      closeBtn: document.getElementById(closeBtnId),
      infoContainer: document.getElementById(infoContainerId)
    }

    menu.lms.toggleBtn.addEventListener('click', menu.open);
  }

  setAtelierExperienceInstance(atelierExperienceInstance) {
    this.atelierExperienceInstance = atelierExperienceInstance;
  }

  setDescription(description, menuKey) {
    this.menus[menuKey].lms.infoContainer.innerHTML = description;
  }

  dispose(menuKey) {
    const menu = this.menus[menuKey];
    
    if (menu.timIds.hideMenu) clearTimeout(menu.timIds.hideMenu);
    menu.lms.toggleBtn.removeEventListener('click', menu.open);
    
    delete this.menus[menuKey];
    console.log('DISPOSE MENU HANDLER =>', menuKey, this.menus)
  }

  close(menuKey) {
    console.log('CLOSE MENU => ', menuKey)
    const menu = this.menus[menuKey];
    this.atelierExperienceInstance.resume();

    const { toggleBtn, menuLm, closeBtn } = menu.lms;

    // close menu
    toggleBtn.style.display = '';
    menuLm.classList.remove('active');

    menu.timIds.hideMenu = setTimeout(() => {
      menuLm.style.display = 'none';
      this.modalHandler.restoreFocus({ modalKey: menuKey });
    }, 300);

    // remove events
    this.modalHandler.removeA11yEvents({
      modalKey: menuKey,
      modalLm: menuLm,
      closeLms: [ closeBtn ]
    });
  }

  open(menuKey) {
    console.log('OPEN MENU => ', menuKey)
    const menu = this.menus[menuKey];
    this.atelierExperienceInstance.pause();
    clearTimeout(menu.timIds.hideMenu);

    const { toggleBtn, menuLm, closeBtn } = menu.lms;

    // show menu
    toggleBtn.style.display = 'none';
    menuLm.style.display = 'block';
    this.modalHandler.addFocus({
      modalKey: menuKey, 
      firstFocusableLm: closeBtn
    });

    setTimeout(() => {
      menuLm.classList.add('active');
    });

    // add events
    this.modalHandler.addA11yEvents({
      modalKey: menuKey,
      modalLm: menuLm,
      closeLms: [ closeBtn ],
      closeHandler: this.close.bind(this, menuKey)
    });
  }
}