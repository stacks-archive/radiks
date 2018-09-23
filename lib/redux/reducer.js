"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _cloneDeep = _interopRequireDefault(require("lodash/cloneDeep"));

var Constants = _interopRequireWildcard(require("./constants"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// import Board from '../../models/board';
const initialState = {
  models: {}
};

const getNewState = (state, name) => {
  const newState = (0, _cloneDeep.default)(state);
  newState.models[name] = newState.models[name] || {};
  newState.models[name].byId = newState.models[name].byId || {};
  return newState;
};

var _default = (state = initialState, action) => {
  switch (action.type) {
    case Constants.SAVING_MODEL:
      {
        const {
          name
        } = action.model.constructor;
        const newState = getNewState(state, name);
        newState.models[name].currentlySaving = action.model;
        action.model.currentlySaving = true;
        newState.models[name].byId[action.model.id] = action.model;
        return _objectSpread({}, newState);
      }

    case Constants.SAVED_MODEL:
      {
        const {
          name
        } = action.model.constructor;
        const newState = getNewState(state, name);
        newState.models[name].currentlySaving = false;
        action.model.currentlySaving = false;
        newState.models[name].byId[action.model.id] = action.model;
        return _objectSpread({}, newState);
      }

    case Constants.FETCHED_MODELS:
      {
        const {
          name,
          models
        } = action;
        const newState = getNewState(state, name);
        newState.models[name].models = models;
        newState.models[name].isFetchingModels = false;
        return _objectSpread({}, newState);
      }

    case Constants.FETCHING_MODELS:
      {
        const {
          name
        } = action.model.constructor;
        const newState = getNewState(state, name);
        newState.models[name].isFetchingModels = true;
        return _objectSpread({}, newState);
      }

    case Constants.FETCHING_MODEL:
      {
        const {
          model
        } = action;
        const {
          name
        } = model.constructor;
        const newState = getNewState(state, name);
        newState.models[name].byId[model.id] = model;
        return _objectSpread({}, newState);
      }

    case Constants.FETCHED_MODEL:
      {
        const {
          model
        } = action;
        const {
          name
        } = model.constructor;
        const newState = getNewState(state, name);
        newState.models[name].byId[model.id] = model;
        return _objectSpread({}, newState);
      }

    case Constants.SELECT_MODEL:
      {
        const {
          model
        } = action;
        const {
          name
        } = model.constructor;
        const newState = getNewState(state, name);
        newState.models[name].selectedModel = model;
        return _objectSpread({}, newState);
      }

    case Constants.DESELECT_MODEL:
      {
        const {
          model
        } = action;
        const {
          name
        } = model.constructor;
        const newState = getNewState(state, name);
        newState.models[name].selectedModel = null;
        return _objectSpread({}, newState);
      }

    default:
      return state;
  }
};

exports.default = _default;