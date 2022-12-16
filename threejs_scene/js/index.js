import * as THREE from 'three';
import { Demo } from './Demo.js';
import { XbotModel } from './models/XBot.js';
import {
  GUI
} from 'three/addons/libs/lil-gui.module.min.js';

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
  const xBotModel = demo.models.xBot;
  const xBotFolder = panel.addFolder('Xbot Actions');
  const xBotActions = {
    material: 'default',
    showSkeleton: false,
  };
  xBotFolder.add(xBotActions, 'material', Object.keys(defaultMaterials))
    .onChange(val => xBotModel.setMaterial.call(xBotModel, defaultMaterials[val]));
  xBotFolder.add(xBotActions, 'showSkeleton').onChange((val) => xBotModel.toggleSkeleton(val));
}

const main = async () => {
  const demo = new Demo(document.getElementById('container'));
  const xBot = new XbotModel();

  await xBot.load();
  await demo.init();
  demo.addModel('xBot', xBot);

  demo.animate();

  createPanel(demo);
}

main().then(() => console.log('Running'));
