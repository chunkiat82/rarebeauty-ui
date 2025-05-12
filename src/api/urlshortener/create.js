/* eslint-disable camelcase */
const fetch = require('node-fetch');

// Use environment variables directly instead of loading from JSON
const sl_username = process.env.SL_USERNAME || 'admin';
const sl_password = process.env.SL_PASSWORD || 'soho!@#$';

module.exports = async function create(options) {
  const { longURL } = options;
  const params = new URLSearchParams({
    username: sl_username,
    password: sl_password,
    action: 'shorturl',
    format: 'simple',
    url: longURL,
  });

  const response = await fetch(`https://go.salon.sg/yourls-api.php?${params}`);
  return response.text();
};
