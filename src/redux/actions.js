import * as Constants from './constants';
import { decryptObject } from '../helpers';

const savingModel = model => ({
  type: Constants.SAVING_MODEL,
  model,
});

const savedModel = model => ({
  type: Constants.SAVED_MODEL,
  model,
});

const fetchingModels = model => ({
  type: Constants.FETCHING_MODELS,
  model,
});

const fetchedModels = (modelName, models) => ({
  type: Constants.FETCHED_MODELS,
  name: modelName,
  models,
});

const fetchingModel = model => ({
  type: Constants.FETCHING_MODEL,
  model,
});

const fetchedModel = model => ({
  type: Constants.FETCHED_MODEL,
  model,
});

const selectModel = model => ({
  type: Constants.SELECT_MODEL,
  model,
});

const deselectModel = model => ({
  type: Constants.DESELECT_MODEL,
  model,
});

const saveModel = model => async function innerSaveModel(dispatch, getState) {
  const { currentUser } = getState().user;
  model.createdBy = currentUser;
  dispatch(savingModel(model));
  await model.save();
  // console.log(file, items);
  dispatch(savedModel(model));
};

const fetchList = Model => async function innerfetchList(dispatch) {
  dispatch(fetchingModels(Model));
  const { models } = await Model.fetch();
  // console.log(models);
  const decryptedModels = models.map((object) => {
    const decrypted = decryptObject(object, Model);
    // console.log(decrypted);
    return new Model(decrypted);
  });
  // console.log(decryptedModels);
  dispatch(fetchedModels(Model.constructor, decryptedModels));
};

const fetchModel = model => async function innerFetchModel(dispatch) {
  dispatch(fetchingModel(model));
  await model.fetch();
  // console.log(model);
  dispatch(fetchedModel(model));
};

export default {
  saveModel,
  fetchList,
  fetchModel,
  selectModel,
  deselectModel,
};
