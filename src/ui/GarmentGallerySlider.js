import MannequinInfo from "../data/MannequinInfo.js";


export default class GarmentGallerySlider {
  constructor() {
    this.images = MannequinInfo.jacket2.images;
    this.imageIndex = 0;

    this.root = document.getElementById('product-gallery')
    this.root.innerHTML = this.generateSlider();
    
    this.lms = {
      imageSliderContainer: this.root.querySelector('.product-gallery__photos-list'),
      imageSliderNav: this.root.querySelector('.product-gallery__nav'),
      imageSlider: this.root,
    }

    this.updateSliderNav();

    this.refImg = this.root.querySelector('.product-gallery__photo');
    this.boundUpdateNavHeight = this.updateNavHeight.bind(this);
    window.addEventListener('resize', this.boundUpdateNavHeight);
    this.boundUpdateNavHeight();



    this.lms.imageSliderNav.addEventListener('click', this.handleSliderClick.bind(this));
  }

  handleSliderClick(e) {
    const thumbnail = e.target.closest('.product-gallery__thumb');
    if (thumbnail) {
      const index = Number(thumbnail.dataset.index);
      this.setSlide(index);
    }
  }

  setSlide(i) {
    if (this.imageIndex === i) {
      console.warn('same index, ignoring set image');
      return;
    }
    this.imageIndex = i;
    this.updateSliderNav();
    this.updateSliderImage();
  }

  updateSliderImage() {
    const images = [...this.lms.imageSliderContainer.children]
    images.forEach((img, i) => {
      img.style.transform = `translateX(${-100 * this.imageIndex}%)`;
    });
  }

  updateSliderNav() {
    const thumbs = [...this.lms.imageSliderNav.querySelectorAll('img')]
    thumbs.forEach(thumb => {
      if (Number(thumb.dataset.index) === this.imageIndex) {
        thumb.classList.add('active');
      }
      else {
        thumb.classList.remove('active');
      }
    });
  }

  updateNavHeight() {
    const nav = this.root.querySelector('.product-gallery__nav');

    if (!this.refImg || !nav) return;

    const setHeight = () => {
      const imgHeight = this.refImg.getBoundingClientRect().height;
      nav.style.maxHeight = imgHeight + 'px';
    };


    // If image is loaded, just set height; otherwise, wait for load
    if (this.refImg.complete) {
      setHeight();
    } 
    else {
      // Save this listener reference so we can remove it later
      this.boundSetHeight = setHeight;
      this.refImg.addEventListener('load', this.boundSetHeight);
    }
  }

  disposeUpdateNavHeight() {
    window.removeEventListener('resize', this.boundUpdateNavHeight);
    if (this.boundSetHeight) {
      this.refImg.removeEventListener('load', this.boundSetHeight);
      this.boundSetHeight = null;
    }
  }

  generateSliderImages() {
    return this.images.medium.map(({ url, alt }, i) => (
      `
        <li class="product-gallery__photo-container">
          <img 
            class="product-gallery__photo" 
            src="${url}" 
            alt="${alt}"
          >
        </li>
      `
    )).join('');
  }

  generateSliderNav() {
    return this.images.small.map(({ url, alt }, i) => (
      `
        <li class="product-gallery__nav-list">
          <img 
            class="product-gallery__thumb" 
            src="${url}" 
            alt="${alt}"
            data-index="${i}"
          >
        </li>
      `
    )).join('');
  }

  generateSlider() {
    return (
      `
        <ul class="product-gallery__photos-list">
          ${this.generateSliderImages()}
        </ul>
        <ul class="product-gallery__nav" style="max-height: 287.6px;">
          ${this.generateSliderNav()}
        </ul>
      `
    );
  }
}