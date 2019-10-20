/* eslint-disable no-param-reassign */
/* eslint-disable no-fallthrough */
/* eslint-disable no-return-assign */
export default function copy(state = {}, action) {
  switch (action.type) {
    case 'COPY':
      // console.log(`action.value`, action.value);
      return action.value;
    default:
      return state;
  }
}
