export default class GarmentSlider {
  constructor(garmentData, garmentKey) {
    this.garmentsTitles = Object.keys(garmentData)
    this.garmentData = garmentData;
    this.garmentKey = garmentKey;
    this.garmentIndex = this.garmentsTitles.indexOf(this.garmentKey);

    this.garmentSliderControlsSVGs = {
      'built-jacket': `
        <svg aria-hidden="true" focusable="false" role="presentation" class="garment-slider__control-btn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
            <path d="M8 4c0 1.1 1.8 2 4 2s4-.9 4-2V3c0-.6-.4-1-1-1H9c-.6 0-1 .4-1 1Z" />
            <path d="M8 4c0 2 4 5 4 10v8m0-8c0-5 4-8 4-10M6 19H3c-.6 0-1-.4-1-1V7c0-1.1.8-2.3 1.9-2.6L8 3" />
            <path d="M18 9v12c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" />
            <path d="m16 3l4.1 1.4C21.2 4.7 22 5.9 22 7v11c0 .6-.4 1-1 1h-3M6 15l2-2m10 2l-2-2" />
          </g>
        </svg>
      `,
      'pleated-trousers': `
        <svg aria-hidden="true" focusable="false" role="presentation" class="garment-slider__control-btn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
          <path fill="currentColor" d="m223.88 214l-22-176A16 16 0 0 0 186 24H70a16 16 0 0 0-15.88 14l-22 176A16 16 0 0 0 48 232h40.69a16 16 0 0 0 15.51-12.06l23.8-92l23.79 91.94A16 16 0 0 0 167.31 232H208a16 16 0 0 0 15.88-18M192.9 95.2A32.13 32.13 0 0 1 169 72h21ZM186 40l2 16H68l2-16ZM66 72h21a32.13 32.13 0 0 1-23.9 23.2Zm22.69 144H48l13-104.27A48.08 48.08 0 0 0 103.32 72H120v23Zm78.6-.06L136 95V72h16.68A48.08 48.08 0 0 0 195 111.73L208 216Z" />
        </svg>
      `,
      'built-jacket-outfit': `
        <svg aria-hidden="true" focusable="false" role="presentation" class="garment-slider__control-btn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
            <path d="m13.504 2.638l-.252.207c-.6.495-.9.743-1.252.743s-.652-.248-1.252-.743l-.252-.207c-.487-.401-.73-.602-1.021-.634c-.292-.031-.57.112-1.128.4l-.303.155c-.277.143-.416.215-.491.36s-.058.284-.023.562c.276 2.222 1.961 4.316 4.08 4.945A1.2 1.2 0 0 0 12 8.5a1.2 1.2 0 0 0 .39-.074c2.119-.629 3.804-2.723 4.08-4.945c.035-.278.052-.417-.023-.562s-.214-.217-.49-.36l-.304-.156c-.557-.287-.836-.43-1.128-.399c-.291.032-.534.233-1.02.634" />
            <path d="M7.478 4c-2.086.407-3.482 1.15-4.759 2.23c-.373.315-.56.473-.648.724c-.29.826.344 3.667 1.126 3.995c.487.204 1.168-.214 2.531-1.05C6.965 9.14 8.483 8.355 10 7.932M16.522 4c2.086.407 3.482 1.15 4.759 2.23c.373.315.56.473.648.724c.29.826-.344 3.667-1.126 3.995c-.487.204-1.168-.214-2.532-1.05C17.036 9.14 15.518 8.355 14 7.932M18 10l-.605 5.442c-.188 1.692-.282 2.538-.851 3.048c-.57.51-1.421.51-3.124.51h-2.84c-1.703 0-2.554 0-3.124-.51s-.663-1.356-.851-3.048L6 10" />
            <path d="M15.385 19h-6.77c-.255 0-.382 0-.503.014a2.06 2.06 0 0 0-1.162.533c-.089.081-.17.177-.333.368c-.32.376-.481.564-.54.707a.995.995 0 0 0 .637 1.331c.15.047.401.047.902.047h8.768c.5 0 .751 0 .902-.047a.994.994 0 0 0 .638-1.33c-.06-.144-.22-.332-.54-.708c-.164-.191-.245-.287-.334-.368a2.07 2.07 0 0 0-1.162-.533C15.767 19 15.64 19 15.385 19" />
          </g>
        </svg>
      `,
    }

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

    this.updateSliderControls();
  }

  kebabToSpaces(str) {
    return str.replace(/-/g, ' ');
  }

  updateSliderPos(garmentKey) {
    this.garmentKey = garmentKey;
    this.garmentIndex = this.garmentsTitles.indexOf(garmentKey);
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
    const controlBtn = e.target.closest('.garment-slider__control-btn')
    if (controlBtn) {
      this.garmentIndex = Number(controlBtn.dataset.index);
      this.garmentKey = controlBtn.dataset.name;
      this.garmentInfoPanel.updateGarment(this.garmentData[this.garmentKey], { garmentKey: this.garmentKey });
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

    this.garmentKey = this.garmentsTitles[this.garmentIndex];

    // Update the slider to reflect the new slide
    this.garmentInfoPanel.updateGarment(this.garmentData[this.garmentKey], { garmentKey: this.garmentKey });
  }

  updateTitle() {
    console.log('garment NAME', this.garmentKey)
    this.lms.garmentTitle.innerText = this.kebabToSpaces(this.garmentKey);
  }

  updateSliderControls() {
    const controls = [...this.lms.sliderControls.querySelectorAll('button')];
    controls.forEach(control => {
      // Highlight the active control button and update aria-selected attribute
      if (Number(control.dataset.index) === this.garmentIndex) {
        control.classList.add('active');
        control.ariaSelected = true;
      } 
      else {
        control.classList.remove('active');
        control.ariaSelected = false;
      }
    });
  }

  generateControls() {
    return this.garmentsTitles.map((title, i) => (
      `
        <li>
          <button
            data-index="${i}"
            data-name="${title}"
            class="garment-slider__control-btn"
            title="${this.kebabToSpaces(title)}"
            aria-label="See ${this.kebabToSpaces(title)}"
          >
            ${this.garmentSliderControlsSVGs[title]}
          </button>
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
        <button aria-label="Go back to previous garment" class="garment-slider__prev-btn">
          <svg class="garment-slider__prev-btn-svg" aria-hidden="true" focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g fill="none" fill-rule="evenodd">
              <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
              <path fill="currentColor" d="M7.94 13.06a1.5 1.5 0 0 1 0-2.12l5.656-5.658a1.5 1.5 0 1 1 2.121 2.122L11.122 12l4.596 4.596a1.5 1.5 0 1 1-2.12 2.122l-5.66-5.658Z" />
            </g>
          </svg>
        </button>
        <h2 id="garment-title" class="garment-slider__title">${this.kebabToSpaces(this.garmentKey)}</h2>
        <button aria-label="Sew next garment" class="garment-slider__next-btn">
          <svg class="garment-slider__next-btn-svg" aria-hidden="true" focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g fill="none" fill-rule="evenodd">
              <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
              <path fill="currentColor" d="M16.06 10.94a1.5 1.5 0 0 1 0 2.12l-5.656 5.658a1.5 1.5 0 1 1-2.121-2.122L12.879 12L8.283 7.404a1.5 1.5 0 0 1 2.12-2.122l5.658 5.657Z" />
            </g>
          </svg>
        </button>
      </div>
      `
    );
  }
}