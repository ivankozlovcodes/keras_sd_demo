import { BaseGltfModel } from "./Base.js";
import { DragHelper } from '../helpers/drag.js';

export class GenericModel extends BaseGltfModel {
  constructor() {
    super();
    this.modelPath = prompt('Model path').toLowerCase();

    this.dragHelper = null;
  }

  initDrag() {
    this.dragHelper = new DragHelper(this);
  }

  toggleControls(enabled = true) {
    this.dragHelper.toggleControls(enabled);
  }

  update() {
    super.update();
    this.dragHelper?.update();
  }
};
