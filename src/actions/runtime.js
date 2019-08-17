/* eslint-disable import/prefer-default-export */

import { SET_RUNTIME_VARIABLE } from '../constants';

export function setRuntimeVariable({ name, value }) {
  return {
    type: SET_RUNTIME_VARIABLE,
    payload: {
      name,
      value,
    },
  };
}

// export function showLoader() {
//   return { type: 'SHOW_LOADER' };
// }

// export function hideLoader() {
//   return { type: 'HIDE_LOADER' };
// }
