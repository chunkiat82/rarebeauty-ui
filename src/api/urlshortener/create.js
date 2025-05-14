/* eslint-disable camelcase */
const fetch = require('node-fetch');
const logger = require('../../utils/logger');

// Get credentials directly from environment variables
function getCredentials() {
  const username = process.env.SL_USERNAME;
  const password = process.env.SL_PASSWORD;
  
  // Validate that credentials exist
  if (!username || !password) {
    throw new Error('URL shortener credentials missing. SL_USERNAME and SL_PASSWORD must be provided in environment variables.');
  }
  
  return { username, password };
}

module.exports = async function create(options) {
  const { longURL } = options;
  const { username, password } = getCredentials();
  
  // Create the URL with proper encoding
  const apiUrl = 'https://go.salon.sg/yourls-api.php';
  const queryString = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=shorturl&format=simple&url=${encodeURIComponent(longURL)}`;
  const url = `${apiUrl}?${queryString}`;

  logger.info(`Creating short URL for: ${longURL}`);
  
  try {
    const response = await fetch(url);
    const result = await response.text();
    
    if (result.includes('Error') || result.includes('Invalid')) {
      logger.error(`URL shortener API error: ${result}`);
      throw new Error(`URL shortener error: ${result}`);
    }
    
    logger.info(`Short URL created: ${result}`);
    return result;
  } catch (error) {
    logger.error('URL shortening failed:', error);
    throw error;
  }
};
