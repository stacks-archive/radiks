"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var Constants = _interopRequireWildcard(require("./constants"));

var _helpers = require("../helpers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const savingModel = model => ({
  type: Constants.SAVING_MODEL,
  model
});

const savedModel = model => ({
  type: Constants.SAVED_MODEL,
  model
});

const fetchingModels = model => ({
  type: Constants.FETCHING_MODELS,
  model
});

const fetchedModels = (modelName, models) => ({
  type: Constants.FETCHED_MODELS,
  name: modelName,
  models
});

const fetchingModel = model => ({
  type: Constants.FETCHING_MODEL,
  model
});

const fetchedModel = model => ({
  type: Constants.FETCHED_MODEL,
  model
});

const selectModel = model => ({
  type: Constants.SELECT_MODEL,
  model
});

const deselectModel = model => ({
  type: Constants.DESELECT_MODEL,
  model
});

const saveModel = model => function innerSaveModel(dispatch, getState) {
  return Promise.resolve().then(function () {
    const {
      currentUser
    } = getState().user;
    model.createdBy = currentUser;
    dispatch(savingModel(model));
    return model.save();
  }).then(function () {
    // console.log(file, items);
    dispatch(savedModel(model));
  });
};

const fetchList = Model => function innerfetchList(dispatch) {
  return Promise.resolve().then(function () {
    dispatch(fetchingModels(Model));
    return Model.fetch();
  }).then(function (_resp) {
    const {
      models
    } = _resp; // console.log(models);

    const decryptedModels = models.map(object => {
      const decrypted = (0, _helpers.decryptObject)(object, Model); // console.log(decrypted);

      return new Model(decrypted);
    }); // console.log(decryptedModels);

    dispatch(fetchedModels(Model.constructor, decryptedModels));
  });
};

const fetchModel = model => function innerFetchModel(dispatch) {
  return Promise.resolve().then(function () {
    dispatch(fetchingModel(model));
    return model.fetch();
  }).then(function () {
    // console.log(model);
    dispatch(fetchedModel(model));
  });
};

var _default = {
  saveModel,
  fetchList,
  fetchModel,
  selectModel,
  deselectModel
};
exports.default = _default;