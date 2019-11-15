/* eslint-disable camelcase */
import rp from 'request-promise';

const { bitly_token } = require('../keys/google.json');

export default async function create(options) {
  const { longURL } = options;

  const postOptions = {
    method: 'POST',
    headers: {
      // eslint-disable-next-line camelcase
      Authorization: `Bearer ${bitly_token}`,
    },
    uri: `https://api-ssl.bitly.com/v4/bitlinks`,
    body: {
      long_url: longURL,
    },
    json: true, // Automatically stringifies the body to JSON
  };

  return rp(postOptions);
}
