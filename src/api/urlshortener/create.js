/* eslint-disable camelcase */
import rp from 'request-promise';

const { sl_username, sl_password } = require('../keys/google.json');

export default async function create(options) {
  const { longURL } = options;
  const data = {
    username: sl_username,
    password: sl_password,
    action: 'shorturl',
    format: 'simple',
    url: longURL,
  };
  return rp('https://go.salon.sg/yourls-api.php', {
    method: 'GET',
    qs: data,
  });
}
