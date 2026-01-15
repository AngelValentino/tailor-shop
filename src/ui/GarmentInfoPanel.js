import GarmentGallerySlider from "./GarmentGallerySlider.js";
import GarmentSlider from "./GarmentSlider.js";

export default class GarmentInfoPanel {
  constructor(garmentData, garmentKey, garmentManager, modalHandler, focusOnActiveGarment = true) {
    this.viewMoreBtn = document.getElementById('view-more-btn');
    this.returnBtn = document.getElementById('return-btn');
    this.btnContainerLm = document.getElementById('btn-container');
    this.garmentManager = garmentManager;
    this.modalHandler = modalHandler;

    this.eventHandler = {}
    this.garmentKey = null;

    this.garmentData = garmentData;

    this.lms = {
      panel: document.getElementById('garment-info-panel'),
      garmentTitle: document.getElementById('garment-info-panel__title'),
      garmentDescription: document.getElementById('garment-info-panel__description'),
      closeBtn: document.getElementById('garment-info-panel__close-btn'),
      viewMoreBtn: document.getElementById('garment-info-panel__view-more-btn')
    }

    this.open(garmentData[garmentKey], garmentKey, focusOnActiveGarment);
  }

  setGarmentKey(garmentKey) {
    this.garmentKey = garmentKey;
  }

  open(garmentData, garmentKey, focusOnActiveGarment = true) {
    this.eventHandler.closePanel = this.close.bind(this);
    this.eventHandler.enterCloneView = this.garmentManager.enterCloneView.bind(this.garmentManager);

    if (!this.lms.panel.classList.contains('active')) {
      this.garmentManager.hideFocusableBtns();
      this.lms.panel.classList.add('active');
      this.modalHandler.addModalFocus({
        modalKey: 'garmentInfoPanel', 
        firstFocusableLm: this.lms.closeBtn,
        storeLastFocused: focusOnActiveGarment
      });

      this.updateGarment(garmentData, { 
        newTitleSliderInstance: true, 
        garmentKey: garmentKey, 
        saveHistory: true, 
        focusOnActiveGarment: focusOnActiveGarment 
      });

      this.lms.viewMoreBtn.addEventListener('click', this.eventHandler.enterCloneView)
      this.modalHandler.addModalEvents({
        eventHandlerKey: 'garmentInfoPanel',
        modalLm: this.lms.panel,
        closeLms: [ this.lms.closeBtn ],
        closeHandler: this.close.bind(this)
      })
    } 
    else {
      console.warn('ui already opened ignore')
    }
  }

  close({ resetCamera = true, deleteActiveGarmentRef = true } = {}) {
    this.dispose({ hidePanel: true });
    this.garmentManager.resetActiveGarment({ resetCamera, deleteActiveGarmentRef });
    if (resetCamera) this.garmentManager.showFocusableBtns();
    if (resetCamera) this.modalHandler.returnModalFocus({ modalKey: 'garmentInfoPanel' });
  }

  updateGarmentInfo({ title, description }) {
    this.lms.garmentTitle.innerText = title;
    this.lms.garmentDescription.innerText = description;
  }

  updateGarment(garmentData, { newTitleSliderInstance, garmentKey, updateSliderPos, saveHistory = false, focusOnActiveGarment = true }) {
    console.warn('GARMENT KEY THIS => ', this.garmentKey);
    console.warn('NEW GARMENT KEY => ', garmentKey)

    if (garmentKey === this.garmentKey) {
      console.warn('same data return')
      return;
    }
    
    this.setGarmentKey(garmentKey);
    
    // Update title
    if (newTitleSliderInstance) {
      this.garmentSlider = new GarmentSlider(this.garmentData, garmentKey);
      this.garmentSlider.setGarmentInfoPanelInstance(this);
    } 
    else {
      if (updateSliderPos) {
        this.garmentSlider.updateSliderPos(garmentKey);
        this.garmentSlider.updateTitle();
      } 
      else {
        this.garmentSlider.updateTitle();
      }
    }

    this.garmentSlider.updateSliderControls();
    
    // Re-generate slider
    this.garmentGallerySlider && this.garmentGallerySlider.dispose();
    this.garmentGallerySlider = new GarmentGallerySlider(garmentData.images);
    
    this.updateGarmentInfo(garmentData); // Update additional information
    this.garmentManager.updateActive(garmentKey, saveHistory, focusOnActiveGarment); // Set active garment mesh
  }

  dispose({ hidePanel }) {
    if (this.lms.panel.classList.contains('active')) {
      this.garmentGallerySlider.dispose();
      this.garmentSlider.dispose();
      hidePanel && this.lms.panel.classList.remove('active');

      this.lms.viewMoreBtn.removeEventListener('click', this.eventHandler.enterCloneView);
      this.modalHandler.removeModalEvents({
        eventHandlerKey: 'garmentInfoPanel',
        modalLm: this.lms.panel,
        closeLms: [ this.lms.closeBtn ]
      });
    } 
    else {
      console.warn('ui alraedy closed ignore')
    }
  }
}