import { combineReducers } from 'redux';
import user from './user';
import common from './common';
import runtime from './runtime';
import loading from './loading';

export default combineReducers({
  user,
  runtime,
  loading,
  event: common,
  workAddress: common,
});
