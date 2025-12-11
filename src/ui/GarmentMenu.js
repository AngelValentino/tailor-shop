export default class GarmentMenu {
  constructor(modalHandler, description) {
    this.modalHandler = modalHandler;

    this.timIds = {};
    this.lastFocusedLm = null;

    this.lms = {
      toggleBtn: document.getElementById('garment-menu-btn'),
      menuLm: document.getElementById('garment-menu'),
      closeBtn: document.getElementById('garment-menu__close-btn'),
      infoContainer: document.getElementById('garment-menu__info-container')
    };

    this.setDescription(description)
    this._open = this.open.bind(this);

    this.lms.toggleBtn.addEventListener('click', this._open);
  }

  dispose() {
    this.lms.length = 0;
    this.timIds.length = 0;
    this.lastFocusedLm = null;

    this.lms.toggleBtn.removeEventListener('click', this._open);
  }

  setDescription(description) {
    this.lms.infoContainer.innerHTML = description;
  }

  close() {
    console.log('CLOSE GARMENT MENU')
    this.lms.toggleBtn.style.display = '';
    this.lms.menuLm.classList.remove('active');

    this.timIds.hideMenu = setTimeout(() => {
      this.lms.menuLm.style.display = 'none';
      this.modalHandler.toggleModalFocus('return', null, this.lastFocusedLm);
    }, 300);

    this.modalHandler.removeModalEvents({
      eventHandlerKey: 'garmentModal',
      modalLm: this.lms.menuLm,
      closeLms: [ this.lms.closeBtn ]
    })
  }

  open() {
    console.log('OPEN GARMENT MENU')
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
      eventHandlerKey: 'garmentModal',
      modalLm: this.lms.menuLm,
      closeLms: [ this.lms.closeBtn ],
      closeHandler: this.close.bind(this)
    });
  }
}