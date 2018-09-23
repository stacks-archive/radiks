"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectSelectedModel = exports.selectIsFetchingModels = exports.selectModels = exports.selectModelsById = exports.selectModelById = exports.selectCurrentlySavingModel = exports.selectModel = void 0;

const selectModel = (state, model) => state.radiks.models[model];

exports.selectModel = selectModel;

const selectCurrentlySavingModel = (state, modelName) => {
  const model = selectModel(state, modelName);
  return !!model && !!model.currentlySaving;
};

exports.selectCurrentlySavingModel = selectCurrentlySavingModel;

const selectModelById = (state, modelName, id) => {
  const model = selectModel(state, modelName);
  return model && model.byId[id];
};

exports.selectModelById = selectModelById;

const selectModelsById = (state, modelName) => {
  const model = selectModel(state, modelName); // console.log(state, model);

  return model && model.byId;
};

exports.selectModelsById = selectModelsById;

const selectModels = (state, modelName) => {
  const model = selectModel(state, modelName);
  return model && model.models;
};

exports.selectModels = selectModels;

const selectIsFetchingModels = (state, modelName) => {
  const model = selectModel(state, modelName);
  return model && model.isFetchingModels;
};

exports.selectIsFetchingModels = selectIsFetchingModels;

const selectSelectedModel = (state, modelName) => {
  const model = selectModel(state, modelName);
  return model && model.selectedModel;
};

exports.selectSelectedModel = selectSelectedModel;