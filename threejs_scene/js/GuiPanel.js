import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const DEFAULT_MATERIALS = {
  default: null,
  depthMesh: new THREE.MeshDepthMaterial(),
};
const AVAILABLE_LAYERS = [0, 1, 2, 3, 4, 5];

export class GuiPanel {
  constructor (demo) {
    this.panel = new GUI({ width: 300 });
    this.demo = demo;
  };

  initDemoActions() {
    const folder = this.panel.addFolder('Demo Actions');
    const actions = {
      screenshot: this.demo.takeScreenshot.bind(this.demo),
      debug: this.demo.debug.bind(this.demo),
    }
    Object.keys(actions).forEach(actionName => folder.add(actions, actionName));
  }

  initModelFolder(modelName, model) {
    const folder = this.panel.addFolder(modelName);
    const actions = {
      material: 'default',
      skeleton: false,
      controls: false,
      layer: 0, // by default the model is added to the 0 layer
    };
    folder.add(actions, 'material', Object.keys(DEFAULT_MATERIALS))
      .onChange(val => model.setMaterial.call(model, DEFAULT_MATERIALS[val]));
    folder.add(actions, 'skeleton').onChange(val => model.toggleSkeleton(val));
    folder.add(actions, 'controls').onChange(val => this.demo.toggleControls(val));
    folder.add(actions, 'layer', AVAILABLE_LAYERS).onChange(val => model.layer = val);
  }

  initLayersFolder() {
    const folder = this.panel.addFolder('Toggle Layers Visibility');
    const layersObj = AVAILABLE_LAYERS.reduce((agg, val, idx) => ({ ...agg, [idx]: true }), {});
    Object.keys(layersObj)
      .forEach(layer => folder.add(layersObj, layer)
      .onChange(() => this.demo.toggleLayer(layer)));
  }
}