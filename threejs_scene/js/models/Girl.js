import { BaseGltfModel } from './Base.js';

class GirlIkHelper {
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

export class GirlModel extends BaseGltfModel {
  constructor() {
    super();
    this.modelPath = './res/models/Girl_FBX2020/Girl_FBX2020.gltf';
  }

  initIk() {
    console.log(this.OOI)
    this.model.traverse(o => console.log(o.skeleton ? o.name : 'no'))
    // this.ikHelper = new GirlIkHelper(this);
    // this.ikHelper.init();
  }
}
