import App from './core/App.js';
import GarmentTitleSlider from './ui/GarmentTitleSlider.js';
import GarmentGallerySlider from './ui/GarmentGallerySlider.js';
import MannequinInfo from './data/MannequinInfo.js';

const canvas = document.querySelector('canvas.webgl');
const app = new App(canvas);
app.init();


new GarmentTitleSlider(MannequinInfo, GarmentGallerySlider);