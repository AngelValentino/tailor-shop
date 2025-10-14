export default class GarmentGallerySlider {
  constructor(images) {
    this.images = images;
    this.imageIndex = 0;

    this.root = document.getElementById('garment-gallery');

    this.preloadImages().then(() => {
      //TODO Needs a loader to inform user the next images are being updated
      this.root.innerHTML = this.generateSlider();

      this.lms = {
        imageSliderContainer: this.root.querySelector('.garment-gallery__photos-list'),
        imageSliderNav: this.root.querySelector('.garment-gallery__nav'),
        imageSlider: this.root,
      };

      this.updateSliderNav();

      this.eventHandler = {};
      this.eventHandler.updateNavHeight = this.updateNavHeight.bind(this);

      this.refImg = this.root.querySelector('.garment-gallery__photo');
      window.addEventListener('resize', this.eventHandler.updateNavHeight);
      this.eventHandler.updateNavHeight();

      this.eventHandler.handleSliderClick = this.handleSliderClick.bind(this);
      this.lms.imageSliderNav.addEventListener('click', this.eventHandler.handleSliderClick);
    });
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

  handleSliderClick(e) {
    const thumbnail = e.target.closest('.garment-gallery__thumb');
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
    else {
      // Save this listener reference so we can remove it later
      this.eventHandler.setHeight = setHeight;
      this.refImg.addEventListener('load', this.eventHandler.setHeight);
    }
  }

  dispose() {
    window.removeEventListener('resize', this.eventHandler.updateNavHeight);
    this.refImg.removeEventListener('load', this.eventHandler.setHeight);
    this.lms.imageSliderNav.removeEventListener('click', this.eventHandler.handleSliderClick);
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