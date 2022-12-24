import * as THREE from 'three';
import {
  OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

const MODEL_PATH = 'https://threejs.org/examples/models/gltf/Xbot.glb';

class Demo {
  constructor(domElement) {
    this.container = domElement;

    this.camera = null;
    this.scene = null;
    this.stats = null;
    this.renderer = null;
    this.models = {};

    this._screenshotCounter = 0;
  }

  async init() {
    this._initScene();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 100);
    this.camera.position.set(1, 1, 2);
    this.camera.layers.enableAll();

    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enablePan = true;
    this.orbitControls.enableZoom = true;
    this.orbitControls.target.set(0, 1, 0);
    this.orbitControls.update();

    this.stats = new Stats();
    this.container.appendChild(this.stats.dom);

    window.addEventListener('resize', this._onWindowResize.bind(this));
  }

  takeScreenshot() {
    const takeScreenshot = (filename) => {
      const a = document.createElement('a');
      a.href = this.renderer.domElement.toDataURL().replace("image/png", "image/octet-stream");
      a.download = `${filename}.png`;
      a.click();
      a.remove();
    };
    this.toggleControls(false);

    for (const modelName of Object.keys(this.models)) {
      const model = this.models[modelName];
      model.toggleSkeleton(false);
      model.setMaterial();
      this.render();
      takeScreenshot(`canvas_mesh_${this._screenshotCounter}`);
      // TODO: get from a shared material dictionary
      model.setMaterial(new THREE.MeshDepthMaterial());
      this.render();
      takeScreenshot(`canvas_dept_hmesh_${this._screenshotCounter}`);
      model.setMaterial();
    }
    this._screenshotCounter += 1;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.stats?.update();
    for (const model of Object.values(this.models)) {
      model.update();
    }
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  addModel(name, model) {
    if (this.models[name]) {
      throw new Error(`Model with a name ${name} already exists`);
    }
    this.models[name] = model;
    this.scene.add(model.model);
    model.bindToDemo(this);
  }

  toggleControls(enabled) {
    Object.values(this.models).forEach(model => model.toggleControls(enabled));
  }

  toggleLayer(channel) {
    this.camera.layers.toggle(channel);
  }

  debug() {
    console.group('Debug info');
    Object.values(this.models).forEach(m => console.log(m.OOI));
    console.groupEnd();
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa0a0a0);
    this.scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    // lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 500, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(3, 10, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.camera.left = -2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    this.scene.add(dirLight);

    // ground

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({
      color: 0x999999,
      depthWrite: false
    }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  _onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export { Demo };
