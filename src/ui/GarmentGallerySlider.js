import Utils from "../utils/Utils";

export default class GarmentGallerySlider {
  constructor(images) {
    this.images = images;
    this.imageIndex = 0;
    this.eventHandler = {};
    this.utils = new Utils;

    this.root = document.getElementById('garment-gallery');

    //TODO Needs a loader to inform user the next images are being updated
    this.preloadImages().then(() => {
      this.root.innerHTML = this.generateSlider();

      this.lms = {
        imageSliderContainer: this.root.querySelector('.garment-gallery__photos-list'),
        imageSliderNav: this.root.querySelector('.garment-gallery__nav'),
        imageSlider: this.root
      };
  
      this.eventHandler.updateNavHeight = this.updateNavHeight.bind(this);
      this.eventHandler.handleSliderClick = this.handleSliderClick.bind(this);
      this.refImg = this.root.querySelector('.garment-gallery__photo');
    
      this.eventHandler.updateNavHeight();
      this.updateSliderNav();

      window.addEventListener('resize', this.eventHandler.updateNavHeight);
      this.lms.imageSliderNav.addEventListener('click', this.eventHandler.handleSliderClick);

      this.addSwipeEvents();
    });
  }

  getTotalImages() {
    return this.images.medium.length;
  }

  preloadImages() {
    const allImages = [...this.images.medium, ...this.images.small];
    const promises = allImages.map(({ url }) => new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => resolve(); // resolve even if image fails to load
    }));
    return Promise.all(promises);
  }

  addSwipeEvents() {
    const {
      handleTouchStart, 
      handleTouchMove, 
      handleTouchEnd
    } = this.utils.handleSwipe(this.slide.bind(this, 'right'), this.slide.bind(this, 'left'));
      
    this.eventHandler.touchStart = handleTouchStart;
    this.eventHandler.touchMove = handleTouchMove;
    this.eventHandler.touchEnd = handleTouchEnd;

    this.lms.imageSlider.addEventListener('touchstart', this.eventHandler.touchStart);
    this.lms.imageSlider.addEventListener('touchmove', this.eventHandler.touchMove);
    this.lms.imageSlider.addEventListener('touchend', this.eventHandler.touchEnd);
    this.lms.imageSlider.addEventListener('touchcancel', this.eventHandler.touchEnd);
  }

  handleSliderClick(e) {
    const thumbnail = e.target.closest('.garment-gallery__thumb');
    if (thumbnail) {
      const index = Number(thumbnail.dataset.index);
      this.setSlide(index);
    }
  }

  slide(direction) {
    const totalImages = this.getTotalImages();

    if (direction === 'left') {
      // Move left: wrap around to the last image if imageIndex is at the beginning
      this.imageIndex = this.imageIndex === 0 ? totalImages - 1 : --this.imageIndex;
    } 
    else {
      // Move right: wrap around to the first image if imageIndex is at the end
      this.imageIndex = this.imageIndex === totalImages - 1 ? 0 : ++this.imageIndex;
    }

    this.updateSliderNav();
    this.updateSliderImage();
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
    const nav = this.root.querySelector('.garment-gallery__nav');

    if (!this.refImg || !nav) return;

    const setHeight = () => {
      const imgHeight = this.refImg.getBoundingClientRect().height;
      nav.style.maxHeight = imgHeight + 'px';
    };

    // If image is loaded, just set height; otherwise, wait for load
    if (this.refImg.complete) {
      setHeight();
    }
    // Save this listener reference so we can remove it later
    else {
      this.eventHandler.setHeight = setHeight;
      this.refImg.addEventListener('load', this.eventHandler.setHeight);
    }
  }

  dispose() {
    window.removeEventListener('resize', this.eventHandler.updateNavHeight);
    this.refImg.removeEventListener('load', this.eventHandler.setHeight);
    this.lms.imageSliderNav.removeEventListener('click', this.eventHandler.handleSliderClick);

    this.lms.imageSlider.removeEventListener('touchstart', this.eventHandler.touchStart);
    this.lms.imageSlider.removeEventListener('touchmove', this.eventHandler.touchMove);
    this.lms.imageSlider.removeEventListener('touchend', this.eventHandler.touchEnd);
    this.lms.imageSlider.removeEventListener('touchcancel', this.eventHandler.touchEnd);
  }

  generateSliderImages() {
    return this.images.medium.map(({ url, alt }, i) => (
      `
        <li class="garment-gallery__photo-container">
          <img 
            class="garment-gallery__photo" 
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
        <li class="garment-gallery__nav-list">
          <img 
            class="garment-gallery__thumb" 
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
        <ul class="garment-gallery__photos-list">
          ${this.generateSliderImages()}
        </ul>
        <ul class="garment-gallery__nav" style="max-height: 287.6px;">
          ${this.generateSliderNav()}
        </ul>
      `
    );
  }
}