import { combineReducers } from 'redux';
import { loadingBarReducer } from 'react-redux-loading-bar'
import user from './user';
import runtime from './runtime';

export default combineReducers({
  user,
  runtime,
  loadingBar: loadingBarReducer
});
