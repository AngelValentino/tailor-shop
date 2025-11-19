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
}