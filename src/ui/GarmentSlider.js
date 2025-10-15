export default class GarmentSlider {
  constructor(garmentInfoCollection, collection) {
    this.garmentsTitles = Object.keys(garmentInfoCollection)
    this.garmentInfoCollection = garmentInfoCollection;
    this.collectionName = collection;
    this.garmentIndex = this.garmentsTitles.indexOf(this.collectionName);

    this.root = document.getElementById('garment-slider-container');
    this.root.innerHTML = this.generateSlider();

    this.lms = {
      prevBtn: this.root.querySelector('.garment-slider__prev-btn'),
      nextBtn: this.root.querySelector('.garment-slider__next-btn'),
      slider: this.root,
      sliderControls: this.root.querySelector('.garment-slider__controls'),
      garmentTitle: this.root.querySelector('.garment-slider__title')
    };

    this.eventHandler = {};
    this.eventHandler.handleSliderCick = this.handleSliderCick.bind(this);
    this.eventHandler.setSlide = this.setSlide.bind(this);

    this.lms.prevBtn.addEventListener('click', this.eventHandler.handleSliderCick);
    this.lms.nextBtn.addEventListener('click', this.eventHandler.handleSliderCick)
    this.lms.sliderControls.addEventListener('click', this.eventHandler.setSlide);
  }

  updateSliderPos(collection) {
    this.collectionName = collection;
    this.garmentIndex = this.garmentsTitles.indexOf(collection);
  }

  dispose() {
    this.lms.prevBtn.removeEventListener('click', this.eventHandler.handleSliderCick);
    this.lms.nextBtn.removeEventListener('click', this.eventHandler.handleSliderCick)
    this.lms.sliderControls.removeEventListener('click', this.eventHandler.setSlide);
  }

  setGarmentInfoPanelInstance(garmentInfoPanel) {
    this.garmentInfoPanel = garmentInfoPanel;
  }

  handleSliderCick(e) {
    const btn = e.target.closest('.garment-slider__prev-btn, .garment-slider__next-btn');
    if (!btn) return; // clicked somewhere else

    if (btn.classList.contains('garment-slider__prev-btn')) {
      console.log('left');
      this.slide('left');
    } 
    else if (btn.classList.contains('garment-slider__next-btn')) {
      console.log('right');
      this.slide('right');
    }
  } 

  setSlide(e) {
    if (e.target.classList.contains('garment-slider__control-btn')) {
      this.garmentIndex = Number(e.target.dataset.index);
      this.collectionName = e.target.dataset.name;
      this.garmentInfoPanel.updateGarment(this.garmentInfoCollection[this.collectionName], {collection: this.collectionName});
    }

  }

  slide(direction) {
    if (direction === 'left') {
      // Move left: wrap around to the last image if garmentIndex is at the beginning
      this.garmentIndex = this.garmentIndex === 0 ? this.garmentsTitles.length - 1 : --this.garmentIndex;
    } 
    else {
      // Move right: wrap around to the first image if garmentIndex is at the end
      this.garmentIndex = this.garmentIndex === this.garmentsTitles.length - 1 ? 0 : ++this.garmentIndex;
    }

    this.collectionName = this.garmentsTitles[this.garmentIndex];

    // Update the slider to reflect the new slide
    this.garmentInfoPanel.updateGarment(this.garmentInfoCollection[this.collectionName], {collection: this.collectionName});
  }

  updateTitle() {
    console.log('garment NAME', this.collectionName)
    this.lms.garmentTitle.innerText = this.collectionName;
  }

  generateControls() {
    return this.garmentsTitles.map((title, i) => (
      `
        <li>
          <button
            data-index="${i}"
            data-name="${title}"
            class="garment-slider__control-btn"
          >${i + 1}</button>
        </li>
      `
    )).join('');
  }

  generateSlider() {
    return (
      `
      <ul class="garment-slider__controls">
        ${this.generateControls()}
      </ul>
      <div id="garment-slider" class="garment-slider"> 
        <button class="garment-slider__prev-btn">prev</button>
        <h2 id="garment-title" class="garment-slider__title">${this.collectionName}</h2>
        <button class="garment-slider__next-btn">next</button>
      </div>
      `
    );
  }
}