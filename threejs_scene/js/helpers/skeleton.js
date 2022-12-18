import * as THREE from 'three';

export class SkeletonHelper {
  static createIkTargetBone(boneName, position) {
    const bone = new THREE.Bone();
    bone.name = boneName;
    bone.position.copy(position);
    return bone;
  }

  static addIkTargetBoneToSkeleton(targetBone, parentBone, skeleton) {
    parentBone.add(targetBone);
    skeleton.bones.push(targetBone);
    skeleton.boneInverses.push(targetBone.matrixWorld.invert());
  }
}
