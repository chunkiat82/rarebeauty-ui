import rp from 'request-promise';

const key = require('../keys/google.json');

export default async function create(options) {
  const { longURL } = options;

  const postOptions = {
    method: 'POST',
    uri: `https://www.googleapis.com/urlshortener/v1/url?key=${key.api_key}`,
    body: {
      longUrl: longURL,
    },
    json: true, // Automatically stringifies the body to JSON
  };

  return rp(postOptions);
}
