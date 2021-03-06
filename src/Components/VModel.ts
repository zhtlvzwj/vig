/**
 * Copyright(c) 2016 calidion <calidion@gmail.com>
 * Apache 2.0 Licensed
 */

import { VBase } from "./VBase";
import * as Waterline from "waterline";
import { promisify } from "bluebird";

export class VModel extends VBase {
  public static async fetch(config, options) {
    if (VModel.initialized) {
      return VModel.models;
    }
    return await VModel.prepare(config, options);
  }

  public static async prepare(config, options) {
    const waterline = new Waterline();
    const data: any = VModel.data;
    for (const key in data) {
      if (typeof key === "string") {
        const model = data[key];
        for (const k in options) {
          if (typeof k === "string") {
            model[k] = options[k];
          }
        }
        const connection = Waterline.Collection.extend(model);
        waterline.loadCollection(connection);
      }
    }

    const initialize = promisify(waterline.initialize);
    const ontology = await initialize.call(waterline, config);
    const results = {};
    for (const key of Object.keys(data)) {
      results[key] = ontology.collections[data[key].identity];
    }
    VModel.initialized = true;
    VModel.models = results;
    return results;
  }

  protected static initialized = false;
  protected static data = {};
  protected static models = {};

  constructor(basePath = "") {
    super(basePath)
    this.defaultPath = "models";
  }

  public parse(scope) {
    if (VModel.initialized) {
      scope.models = VModel.models;
    }
  }

  public isType(item: any): boolean {
    return item.attributes instanceof Object;
  }

  public loadOn(data = null) {
    if (!data) {
      this.set(this.load());
      data = this.data;
    }
    VModel.data = Object.assign(VModel.data, data);
  }
}
