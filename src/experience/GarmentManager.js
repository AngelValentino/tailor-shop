import * as THREE from 'three';
import garmentInfoCollection from "../data/garmentInfoCollection.js";
import GarmentInfoPanel from "../ui/GarmentInfoPanel.js";

export default class GarmentManager {
  constructor(scene, utils, camera, cloneManager) {
    this.scene = scene;

    this.utils = utils;
    this.camera = camera;
    this.tailorShopExperience = null;
    this.cloneManager = cloneManager;
    this.garmentInfoPanel = null;

    this.currentActiveGarment = null;
    this.left = [];
    this.right = [];
    this.allMeshes = [];
    this.currentSide = null;

    this.returnToGarmentPanelBtn = document.getElementById('return-to-garment-panel-btn'); //? test element
  }

  setTailorShopExperienceInstance(tailorShopExperience) {
    this.tailorShopExperience = tailorShopExperience;
  }

  init() {
    const regex = /^prop__interactive__(.*)__(left|right)$/;

    this.scene.traverse(obj => {
      const match = obj.name.match(regex);

      if (match) {
        console.log(match)

        
        console.log(obj)
        const name = match[1];
        const side = match[2];

        obj.userData.garmentKey = name;

        console.log(side)

        if (side === 'left') {
          this.left.push(obj);
        } 
        else if (side === 'right') {
          this.right.push(obj);
        }
      }

    })
    // tag userData and create global list
    this.left.forEach(m => (m.userData.side = 'left'));
    this.right.forEach(m => (m.userData.side = 'right'));

    this.allMeshes.push(...this.left, ...this.right);

    console.log(this.allMeshes)
    return {
      left: this.left,
      right: this.right,
      all: this.allMeshes
    };
  }

  getAllMeshes() {
    return this.allMeshes;
  }

  setAllMeshes(meshes) {
    // If it's an array, push all elements
    if (Array.isArray(meshes)) {
      this.allMeshes.length = 0;
      this.allMeshes.push(...meshes);
    } 
    // If it's a single mesh, push it directly
    else {
      this.allMeshes.push(meshes);
    }
  }


  getActiveMannequin() {
    return this.currentActiveGarment;
  }

  computeCollectionCenter(side, mesh) {
    const meshes = [];
    
    if (mesh) {
      meshes.push(mesh);
    } 
    else {
      const sideMeshes = side === 'left' ? this.left : this.right
      meshes.push(...sideMeshes);
    }

    if (!meshes || meshes.length === 0) return new THREE.Vector3();

    const center = new THREE.Vector3();
    meshes.forEach(mesh => center.add(mesh.position));
    center.divideScalar(meshes.length); // average position
    return center;
  }

  computeCollectionAvgHeight(side, mesh) {
    const meshes = [];

    if (mesh) {
      meshes.push(mesh)
    } 
    else {
      const sideMeshes = side === 'left' ? this.left : this.right;
      meshes.push(...sideMeshes);
    }

    if (!meshes || meshes.length === 0) return 0;

    let sum = 0;
    meshes.forEach(m => sum += m.position.y);
    return sum / meshes.length;
  }

  restoreOppositeSide() {
    //TODO remove rotation controls for active clone
    
    console.warn('restore back to garment panel')
    // Delete the current clone and show hidden
    this.cloneManager.deleteActiveClone();
    this.cloneManager.showHidden();
   
    // Show UI
    this.garmentInfoPanel = new GarmentInfoPanel(garmentInfoCollection, this.currentActiveGarment.name, this);
    
    // Restore camera position
    this.camera.moveBack();
    
    this.returnToGarmentPanelBtn.classList.remove('active');
    this.returnToGarmentPanelBtn.removeEventListener('click', this.restoreBind);
  }

  enterCloneView() {
    //TODO add rotation controls for active clone

    // Bind restore button for exiting clone view
    this.restoreBind = this.restoreOppositeSide.bind(this);
    this.returnToGarmentPanelBtn.classList.add('active');
    this.returnToGarmentPanelBtn.addEventListener('click', this.restoreBind)

    // Clone the active mannequin and focus camera
    this.cloneManager.cloneActiveMannequin();
    this.focusOnCollection(null, this.cloneManager.getActiveClone());

    // Close garment info panel without resetting camera or active garment
    this.garmentInfoPanel.close({ resetCamera: false, deleteActiveGarmentRef: false });
  }

  onMouseEnter(mesh) {
    console.log(`Mouse entered: ${mesh.name}`);
    mesh.scale.set(1.05, 1.05, 1.05);
  }

  onMouseLeave(mesh) {
    console.log(`Mouse left: ${mesh.name}`);
    mesh.scale.set(1, 1, 1);
  }

  focusOnCollection(side, mesh) {
    const center = this.computeCollectionCenter(side, mesh);
    const avgHeight = this.computeCollectionAvgHeight(side, mesh);

    // Offset in front of collection
    const cameraOffset = new THREE.Vector3(0, 0, 4);
    const targetPos = center.clone();
    targetPos.y = avgHeight;
    targetPos.add(cameraOffset);

    this.camera.moveTo(targetPos);
    this.camera.lookAt(center);

    this.currentSide = side; // track currently focused side
  }

  updateActive(name) {
    this.resetMeshStyle(this.currentActiveGarment);
    const newActiveMesh = this.allMeshes.find(obj => obj.name === name);
    this.currentActiveGarment = newActiveMesh;
    this.applyActiveMeshStyle(this.currentActiveGarment);

    console.warn('ACTIVE:', this.currentActiveGarment)

    // Focus camera only if side changes
    if (newActiveMesh.userData.side !== this.currentSide) {
      this.focusOnCollection(newActiveMesh.userData.side);
    }
  }
  
  applyActiveMeshStyle(group) {
    group.traverse((child) => {
      if (child.isMesh && child.material && child.material.emissive) {
        // Store original emissive if not already stored
        if (!child.userData.originalEmissive) {
          child.userData.originalEmissive = child.material.emissive.clone();
        }
        child.material.emissive.setHex(0xff0000);
      }
    });
  }

  resetMeshStyle(group) {
    group.traverse((child) => {
      if (child.isMesh && child.material && child.userData.originalEmissive) {
        child.material.emissive.copy(child.userData.originalEmissive);
        delete child.userData.originalEmissive;
      }
    });
  }

  resetActiveGarment({ resetCamera = true, deleteActiveGarmentRef = true } = {}) {
    this.garmentInfoPanel = null;
    this.resetMeshStyle(this.currentActiveGarment);
    deleteActiveGarmentRef && (this.currentActiveGarment = null);
    resetCamera && this.camera.reset();
    deleteActiveGarmentRef && (this.currentSide = null);
  }

  onClick(mesh) {
    console.log(`Clicked ${mesh.userData.side} mannequin!`, mesh.name);

    if (this.currentActiveGarment === mesh) {
      console.warn('same mesh!')
      return;
    }

    // Remove styles from the previously active garment
    if (this.currentActiveGarment) {
      this.resetMeshStyle(this.currentActiveGarment);
    }

    this.applyActiveMeshStyle(mesh); // Apply styles to the newly clicked mesh
    this.currentActiveGarment = mesh; // Update active garment reference

    // If panel is open just update the UI
    if (this.garmentInfoPanel) {
      console.warn('update garment info panel instance')
      // Update garment information and set up a new active garment
      this.garmentInfoPanel.updateGarment(garmentInfoCollection[this.currentActiveGarment.name], { updateSliderPos: true, collection: this.currentActiveGarment.name });
    }
    // Create a new UI instance
    else {
      console.warn('new garment info panel instance')
      // Update garment information and set up a new active garment
      this.garmentInfoPanel = new GarmentInfoPanel(garmentInfoCollection, this.currentActiveGarment.name, this);
    }
  }
}