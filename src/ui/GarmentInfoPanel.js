import GarmentGallerySlider from "./GarmentGallerySlider.js";
import GarmentSlider from "./GarmentSlider.js";

export default class GarmentInfoPanel {
  constructor(garmentData, garmentKey, garmentManager, focusOnActiveGarment = true) {
    this.viewMoreBtn = document.getElementById('view-more-btn');
    this.returnBtn = document.getElementById('return-btn');
    this.btnContainerLm = document.getElementById('btn-container');
    this.garmentManager = garmentManager;

    this.eventHandler = {}
    this.garmentKey = garmentKey;

    this.garmentData = garmentData;

    this.lms = {
      panel: document.getElementById('garment-info-panel'),
      garmentTitle: document.getElementById('garment-info-panel__title'),
      garmentDescription: document.getElementById('garment-info-panel__description'),
      closeBtn: document.getElementById('garment-info-panel__close-btn'),
      viewMoreBtn: document.getElementById('garment-info-panel__view-more-btn')
    }

    this.open(garmentData[garmentKey], this.garmentKey, focusOnActiveGarment);
  }

  setGarmentKey(garmentKey) {
    this.garmentKey = garmentKey;
  }

  open(garmentData, garmentKey, focusOnActiveGarment = true) {
    this.eventHandler.closePanel = this.close.bind(this);
    this.eventHandler.enterCloneView = this.garmentManager.enterCloneView.bind(this.garmentManager);

    if (!this.lms.panel.classList.contains('active')) {
      this.lms.closeBtn.addEventListener('click', this.eventHandler.closePanel);
      this.lms.viewMoreBtn.addEventListener('click', this.eventHandler.enterCloneView)

      this.lms.panel.classList.add('active');
      console.warn('open UI');
      this.updateGarment(garmentData, { 
        newTitleSliderInstance: true, 
        garmentKey: garmentKey, 
        saveHistory: true, 
        focusOnActiveGarment: focusOnActiveGarment 
      });
    } 
    else {
      console.warn('ui already opened ignore')
    }
  }

  close({ resetCamera = true, deleteActiveGarmentRef = true } = {}) {
    console.log(resetCamera)
    this.dispose({ hidePanel: true });
    this.garmentManager.resetActiveGarment({ resetCamera, deleteActiveGarmentRef });
    console.log('close UI!')
  }

  updateGarmentInfo({ title, description }) {
    this.lms.garmentTitle.innerText = title;
    this.lms.garmentDescription.innerText = description;
  }

  updateGarment(garmentData, { newTitleSliderInstance, garmentKey, updateSliderPos, saveHistory = false, focusOnActiveGarment = true }) {
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

      this.lms.closeBtn.removeEventListener('click', this.eventHandler.closePanel);
      this.lms.viewMoreBtn.removeEventListener('click', this.eventHandler.enterCloneView);
    } 
    else {
      console.warn('ui alraedy closed ignore')
    }
  }

  generatePanelStructure({ title, description }) {
    return (
      `
        <div id="garment-slider-container" class="garment-slider-container"></div>
        <div id="garment-gallery" class="garment-gallery">
        <h1 id="garment-info-panel__title" class="garment-info-panel__title">${title}</h1>
        <p id="garment-info-panel__description" class="garment-info-panel__description">${description}</p>
        <button class="garment-info-panel__view-more-btn">Go to enhanced view!</button>
      `
    );
  }
}