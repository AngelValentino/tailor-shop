import App from './core/App.js';

const canvas = document.querySelector('canvas.webgl');
const app = new App(canvas);
app.init();

const mainImg = document.querySelector('.product-gallery__photo');
const nav = document.querySelector('.product-gallery__nav');

function updateNavHeight() {
  if (!mainImg || !nav) return;
  const imgHeight = mainImg.getBoundingClientRect().height;
  nav.style.maxHeight = imgHeight + 'px';
}

if (mainImg.complete) updateNavHeight();
else mainImg.addEventListener('load', updateNavHeight);

window.addEventListener('resize', updateNavHeight);