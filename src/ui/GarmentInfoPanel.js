import GarmentGallerySlider from "./GarmentGallerySlider";
import GarmentTitleSlider from "./GarmentTitleSlider";

export default class GarmentInfoPanel {
  constructor(garmentInfoCollection, collection, mannequinManager) {
    this.viewMoreBtn = document.getElementById('view-more-btn');
    this.returnBtn = document.getElementById('return-btn');
    this.btnContainerLm = document.getElementById('btn-container');
    this.mannequinManager = mannequinManager;

    this.eventHandler = {}
    this.tailorShopExperience = null;
    this.collection = collection;

    this.garmentInfoCollection = garmentInfoCollection;

    this.lms = {
      panel: document.getElementById('garment-info-panel'),
      garmentTitle: document.getElementById('garment-info-panel__title'),
      garmentDescription: document.getElementById('garment-info-panel__description')
    }

    this.open(garmentInfoCollection[collection]);
  }

  setCollection(collection) {
    this.collection = collection;
  }

  open(garmentInfo) {
    if (!this.lms.panel.classList.contains('active')) {
      this.lms.panel.classList.add('active')
      console.warn('open UI');
      this.updateGarment(garmentInfo, true, this.collection);
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

  updateGarment(garmentInfo, newTitleSliderInstance, collection) {
    if (newTitleSliderInstance) {
      this.garmentTitleSlider = new GarmentTitleSlider(this.garmentInfoCollection, collection);
      this.garmentTitleSlider.setGarmentInfoPanelInstance(this);
    } 
    else {
      this.garmentTitleSlider.updateTitle();
    }
    
    this.garmentGallerySlider && this.garmentGallerySlider.dispose();
    this.garmentGallerySlider = new GarmentGallerySlider(garmentInfo.images);
    
    this.updateGarmentInfo(garmentInfo);

    console.log('COLLECTION', collection)
    this.mannequinManager.updateActive(collection);
  }

  dispose(hide) {
    if (this.lms.panel.classList.contains('active')) {
      this.garmentGallerySlider.dispose();
      this.garmentTitleSlider.dispose();
      hide && this.lms.panel.classList.remove('active');
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