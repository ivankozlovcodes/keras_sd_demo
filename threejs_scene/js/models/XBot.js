import * as THREE from 'three';
import {
  TransformControls
} from 'three/addons/controls/TransformControls.js';
import {
  CCDIKSolver,
} from 'three/addons/animation/CCDIKSolver.js';

import { BaseGltfModel } from './Base.js';
import { SkeletonHelper } from '../helpers/skeleton.js';
import { DragHelper } from '../helpers/drag.js';

class XbotIkHelper {
  constructor(model) {
    this.model = model;

    this.ikSolver = null;
    this.controls = [];
    this.iks = [];
    const { OOI } = this.model;
    this.IK_TARGET_INFO = [
      {
        targetName: 'leftHandTarget',
        targetPosition: OOI.mixamorigLeftHand.position.clone().add(new THREE.Vector3(50, 0, 0)),
        targetParent: OOI.mixamorigSpine,
      },
      {
        targetName: 'rightHandTarget',
        targetPosition: OOI.mixamorigRightHand.position.clone().add(new THREE.Vector3(-50, 0, 0)),
        targetParent: OOI.mixamorigSpine,
      },
      {
        targetName: 'leftForeArmTarget',
        targetPosition: OOI.mixamorigLeftForeArm.position.clone().add(new THREE.Vector3(10, 20, 0)),
        targetParent: OOI.mixamorigSpine,
      },
      {
        targetName: 'rightForeArmTarget',
        targetPosition: OOI.mixamorigRightForeArm.position.clone().add(new THREE.Vector3(-10, 20, 0)),
        targetParent: OOI.mixamorigSpine,
      },
      {
        targetName: 'leftFootTarget',
        targetPosition: OOI.mixamorigLeftFoot.position.clone().sub(new THREE.Vector3(-10, 100, 0)),
        targetParent: OOI.mixamorigSpine,
      },
      {
        targetName: 'leftLegTarget',
        targetPosition: OOI.mixamorigLeftLeg.position.clone().sub(new THREE.Vector3(-10, 20, 0)),
        targetParent: OOI.mixamorigSpine,
      },
      {
        targetName: 'rightFootTarget',
        targetPosition: OOI.mixamorigRightFoot.position.clone().sub(new THREE.Vector3(10, 100, 0)),
        targetParent: OOI.mixamorigSpine,
      },
      {
        targetName: 'rightLegTarget',
        targetPosition: OOI.mixamorigRightLeg.position.clone().sub(new THREE.Vector3(10, 20, 0)),
        targetParent: OOI.mixamorigSpine,
      },
    ];
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

    for (const { targetName, targetPosition, targetParent } of this.IK_TARGET_INFO) {
      const bone = SkeletonHelper.createIkTargetBone(targetName, targetPosition);
      SkeletonHelper.addIkTargetBoneToSkeleton(bone, targetParent, OOI.Beta_Joints.skeleton);
    }
    const defaultIkParams = {
      maxAngle: 0.1,
    }
    this.iks = [
      {
        target: this.boneIndexLookUp.leftHandTarget,
        effector: this.boneIndexLookUp.mixamorigLeftHand,
        links: [
          { index: this.boneIndexLookUp.mixamorigLeftForeArm },
        ],
        ...defaultIkParams,
      },
      {
        target: this.boneIndexLookUp.leftForeArmTarget,
        effector: this.boneIndexLookUp.mixamorigLeftForeArm,
        links: [
          { index: this.boneIndexLookUp.mixamorigLeftArm },
        ],
        ...defaultIkParams,
      },
      {
        target: this.boneIndexLookUp.rightHandTarget,
        effector: this.boneIndexLookUp.mixamorigRightHand,
        links: [
          { index: this.boneIndexLookUp.mixamorigRightForeArm },
        ],
        ...defaultIkParams,
      },
      {
        target: this.boneIndexLookUp.rightForeArmTarget,
        effector: this.boneIndexLookUp.mixamorigRightForeArm,
        links: [
          { index: this.boneIndexLookUp.mixamorigRightArm },
        ],
        ...defaultIkParams,
      },
      {
        target: this.boneIndexLookUp.leftFootTarget,
        effector: this.boneIndexLookUp.mixamorigLeftFoot,
        links: [
          { index: this.boneIndexLookUp.mixamorigLeftLeg },
        ],
        ...defaultIkParams,
      },
      {
        target: this.boneIndexLookUp.leftLegTarget,
        effector: this.boneIndexLookUp.mixamorigLeftLeg,
        links: [
          { index: this.boneIndexLookUp.mixamorigLeftUpLeg },
        ],
        ...defaultIkParams,
      },
      {
        target: this.boneIndexLookUp.rightFootTarget,
        effector: this.boneIndexLookUp.mixamorigRightFoot,
        links: [
          { index: this.boneIndexLookUp.mixamorigRightLeg },
        ],
        ...defaultIkParams,
      },
      {
        target: this.boneIndexLookUp.rightLegTarget,
        effector: this.boneIndexLookUp.mixamorigRightLeg,
        links: [
          { index: this.boneIndexLookUp.mixamorigRightUpLeg },
        ],
        ...defaultIkParams,
      },
    ];
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
      this.ccdIkHelper = this.ikSolver.createHelper();
      this.model.scene.add(this.ccdIkHelper)
      for (const targetBoneName of this.IK_TARGET_INFO.map(o => o.targetName)) {
        const transformControls = this.createControls(OOI[targetBoneName]);
        this.controls.push(transformControls);
        this.model.scene.add(transformControls);
      }
    }
  }

  createControls(targetBone) {
    const transformControls = new TransformControls(this.model.camera, this.model.renderer.domElement);
    transformControls.size = .15;
    transformControls.space = 'world';
    transformControls.attach(targetBone);
    transformControls.addEventListener('mouseDown', () => this.model.orbitControls.enabled = false);
    transformControls.addEventListener('mouseUp', () => this.model.orbitControls.enabled = true);
    return transformControls;
  }
}

export class XbotModel extends BaseGltfModel {
  constructor() {
    super();
    this.modelPath = 'https://threejs.org/examples/models/gltf/Xbot.glb';

    this.rotateBones = [];
    this.controls = [];

    this.dragHelper = null;
  }

  postLoad() {
    super.postLoad();
  }

  initIk() {
    this.ikHelper = new XbotIkHelper(this);
    this.ikHelper.init();
  }

  initDrag() {
    this.dragHelper = new DragHelper(this);
  }

  toggleControls(enabled = true) {
    this.ikHelper?.toggle(enabled);
    this.dragHelper?.toggleControls(enabled);
    if (!enabled) {
      this.controls.forEach(c => c.removeFromParent().dispose());
    } else {
      this.controls = this.rotateBones
        .map(bone => {
          const controls = new TransformControls(this.camera, this.renderer.domElement);
          controls.size = .15;
          controls.space = 'world';
          controls.setMode('rotate');
          controls.attach(bone);
          controls.addEventListener('mouseDown', () => this.orbitControls.enabled = false);
          controls.addEventListener('mouseUp', () => this.orbitControls.enabled = true);
          this.scene.add(controls);
          return controls;
        });
    }
  }

  update() {
    super.update();
    this.dragHelper?.update();
  }
}
