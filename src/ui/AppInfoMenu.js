export default class AppInfoMenu {
  constructor(modalHandler) {
    this.modalHandler = modalHandler;

    this.timIds = {};
    this.lastFocusedLm = null;

    this.lms = {
      toggleBtn: document.getElementById('toggle-menu-btn'),
      menuLm: document.getElementById('info-menu'),
      closeBtn: document.getElementById('info-menu__close-btn')
    };

    this.lms.toggleBtn.addEventListener('click', this.open.bind(this));
  }

  close() {
    console.log('CLOSE INFO MENU')
    this.lms.toggleBtn.style.display = 'inline-block';
    this.lms.menuLm.classList.remove('active');

    this.timIds.hideMenu = setTimeout(() => {
      this.lms.menuLm.style.display = 'none';
      this.modalHandler.toggleModalFocus('return', null, this.lastFocusedLm);
    }, 300);

    this.modalHandler.removeModalEvents({
      eventHandlerKey: 'infoModal',
      modalLm: this.lms.menuLm,
      closeLms: [ this.lms.closeBtn ]
    })
  }

  open() {
    console.log('OPEN INFO MENU')
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
      eventHandlerKey: 'infoModal',
      modalLm: this.lms.menuLm,
      closeLms: [ this.lms.closeBtn ],
      closeHandler: this.close.bind(this)
    });
  }
}