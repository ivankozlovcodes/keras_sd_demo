import * as THREE from 'three';
import { Demo } from './Demo.js';
import { GuiPanel } from './GuiPanel.js';
import { XbotModel } from './models/XBot.js';
import { GirlModel } from './models/girl.js';

const main = async () => {
  const demo = new Demo(document.getElementById('container'));
  const guiPanel = new GuiPanel(demo);

  await demo.init();

  demo.animate();

  guiPanel.initDemoActions();
  guiPanel.initLayersFolder();
}

main().then(() => console.log('Running'));
