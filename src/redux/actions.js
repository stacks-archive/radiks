import { loadUserData } from 'blockstack/lib/auth/authApp';
import { GroupMembership, UserGroup } from '..';
import * as Constants from './constants';

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
  const { username } = loadUserData();
  const memberships = await GroupMembership.fetchList({
    username,
  });
  const fetchAll = memberships.map(membership => membership.fetchUserGroup());
  const userGroups = await Promise.all(fetchAll);
  const byId = {};
  userGroups.forEach((userGroup) => {
    byId[userGroup.id] = userGroup;
  });
  dispatch(fetchedUserGroups(byId));
};

export default {
  saveModel,
  fetchModel,
  selectModel,
  deselectModel,
  fetchUserGroups,
};
