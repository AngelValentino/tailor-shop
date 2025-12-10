import App from './core/App.js';

const canvas = document.querySelector('canvas.webgl');
const app = new App(canvas);
app.init();

const toggleMenuBtn = document.getElementById('toggle-menu-btn');
const closeMenuBtn = document.getElementById('info-menu__close-btn');
const infoMenuLm = document.getElementById('info-menu');


//TODO Apply the same open menu logic for the garment additional info
//? Meaning i have to do a reusable class that shares all the toggle logic and
//? just have two different menus ready to be opened

import ModalHandler from './utils/ModalHandler.js';

const modalHandler = new ModalHandler();

let hideInfoMenuTimId = null;
let lastFocusedLm = null;

function closeInfoMenu() {
  infoMenuLm.classList.remove('active');
  toggleMenuBtn.style.display = 'inline-block'

  hideInfoMenuTimId = setTimeout(() => {
    infoMenuLm.style.display = 'none';
    modalHandler.toggleModalFocus('return', null, lastFocusedLm);
  }, 300);

  modalHandler.removeModalEvents({
    eventHandlerKey: 'infoModal',
    modalLm: infoMenuLm,
    closeLms: [ closeMenuBtn ]
  })
}

function openInfoMenu() {
  toggleMenuBtn.style.display = 'none';
  //TODO Hide all overlapping background UI, so we must keep a reference of all UI buttons
  //? It's just way cooler havign a bit of transparency on the menu so we must hide all visible UI always when opening it
  //? so it looks always the best having any atelier scene in the background
  //* Or not, at least try to see how it looks
  
  console.warn('TIM: ', hideInfoMenuTimId)
  clearTimeout(hideInfoMenuTimId);
  infoMenuLm.style.display = 'block';

  lastFocusedLm = modalHandler.toggleModalFocus('add', closeMenuBtn);

  setTimeout(() => {
    infoMenuLm.classList.add('active');
  });

  modalHandler.addModalEvents({
    eventHandlerKey: 'infoModal',
    modalLm: infoMenuLm,
    closeLms: [ closeMenuBtn ],
    closeHandler: closeInfoMenu
  })
}

toggleMenuBtn.addEventListener('click', openInfoMenu);
closeMenuBtn.addEventListener('click', closeInfoMenu);