export default class Utils {
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