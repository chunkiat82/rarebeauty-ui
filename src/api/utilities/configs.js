import configs from '../keys/google.json';

export function get(key) {
  return configs[key];
}

export default {
  get,
};
