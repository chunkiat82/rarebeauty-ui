import { combineReducers } from 'redux';
import user from './user';
import common from './common';
import runtime from './runtime';
import loading from './loading';
import copy from './copy';

export default combineReducers({
  user,
  runtime,
  loading,
  copy,
  event: common,
  workAddress: common,
  oldWorkAddress: common,
});
