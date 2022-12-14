import * as THREE from 'three';
import {
  GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
import {
  OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

const MODEL_PATH = 'https://threejs.org/examples/models/gltf/Xbot.glb';

class Demo {
  constructor(domElement) {
    this.container = domElement;

    this.model = null;
    this.camera = null;
    this.scene = null;
    this.stats = null;
    this.skeleton = null;
    this.renderer = null;

    this._screenshotCounter = 0;

    this.defaultModelMaterials = {};
    this.materials = {
      default: this.defaultModelMaterials,
      depth_mesh: new THREE.MeshDepthMaterial(),
    }
  }

  async init() {
    this._initScene();
    await this._loadModel();
    this._setDefaultModelMaterials();

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

    this.setModelMaterial();
    this.render();
    takeScreenshot(`canvas_mesh_${this._screenshotCounter}`);
    this.setModelMaterial('depth_mesh');
    this.render();
    takeScreenshot(`canvas_dept_hmesh_${this._screenshotCounter}`);
    this.setModelMaterial();
    this._screenshotCounter += 1;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.stats?.update();
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  setModelMaterial(materialName = 'default') {
    const material = this.materials[materialName];
    this.model.traverse(obj => {
      if (obj.isMesh) {
        obj.material = material instanceof THREE.Material ? material : material[obj.name];
      }
    });
  }

  onMaterialChange(materialName) {
    this.setModelMaterial(materialName);
  }

  async _loadModel() {
    const loader = new GLTFLoader();

    const gltf = await loader.loadAsync(MODEL_PATH);
    this.model = gltf.scene;
    this.scene.add(this.model);

    this.model.traverse((object) => object.castShadow = object.isMesh);

    this.skeleton = new THREE.SkeletonHelper(this.model);
    this.skeleton.visible = false;
    this.scene.add(this.skeleton);
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

  _setDefaultModelMaterials() {
    this.model.traverse(obj => {
      if (obj.isMesh) this.defaultModelMaterials[obj.name] = obj.material;
    });
  }
}

export { Demo };
