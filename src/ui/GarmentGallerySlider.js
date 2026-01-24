import Utils from "../utils/Utils";

export default class GarmentGallerySlider {
  constructor(images) {
    this.images = images;
    this.imageIndex = 0;
    this.eventHandler = {};
    this.utils = new Utils;

    this.root = document.getElementById('garment-gallery');

    this.root.innerHTML = this.generateSlider();
    this.utils.addProgressiveLoading(document.querySelectorAll('.blur-img-loader'))

    this.lms = {
      imageSliderContainer: this.root.querySelector('.garment-gallery__photos-list'),
      imageSliderNav: this.root.querySelector('.garment-gallery__nav'),
      imageSlider: this.root
    };

    this.eventHandler.updateNavHeight = this.updateNavHeight.bind(this, false);
    this.eventHandler.handleNavClick = this.handleNavClick.bind(this);
    this.eventHandler.handleNavKeyboardA11y = this.handleNavKeyboardA11y.bind(this);
    this.refImg = this.root.querySelector('.garment-gallery__photo');
  
    setTimeout(() => {
      this.updateNavHeight(true);
    }, 20)
    this.updateSliderNav();

    window.addEventListener('resize', this.eventHandler.updateNavHeight);
    this.lms.imageSliderNav.addEventListener('click', this.eventHandler.handleNavClick);
    this.lms.imageSliderNav.addEventListener('keydown', this.eventHandler.handleNavKeyboardA11y);

    this.addSwipeEvents();
  }

  getTotalImages() {
    return this.images.medium.length;
  }

  //? keeping it a while just in case, not truly needed anymore
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

    this.lms.imageSlider.addEventListener('touchstart', this.eventHandler.touchStart, { passive: true });
    this.lms.imageSlider.addEventListener('touchmove', this.eventHandler.touchMove, { passive: true });
    this.lms.imageSlider.addEventListener('touchend', this.eventHandler.touchEnd);
    this.lms.imageSlider.addEventListener('touchcancel', this.eventHandler.touchEnd);
  }

  handleNavKeyboardA11y(e) {
    const thumb = e.target.closest('.garment-gallery__thumb');
    if (!thumb) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // prevent Space from scrolling
      const index = Number(thumb.dataset.index);
      this.setSlide(index);
    }
  }

  handleNavClick(e) {
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
      img.ariaHidden = i !== this.imageIndex;
    });
  }

  updateSliderNav() {
    const thumbs = [...this.lms.imageSliderNav.querySelectorAll('img')]
    thumbs.forEach(thumb => {
      if (Number(thumb.dataset.index) === this.imageIndex) {
        thumb.classList.add('active');
        thumb.ariaSelected = true;
      }
      else {
        thumb.classList.remove('active');
        thumb.ariaSelected = false;
      }
    });
  }

  updateNavHeight(ignoreTransition = false) {
    const nav = this.root.querySelector('.garment-gallery__nav');

    if (!this.refImg || !nav) return;

    const setHeight = () => {
      const imgHeight = this.refImg.getBoundingClientRect().height;
      nav.style.maxHeight = imgHeight + 'px';
    };

    const removeTransition = () => {
      nav.classList.add('remove-transition');
    }

    setHeight();

    if (ignoreTransition) {
      // If image is loaded, just set height; otherwise, wait for load
      if (this.refImg.complete) {
        removeTransition();
      }
      // Save this listener reference so we can remove it later
      else {
        this.refImg.addEventListener('load', removeTransition, { once: true });
      }
    }
  }

  dispose() {
    window.removeEventListener('resize', this.eventHandler.updateNavHeight);
    this.lms.imageSliderNav.removeEventListener('click', this.eventHandler.handleNavClick);
    this.lms.imageSliderNav.removeEventListener('keydown', this.eventHandler.handleNavKeyboardA11y);

    this.lms.imageSlider.removeEventListener('touchstart', this.eventHandler.touchStart);
    this.lms.imageSlider.removeEventListener('touchmove', this.eventHandler.touchMove);
    this.lms.imageSlider.removeEventListener('touchend', this.eventHandler.touchEnd);
    this.lms.imageSlider.removeEventListener('touchcancel', this.eventHandler.touchEnd);
  }

  generateSliderImages() {
    return this.images.medium.map(({ url, alt }, i) => (
      `
        <div 
          aria-roledescription="slide"
          role="tabpanel" 
          class="garment-gallery__photo-container blur-img-loader"
          aria-hidden="${this.imageIndex !== i}"
          id="garment-gallery__photo-container__item-${i + 1}" 
        >
          <img 
            class="garment-gallery__photo" 
            src="${url}" 
            alt="${alt}, image ${i + 1} of ${this.getTotalImages()}"
          >
        </div>
      `
    )).join('');
  }

  generateSliderNav() {
    return this.images.small.map(({ url, alt }, i) => (
      `
        <li role="presentation" class="garment-gallery__thumb-container blur-img-loader">
          <img 
            role="tab"
            aria-selected="${i === this.imageIndex}"
            aria-controls="garment-gallery__photo-container__item-${i + 1}"
            aria-label="Show image ${i + 1}"
            class="garment-gallery__thumb" 
            src="${url}" 
            alt="${alt}"
            data-index="${i}"
            tabindex="0"
          >
        </li>
      `
    )).join('');
  }

  generateSlider() {
    return (
      `
        <div class="garment-gallery__photos-list">
          ${this.generateSliderImages()}
        </div>
        <ul role="tablist" class="garment-gallery__nav" style="max-height: 100px;">
          ${this.generateSliderNav()}
        </ul>
      `
    );
  }
}