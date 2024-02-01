/* eslint-disable camelcase */
import rp from 'request-promise';

const { shorturl_token } = require('../keys/google.json');

export default async function create(options) {
  const { longURL } = options;
  const data = {
    domain: 'soho.sg',
    originalURL: longURL,
  };
  return rp('https://api.short.io/links/public', {
    method: 'post',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: shorturl_token,
    },
    body: JSON.stringify(data),
  });
}
