import { BaseGltfModel } from "./Base.js";

export class GenericModel extends BaseGltfModel {
  constructor() {
    super();
    this.modelPath = prompt('Model path').toLowerCase();
  }
};
