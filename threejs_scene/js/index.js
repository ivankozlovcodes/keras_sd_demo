import * as THREE from 'three';
import { Demo } from './Demo.js';
import { GuiPanel } from './GuiPanel.js';
import { XbotModel } from './models/XBot.js';
import { GirlModel } from './models/girl.js';

const main = async () => {
  const demo = new Demo(document.getElementById('container'));
  const model = new XbotModel();
  const guiPanel = new GuiPanel(demo);

  await model.load();
  await demo.init();
  demo.addModel('main', model);

  demo.animate();
  model.initIk();
  model.initDrag();

  guiPanel.initDemoActions();
  guiPanel.initLayersFolder();
  guiPanel.initModelFolder('xbot', model);
}

main().then(() => console.log('Running'));
