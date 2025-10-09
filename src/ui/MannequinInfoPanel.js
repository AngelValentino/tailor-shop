export default class MannequinInfoPanel {
  constructor() {
    this.viewMoreBtn = document.getElementById('view-more-btn');
    
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
    this.viewMoreBtn.classList.add('visible');

    if (this.viewMoreBtn.classList.contains('visible')) {
      if (!this.currentHandler) {
        this.currentHandler = this.cloneMannequinHandler(activeMannequin);
        this.viewMoreBtn.addEventListener('click', this.currentHandler);
      }
    } 
    // else {
    //   this.viewMoreBtn.removeEventListener('click', this.currentHandler);
    //   this.currentHandler = null;
    // }
  }
}