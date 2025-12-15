export default class Utils {
  addProgressiveLoading(elements) {
    elements.forEach(imgContainerLm => {
      // Select the thumbnail image within the container
      const thumbnailImg = imgContainerLm.querySelector('img');

      // Function to handle actions once the image is fully loaded
      function loaded() {
        // Add the 'loaded' class to the container, indicating the image has loaded
        imgContainerLm.classList.add('loaded');
        // Set the image's 'aria-busy' attribute indicating that has finished loading
        thumbnailImg.ariaBusy = 'false';

        // Delay to smoothly transition from low-res to full-res image
        setTimeout(() => {
          // Remove the low-resolution background image
          imgContainerLm.style.backgroundImage = 'none';
          // Remove blur img container loader background color 
          imgContainerLm.style.backgroundColor = 'transparent';
        }, 250);
      }
    
      // If the image has already been fully loaded, trigger the loaded function immediately
      if (thumbnailImg.complete) {
        loaded();
      } 
      // Otherwise, add an event listener to handle the image load event
      else {
        thumbnailImg.addEventListener('load', loaded);
        // Mark the image as loadeing via 'aria-busy' attribute
        thumbnailImg.ariaBusy = 'true';
      }
    });
  }

  removeMesh(mesh, scene) {
    if (!mesh) return;

    // Remove from scene
    if (scene && mesh.parent === scene) scene.remove(mesh);

    // Recursively dispose children
    mesh.children.forEach(child => {
      this.removeMesh(child);
    });

    // Dispose geometry
    mesh.geometry?.dispose();

    // Dispose material(s) and their textures
    if (mesh.material) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach(mat => {
        mat.map?.dispose();
        mat.dispose();
      });
    }
  }

  isTouchBasedDevice() {
    return window.matchMedia('(pointer: coarse)').matches;
  }

  isPortrait() {
    return window.innerHeight > window.innerWidth;
  }

  handleSwipe(onSwipeLeft, onSwipeRight, minSwipeDistance = 25) {
    let touchStartX = null;
    let touchStartY = null;
    let touchEndX = null;
    let touchEndY = null;

    function handleTouchStart(e) {
      touchStartX = e.targetTouches[0].clientX;
      touchStartY = e.targetTouches[0].clientY;
    }

    function handleTouchMove(e) {
      touchEndX = e.targetTouches[0].clientX;
      touchEndY = e.targetTouches[0].clientY;
    }

    function handleTouchEnd() {
      if (touchStartX === null || touchEndX === null || touchStartY === null || touchEndY === null) return;

      const distanceX = touchStartX - touchEndX;
      const distanceY = touchStartY - touchEndY;
      const isLeftSwipe = distanceX > minSwipeDistance;
      const isRightSwipe = distanceX < -minSwipeDistance;

      if (isRightSwipe && Math.abs(distanceX) > Math.abs(distanceY)) {
        onSwipeRight();
      }

      if (isLeftSwipe && Math.abs(distanceX) > Math.abs(distanceY)) {
        onSwipeLeft();
      }

      // Reset touch positions
      touchStartX = null;
      touchStartY = null;
      touchEndX = null;
      touchEndY = null;
    }

    return {
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    };
  }
}