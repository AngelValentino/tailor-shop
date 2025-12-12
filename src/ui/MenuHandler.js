export default class MenuHandler {
  constructor(modalHandler, {
    toggleBtnId,
    menuLmId,
    closeBtnId,
    infoContainerId,
    menuKey
  }) {
    this.modalHandler = modalHandler;
    this.menuKey = menuKey;

    this.timIds = {};
    this.lastFocusedLm = null;

    this.lms = {
      toggleBtn: document.getElementById(toggleBtnId),
      menuLm: document.getElementById(menuLmId),
      closeBtn: document.getElementById(closeBtnId),
      infoContainer: document.getElementById(infoContainerId)
    };

    this._open = this.open.bind(this);
    this.lms.toggleBtn.addEventListener('click', this._open);
  }

  setDescription(description) {
    this.lms.infoContainer.innerHTML = description;
  }

  dispose() {
    this.lms.length = 0;
    this.timIds.length = 0;
    this.lastFocusedLm = null;

    this.lms.toggleBtn.removeEventListener('click', this._open);
  }

  close() {
    console.log('CLOSE MENU => ', this.menuKey)
    this.lms.toggleBtn.style.display = '';
    this.lms.menuLm.classList.remove('active');

    this.timIds.hideMenu = setTimeout(() => {
      this.lms.menuLm.style.display = 'none';
      this.modalHandler.toggleModalFocus('return', null, this.lastFocusedLm);
    }, 300);

    this.modalHandler.removeModalEvents({
      eventHandlerKey: this.menuKey,
      modalLm: this.lms.menuLm,
      closeLms: [ this.lms.closeBtn ]
    })
  }

  open() {
    console.log('OPEN MENU => ', this.menuKey)
    clearTimeout(this.timIds.hideMenu);

    // Show menu
    this.lms.toggleBtn.style.display = 'none';
    this.lastFocusedLm = this.modalHandler.toggleModalFocus('add', this.lms.closeBtn);
    this.lms.menuLm.style.display = 'block';

    // Animate menu
    setTimeout(() => {
      this.lms.menuLm.classList.add('active');
    });

    // Add events
    this.modalHandler.addModalEvents({
      eventHandlerKey: this.menuKey,
      modalLm: this.lms.menuLm,
      closeLms: [ this.lms.closeBtn ],
      closeHandler: this.close.bind(this)
    });
  }
}