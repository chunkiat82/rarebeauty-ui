/* eslint-disable no-param-reassign */
/* eslint-disable no-fallthrough */
/* eslint-disable no-return-assign */
export default function loading(state = {}, action) {
  switch (action.type) {
    case 'SHOW_LOADER':
      // console.log('SHOW_LOADER');
      return true;
    case 'HIDE_LOADER':
      // console.log('HIDE_LOADER');
      return false;
    default:
      return state;
  }
}
