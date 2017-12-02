import { combineReducers } from 'redux';
import { loadingBarReducer } from 'react-redux-loading-bar';
import user from './user';
import common from './common';
import runtime from './runtime';

export default combineReducers({
  user,
  runtime,
  loadingBar: loadingBarReducer,
  event: common,
  workAddress: common,
});
