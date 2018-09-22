const clone = require('lodash/cloneDeep');
const Constants = require('./constants');

const initialState = {
  models: {},
};

const getNewState = (state, name) => {
  const newState = clone(state);
  newState.models[name] = newState.models[name] || {};
  newState.models[name].byId = newState.models[name].byId || {};
  return newState;
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case Constants.SAVING_MODEL: {
      const { name } = action.model.constructor;
      const newState = getNewState(state, name);
      newState.models[name].currentlySaving = action.model;
      action.model.currentlySaving = true;
      newState.models[name].byId[action.model.id] = action.model;
      return {
        ...newState,
      };
    }
    case Constants.SAVED_MODEL: {
      const { name } = action.model.constructor;
      const newState = getNewState(state, name);
      newState.models[name].currentlySaving = false;
      action.model.currentlySaving = false;
      newState.models[name].byId[action.model.id] = action.model;
      return {
        ...newState,
      };
    }
    case Constants.FETCHED_MODELS: {
      const { name, models } = action;
      const newState = getNewState(state, name);
      newState.models[name].models = models;
      newState.models[name].isFetchingModels = false;
      return {
        ...newState,
      };
    }
    case Constants.FETCHING_MODELS: {
      const { name } = action.model.constructor;
      const newState = getNewState(state, name);
      newState.models[name].isFetchingModels = true;
      return {
        ...newState,
      };
    }
    case Constants.FETCHING_MODEL: {
      const { model } = action;
      const { name } = model.constructor;
      const newState = getNewState(state, name);
      newState.models[name].byId[model.id] = model;
      return {
        ...newState,
      };
    }
    case Constants.FETCHED_MODEL: {
      const { model } = action;
      const { name } = model.constructor;
      const newState = getNewState(state, name);
      newState.models[name].byId[model.id] = model;
      return {
        ...newState,
      };
    }
    case Constants.SELECT_MODEL: {
      const { model } = action;
      const { name } = model.constructor;
      const newState = getNewState(state, name);
      newState.models[name].selectedModel = model;
      return {
        ...newState,
      };
    }
    case Constants.DESELECT_MODEL: {
      const { model } = action;
      const { name } = model.constructor;
      const newState = getNewState(state, name);
      newState.models[name].selectedModel = null;
      return { ...newState };
    }
    default:
      return state;
  }
};

module.exports = reducer;