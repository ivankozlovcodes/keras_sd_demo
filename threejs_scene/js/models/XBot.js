import * as THREE from 'three';
import {
  GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
import {
  TransformControls
} from 'three/addons/controls/TransformControls.js';
import {
  CCDIKSolver,
  CCDIKHelper
} from 'three/addons/animation/CCDIKSolver.js';

class XbotIkHelper {
  constructor(model) {
    this.model = model;

    this.ikSolver = null;
    this.controls = [];
    this.iks = [];
  }

  get boneIndexLookUp() {
    return this.model.OOI.Beta_Joints.skeleton.bones
      .reduce((lookUp, bone, idx) => {
        lookUp[bone.name] = idx;
        return lookUp;
      }, {});
  }

  init() {
    const { OOI } = this.model;

    const leftHandIkBone = OOI.mixamorigLeftHand.clone(false);
    leftHandIkBone.name = 'leftHandIk';
    // TODO: come up with a better way
    leftHandIkBone.position.x = 100; // to straighted the hand
    OOI.mixamorigSpine.add(leftHandIkBone);
    OOI.Beta_Joints.skeleton.bones.push(leftHandIkBone);
    const leftHandIk = {
      target: this.boneIndexLookUp.leftHandIk,
      effector: this.boneIndexLookUp.mixamorigLeftHand,
      links: [
        { index: this.boneIndexLookUp.mixamorigLeftForeArm },
        { index: this.boneIndexLookUp.mixamorigLeftArm },
        { index: this.boneIndexLookUp.mixamorigLeftShoulder },
      ]
    };

    const rightHandIkBone = OOI.mixamorigRightHand.clone(false);
    rightHandIkBone.name = 'rightHandIk';
    // TODO: come up with a better way
    rightHandIkBone.position.x = -100; // to straighted the hand
    OOI.mixamorigSpine.add(rightHandIkBone);
    OOI.Beta_Joints.skeleton.bones.push(rightHandIkBone);
    const rightHandIk = {
      target: this.boneIndexLookUp.rightHandIk,
      effector: this.boneIndexLookUp.mixamorigRightHand,
      links: [
        { index: this.boneIndexLookUp.mixamorigRightForeArm },
        { index: this.boneIndexLookUp.mixamorigRightArm },
        { index: this.boneIndexLookUp.mixamorigRightShoulder },
      ]
    };

    OOI.Beta_Joints.skeleton.calculateInverses();

    this.iks = [leftHandIk, rightHandIk];
    this.ikSolver = new CCDIKSolver(OOI.Beta_Joints, this.iks);
  }

  toggle(enabled) {
    const { OOI } = this.model;

    this.ccdIkHelper?.removeFromParent();
    this.controls.forEach(c => {
      c.removeFromParent();
      c.dispose();
    });
    this.controls = [];
    if (enabled) {
      console.log(this.iks);
      this.ccdIkHelper = new CCDIKHelper(OOI.Beta_Joints, this.iks, 0.1);
      this.model.scene.add(this.ccdIkHelper)
      for (const targetBoneName of ['leftHandIk', 'rightHandIk']) {
        const transformControls = this.createControls(OOI[targetBoneName]);
        this.controls.push(transformControls);
        this.model.scene.add(transformControls);
      }
    }
  }

  createControls(targetBone) {
    const transformControls = new TransformControls(this.model.camera, this.model.renderer.domElement);
    transformControls.size = .35;
    transformControls.space = 'world';
    transformControls.attach(targetBone);
    transformControls.addEventListener('mouseDown', () => this.model.orbitControls.enabled = false);
    transformControls.addEventListener('mouseUp', () => this.model.orbitControls.enabled = true);
    return transformControls;
  }
}

export class XbotModel {
  constructor() {
    this.modelPath = 'https://threejs.org/examples/models/gltf/Xbot.glb';

    this.gltf = null;
    this.skeleton = null;
    this.defaultMaterialsDict = {};

    this._demo = null;
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

  update() {
    this.ikHelper?.ikSolver.update();
  }

  initIk() {
    this.ikHelper = new XbotIkHelper(this);
    this.ikHelper.init();
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

  toggleIk(enabled = true) {
    this.ikHelper.toggle(enabled);
  }

  bindToDemo(demo) {
    this._demo = demo;
  }

  throwIfNotBinded() {
    if (this._demo === null) {
      throw new Error('Model has not been binded to the demo. demo is null');
    }
  }
}
