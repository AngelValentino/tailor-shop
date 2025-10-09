export default class MannequinInfoPanel {
  constructor() {
    this.viewMoreBtn = document.getElementById('view-more-btn');
    this.returnBtn = document.getElementById('return-btn');
    this.btnContainerLm = document.getElementById('btn-container');

    this.eventHandler = {}
    
    this.tailorShopExperience = null;
  }

  setTailorShopExperience(tailorShopExperience) {
    this.tailorShopExperience = tailorShopExperience;
  }

  cloneMannequinHandler(activeMannequin) {
    return () => {
      this.tailorShopExperience.cloneActiveMannequin(activeMannequin);
    };
  }

  toggleUiBtn(activeMannequin) {
    this.btnContainerLm.classList.add('visible');

    if (this.btnContainerLm.classList.contains('visible')) {
      if (!this.eventHandler.clone) {
        this.eventHandler.clone = this.cloneMannequinHandler(activeMannequin);
        this.viewMoreBtn.addEventListener('click', this.eventHandler.clone);
      }

      if (!this.eventHandler.restore) {
        this.eventHandler.restore = this.tailorShopExperience.restoreOppositeSide.bind(this.tailorShopExperience);
        this.returnBtn.addEventListener('click', this.eventHandler.restore);
      }
    } 
  }

  hideRestoreBtn() {
    this.returnBtn.removeEventListener('click', this.eventHandler.restore);
    this.viewMoreBtn.removeEventListener('click', this.eventHandler.clone);

    this.eventHandler.restore = null;
    this.eventHandler.clone = null;

    console.log('left UI and removed events');
    this.btnContainerLm.classList.remove('visible');
  }
}