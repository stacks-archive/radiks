const selectModel = (state, model) => state.radiks.models[model];

const selectCurrentlySavingModel = (state, modelName) => {
  const model = selectModel(state, modelName);
  return !!model && !!model.currentlySaving;
};

const selectModelById = (state, modelName, id) => {
  const model = selectModel(state, modelName);
  return model && model.byId[id];
};

const selectModelsById = (state, modelName) => {
  const model = selectModel(state, modelName);
  // console.log(state, model);
  return model && model.byId;
};

const selectModels = (state, modelName) => {
  const model = selectModel(state, modelName);
  return model && model.models;
};

const selectIsFetchingModels = (state, modelName) => {
  const model = selectModel(state, modelName);
  return model && model.isFetchingModels;
};

const selectSelectedModel = (state, modelName) => {
  const model = selectModel(state, modelName);
  return model && model.selectedModel;
};

module.exports = {
  selectModel,
  selectCurrentlySavingModel,
  selectModelById,
  selectModelsById,
  selectModels,
  selectIsFetchingModels,
  selectSelectedModel,
}