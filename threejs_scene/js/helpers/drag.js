import * as THREE from 'three';
import { DragControls } from 'three/addons/controls/DragControls.js';

export class DragHelper {
  constructor(model, params = { init: true }) {
    this.model = model;

    this.boxHelper = null;
    this.dragBox = null;
    this.controls = null;

    if (params.init) this.init();
  }

  init() {
    const { scene, camera, renderer, orbitControls } = this.model;

    this.dragBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
    );
    this.dragBox.geometry.translate(0, 2, 0);
    this.boxHelper = new THREE.BoxHelper(this.dragBox, 0xffff00);
    this.boxHelper.visible = false;
    scene.add(this.dragBox);
    scene.add(this.boxHelper);
    this.dragControls = new DragControls([this.dragBox], camera, renderer.domElement);
    this.dragControls.deactivate();
    // this.dragControls.addEventListener('dragstart', () => console.log('dragstart'));
    this.dragControls.addEventListener('drag', (event) => event.object.position.y = 0);
    this.dragControls.addEventListener('dragstart', () => orbitControls.enabled = false);
    this.dragControls.addEventListener('dragend', () => orbitControls.enabled = true);
  }

  toggleControls(enabled = true) {
    this.boxHelper.visible = enabled;
    enabled ? this.dragControls?.activate() : this.dragControls?.deactivate();
  }

  update() {
    if (this.dragControls?.enabled) {
      this.boxHelper?.update();
      this.model.model.traverse(o => {
        if (o.isGroup) o.position.copy(this.dragBox.position);
      });
    }
  }
}
