import GarmentGallerySlider from "./GarmentGallerySlider";

export default class GarmentTitleSlider {
  constructor(mannequinInfo) {
    this.garmentName = 'jacket2';
    this.garmentIndex = 0;
    this.garmentsTitles = Object.keys(mannequinInfo)
    this.garmentInfo = mannequinInfo;
    this.garmentGallerySlider = new GarmentGallerySlider(this.garmentInfo[this.garmentName].images);

    this.root = document.getElementById('title-slider');
    this.root.innerHTML = this.generateSlider();

    this.garmentH1Lm = document.getElementById('garment-h1');
    this.garmentInfoLm = document.getElementById('garment-info');

    this.lms = {
      prevBtn: this.root.querySelector('.garment-slider__prev-btn'),
      nextBtn: this.root.querySelector('.garment-slider__next-btn'),
      slider: this.root,
      sliderControls: this.root.querySelector('.garment-slider__controls'),
      garmentTitle: this.root.querySelector('.garment__title')
    };

    this.lms.prevBtn.addEventListener('click', this.handleSliderCick.bind(this));
    this.lms.nextBtn.addEventListener('click', this.handleSliderCick.bind(this))
    this.lms.sliderControls.addEventListener('click', this.setSlide.bind(this));
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
      this.garmentName = e.target.dataset.name;
      this.updateSliderTitles();
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

    this.garmentName = this.garmentsTitles[this.garmentIndex];

    // Update the slider to reflect the new slide
    this.updateSliderTitles();
  }

  updateInfo({ title, description }) {
    this.garmentH1Lm.innerText = title;
    this.garmentInfo.innerText = description;
  }

  updateSliderTitles() {
    this.lms.garmentTitle.innerText = this.garmentName;
    
    this.garmentGallerySlider.dispose();
    this.garmentGallerySlider = new GarmentGallerySlider(this.garmentInfo[this.garmentName].images);

    this.updateInfo(this.garmentInfo[this.garmentName]);
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
        <h2 id="garment-title" class="garment__title">jacket2</h2>
        <button class="garment-slider__next-btn">next</button>
      </div>
      `
    );
  }
}