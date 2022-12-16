import { Demo } from './Demo.js';
import {
  GUI
} from 'three/addons/libs/lil-gui.module.min.js';

const createPanel = (demo) => {
  const panel = new GUI({
    width: 310
  });

  const folder = panel.addFolder('Demo Actions');
  const demoActions = {
    screenshot: demo.takeScreenshot.bind(demo),
    material: Object.keys(demo.materials)[0],
    showSkeleton: false,
  };
  folder.add(demoActions, 'material', Object.keys(demo.materials))
    .onChange(demo.onMaterialChange.bind(demo));
  folder.add(demoActions, 'screenshot');
  folder.add(demoActions, 'showSkeleton').onChange((val) => demo.skeleton.visible = val);
}

const main = async () => {
  const demo = new Demo(document.getElementById('container'));
  await demo.init();
  demo.animate();

  createPanel(demo);
}

main().then(() => console.log('Running'));
