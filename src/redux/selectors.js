export const selectModel = (state, model) => state.radiks.models[model];

export const selectCurrentlySavingModel = (state, modelName) => {
  const model = selectModel(state, modelName);
  return !!model && !!model.currentlySaving;
};

export const selectModelById = (state, modelName, id) => {
  const model = selectModel(state, modelName);
  return model && model.byId[id];
};

export const selectModelsById = (state, modelName) => {
  const model = selectModel(state, modelName);
  // console.log(state, model);
  return model && model.byId;
};

export const selectModels = (state, modelName) => {
  const model = selectModel(state, modelName);
  return model && model.models;
};

export const selectIsFetchingModels = (state, modelName) => {
  const model = selectModel(state, modelName);
  return model && model.isFetchingModels;
};

export const selectSelectedModel = (state, modelName) => {
  const model = selectModel(state, modelName);
  return model && model.selectedModel;
};

export const selectUserGroupsById = state => state.radiks.userGroups.byId;
