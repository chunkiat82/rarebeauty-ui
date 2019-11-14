import rp from 'request-promise';

const { bitly_token } = require('../keys/google.json');

export default async function create(options) {
  const { longURL } = options;

  console.log('was here1');

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

  try {
    console.log('was here2');
    const output = await rp(postOptions);
    console.log('was here3');
    return new Promise((res, rej) => {
      res(output);
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}
