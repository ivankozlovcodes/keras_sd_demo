import * as THREE from 'three';
import {
  GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';

export class XbotModel {
  constructor() {
    this.modelPath = 'https://threejs.org/examples/models/gltf/Xbot.glb';

    this.gltf = null;
    this.skeleton = null;
    this.defaultMaterialsDict = {};

    this._scene = null;
  }

  get scene() {
    if (this._scene === null) {
      throw new Error('Model has not been binded to the scene. scene is null.');
    }
    return this._scene;
  }

  get model() {
    if (this.gltf === null) {
      throw new Error('Model has not been loaded properly. gltf is null.');
    }
    return this.gltf?.scene;
  }

  get OOI() {
    const OOI = {};
    this.model.traverse(o => OOI[o.name] = o);
    return OOI;
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

  postLoad() {
    this.model.traverse(o => o.isMesh ? o.castShadow = true : o.castShadow = false);

    // memorize all materials to restore later if needed
    this.defaultMaterialsDict = this.getMaterialsDict();
  }

  toggleSkeleton(visible = true) {
    this.skeleton?.removeFromParent();
    if (visible) {
      this.skeleton = new THREE.SkeletonHelper(this.model);
      this.scene.add(this.skeleton);
    }
  }

  bindToScene(scene) {
    this._scene = scene;
  }
}
