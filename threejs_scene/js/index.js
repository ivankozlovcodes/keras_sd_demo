import * as THREE from 'three';
import { Demo } from './Demo.js';
import {
  GUI
} from 'three/addons/libs/lil-gui.module.min.js';
import { XbotModel } from './models/XBot.js';
import { GirlModel } from './models/girl.js';

const createPanel = (demo) => {
  const panel = new GUI({
    width: 310
  });
  const defaultMaterials = {
    default: null,
    depthMesh: new THREE.MeshDepthMaterial(),
  }

  const demoFolder = panel.addFolder('Demo Actions');
  const demoActions = {
    screenshot: demo.takeScreenshot.bind(demo),
  };
  demoFolder.add(demoActions, 'screenshot');
  const model = demo.models.main;
  const modelFolder = panel.addFolder('Model Actions');
  const modelActions = {
    material: 'default',
    showSkeleton: false,
    ik: false,
  };
  modelFolder.add(modelActions, 'material', Object.keys(defaultMaterials))
    .onChange(val => model.setMaterial.call(model, defaultMaterials[val]));
  modelFolder.add(modelActions, 'showSkeleton').onChange((val) => model.toggleSkeleton(val));
  modelFolder.add(modelActions, 'ik').onChange(val => demo.toggleControls(val));
}

const main = async () => {
  const demo = new Demo(document.getElementById('container'));
  const model = new XbotModel();

  await model.load();
  await demo.init();
  demo.addModel('main', model);

  demo.animate();
  model.initIk();
  model.initDrag();

  createPanel(demo);
}

main().then(() => console.log('Running'));
