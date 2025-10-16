import GarmentGallerySlider from "./GarmentGallerySlider.js";
import GarmentSlider from "./GarmentSlider.js";

export default class GarmentInfoPanel {
  constructor(garmentInfoCollection, collection, garmentManager) {
    this.viewMoreBtn = document.getElementById('view-more-btn');
    this.returnBtn = document.getElementById('return-btn');
    this.btnContainerLm = document.getElementById('btn-container');
    this.garmentManager = garmentManager;

    this.eventHandler = {}
    this.tailorShopExperience = null;
    this.collectionName = collection;

    this.garmentInfoCollection = garmentInfoCollection;

    this.lms = {
      panel: document.getElementById('garment-info-panel'),
      garmentTitle: document.getElementById('garment-info-panel__title'),
      garmentDescription: document.getElementById('garment-info-panel__description')
    }

    this.open(garmentInfoCollection[collection], this.collectionName);
  }

  setCollection(collection) {
    this.collectionName = collection;
  }

  open(garmentInfo, collection) {
    if (!this.lms.panel.classList.contains('active')) {
      this.lms.panel.classList.add('active')
      console.warn('open UI');
      this.updateGarment(garmentInfo, {newTitleSliderInstance: true, collection: collection});
      this.generatePanelStructure(garmentInfo);
    } 
    else {
      console.warn('ui already opened ignore')
    }
  }

  updateGarmentInfo({ title, description }) {
    this.lms.garmentTitle.innerText = title;
    this.lms.garmentDescription.innerText = description;
  }

  updateGarment(garmentInfo, { newTitleSliderInstance, collection, updateSliderPos }) {
    this.setCollection(collection);

    // Update title
    if (newTitleSliderInstance) {
      this.garmentSlider = new GarmentSlider(this.garmentInfoCollection, collection);
      this.garmentSlider.setGarmentInfoPanelInstance(this);
    } 
    else {
      if (updateSliderPos) {
        this.garmentSlider.updateSliderPos(collection);
        this.garmentSlider.updateTitle();
      } 
      else {
        this.garmentSlider.updateTitle();
      }
    }
    
    // Re-generate slider
    this.garmentGallerySlider && this.garmentGallerySlider.dispose();
    this.garmentGallerySlider = new GarmentGallerySlider(garmentInfo.images);
    
    this.updateGarmentInfo(garmentInfo); // Update additional information
    this.garmentManager.updateActive(collection); // Set active garment mesh
  }

  dispose({ hidePanel }) {
    if (this.lms.panel.classList.contains('active')) {
      this.garmentGallerySlider.dispose();
      this.garmentSlider.dispose();
      hidePanel && this.lms.panel.classList.remove('active');
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