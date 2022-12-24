import * as THREE from 'three';
import {
  GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';

export class BaseGltfModel {
  constructor() {
    this.gltf = null;
    this._demo = null;
    this.skeleton = null;
    this.ikHelper = null;
    this.defaultMaterialDict = {};
  }

  async load() {
    const loader = new GLTFLoader();

    try {
      const gltf = await loader.loadAsync(this.modelPath);
      this.gltf = gltf;
      this.postLoad();
    } catch (e) {
      console.error(e);
    }
  }

  update() {
    this.ikHelper?.ikSolver.update();
  }

  postLoad() {
    this.model.traverse(o => o.isMesh ? o.castShadow = true : o.castShadow = false);

    // memorize all materials to restore later if needed
    this.defaultMaterialsDict = this.getMaterialsDict();
  }

  setMaterial(material = null) {
    if (material === null) {
      this.model.traverse(o => {
        if (this.defaultMaterialsDict[o.name]) {
          o.material = this.defaultMaterialsDict[o.name];
        }
      })
    } else {
      this.model.traverse(o => o.material = material);
    }
  }

  getMaterialsDict() {
    const materialsDict = {};

    this.model.traverse(o => {
      materialsDict[o.name] = o.material;
    });
    return materialsDict;
  }

  initIk() {
    this.warnNotImplemented(this.initIk.name);
  }

  initDrag() {
    this.warnNotImplemented(this.initDrag.name);
  }

  toggleSkeleton(visible = true) {
    this.skeleton?.removeFromParent();
    if (visible) {
      this.skeleton = new THREE.SkeletonHelper(this.model);
      this.scene.add(this.skeleton);
    }
  }

  toggleControls() {
    this.warnNotImplemented(this.toggleControls.name);
  }

  warnNotImplemented(methodName) {
    console.warn(`${this.constructor.name}.${methodName} is not implemented`);
  }

  throwIfNotBinded() {
    if (this._demo === null) {
      throw new Error('Model has not been binded to the demo. demo is null');
    }
  }

  get OOI() {
    const OOI = {};
    this.model.traverse(o => OOI[o.name] = o);
    return OOI;
  }

  get orbitControls() {
    this.throwIfNotBinded();
    return this._demo.orbitControls;
  }

  get scene() {
    this.throwIfNotBinded();
    return this._demo.scene;
  }

  get camera() {
    this.throwIfNotBinded();
    return this._demo.camera;
  }

  get renderer() {
    this.throwIfNotBinded();
    return this._demo.renderer;
  }

  get model() {
    if (this.gltf === null) {
      throw new Error('Model has not been loaded properly. gltf is null.');
    }
    return this.gltf?.scene;
  }

  bindToDemo(demo) {
    this._demo = demo;
  }

  set layer(channel) {
    this.model.traverse(o => o.layers.set(channel));
  }
}
