import * as Constants from './constants';
import GroupMembership from '../models/group-membership';
import UserGroup from '../models/user-group';

const savingModel = model => ({
  type: Constants.SAVING_MODEL,
  model,
});

const savedModel = model => ({
  type: Constants.SAVED_MODEL,
  model,
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

const fetchingUserGroups = () => ({
  type: Constants.FETCHING_USER_GROUPS,
});

const fetchedUserGroups = userGroups => ({
  type: Constants.FETCHED_USER_GROUPS,
  userGroups,
});

const fetchingUserGroup = () => ({
  type: Constants.FETCHING_USER_GROUP,
});

const fetchedUserGroup = userGroup => ({
  type: Constants.FETCHED_USER_GROUP,
  userGroup,
});

const saveModel = model => async function innerSaveModel(dispatch) {
  dispatch(savingModel(model));
  await model.save();
  // console.log(file, items);
  dispatch(savedModel(model));
};

const fetchModel = model => async function innerFetchModel(dispatch) {
  dispatch(fetchingModel(model));
  await model.fetch();
  // console.log(model);
  dispatch(fetchedModel(model));
};

const fetchUserGroups = () => async function innerFetchUserGroups(dispatch) {
  dispatch(fetchingUserGroups());
  const byId = await GroupMembership.fetchUserGroups();
  dispatch(fetchedUserGroups(byId));
};

const fetchUserGroup = id => async function innerFetchUserGroup(dispatch) {
  dispatch(fetchingUserGroup());
  const userGroup = await UserGroup.find(id);
  dispatch(fetchedUserGroup(userGroup));
};

export default {
  saveModel,
  fetchModel,
  selectModel,
  deselectModel,
  fetchUserGroups,
  fetchUserGroup,
};
