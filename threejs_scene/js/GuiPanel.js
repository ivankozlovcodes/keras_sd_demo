import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { XbotModel } from './models/XBot.js';
import { GenericModel } from './models/Generic.js';

const DEFAULT_MATERIALS = {
  default: null,
  depthMesh: new THREE.MeshDepthMaterial(),
};
const AVAILABLE_LAYERS = [0, 1, 2, 3, 4, 5];
const AVAILABLE_MODELS = ['xbot', 'generic'];

export class GuiPanel {
  constructor (demo) {
    this.panel = new GUI({ width: 300 });
    this.demo = demo;

    this.state = {
      controls: false,
      selectedModelType: AVAILABLE_MODELS[0],
    };
  };

  initDemoActions() {
    const folder = this.panel.addFolder('Demo Actions');
    const actions = {
      screenshot: this.demo.takeScreenshot.bind(this.demo),
      debug: this.demo.debug.bind(this.demo),
      addModel: () => this.addModel(),
    };
    folder.add(actions, 'screenshot');
    folder.add(actions, 'debug');
    folder.add(actions, 'addModel');

    folder.add(this.state, 'controls').onChange(val => this.demo.toggleControls(val));
    folder.add(this.state, 'selectedModelType', AVAILABLE_MODELS);
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
    folder.add(actions, 'layer', AVAILABLE_LAYERS).onChange(val => model.layer = val);
  }

  initLayersFolder() {
    const folder = this.panel.addFolder('Toggle Layers Visibility');
    const layersObj = AVAILABLE_LAYERS.reduce((agg, val, idx) => ({ ...agg, [idx]: true }), {});
    Object.keys(layersObj)
      .forEach(layer => folder.add(layersObj, layer)
      .onChange(() => this.demo.toggleLayer(layer)));
    folder.close();
  }

  async addModel() {
    const modelName = prompt('Paste model name').toLowerCase();
    const modelConstructorLookUpDict = {
      'xbot': XbotModel,
      'generic': GenericModel,
    };

    try {
      const model = new modelConstructorLookUpDict[this.state.selectedModelType]();
      await model.load();
      this.demo.addModel(modelName, model);
      model.initIk();
      model.initDrag();
      model.toggleControls(this.state.controls);
      this.initModelFolder(modelName, model);
    } catch (e) {
      console.warn('Wasn\'t able to create a model. There is likely another error above.');
      console.error(e);
    }
  }
}