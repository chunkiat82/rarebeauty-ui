/**
 * Simple test script for testing the URL shortener API
 * Run with: node test-shorturl.js
 */

require('./load-env'); // Load environment variables
const fetch = require('node-fetch');
const logger = require('./src/utils/logger');

// URL to shorten
const testURL = 'https://www.soho.sg/test-' + Date.now();
const username = process.env.SL_USERNAME;
const password = process.env.SL_PASSWORD;

async function testDirectURL() {
  try {
    logger.info('Testing direct URL shortener endpoint');
    logger.info(`Username: "${username}", Password: "${password}" (note quotes to see trailing spaces)`);
    
    // Direct call using the URL pattern from the user's query
    const directUrl = `https://go.salon.sg/yourls-api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=shorturl&format=simple&url=${encodeURIComponent(testURL)}`;
    
    logger.info(`Calling URL: ${directUrl.replace(/password=([^&]+)/, 'password=***')}`);
    
    const response = await fetch(directUrl);
    const result = await response.text();
    
    logger.info(`Direct API response: ${result}`);
    return result;
  } catch (error) {
    logger.error('Error with direct URL test:', error);
    return null;
  }
}

// Test with hardcoded credentials exactly as in the example
async function testHardcodedURL() {
  try {
    logger.info('Testing hardcoded URL shortener endpoint');
    
    // Hardcoded credentials as provided in the example
    const hardcodedUrl = `https://go.salon.sg/yourls-api.php?username=admin&password=soho!@%23%24&action=shorturl&format=simple&url=${encodeURIComponent(testURL)}`;
    
    logger.info(`Calling hardcoded URL: ${hardcodedUrl.replace(/password=([^&]+)/, 'password=***')}`);
    
    const response = await fetch(hardcodedUrl);
    const result = await response.text();
    
    logger.info(`Hardcoded URL response: ${result}`);
    return result;
  } catch (error) {
    logger.error('Error with hardcoded URL test:', error);
    return null;
  }
}

// Run both tests
async function runTests() {
  const directResult = await testDirectURL();
  const hardcodedResult = await testHardcodedURL();
  
  if (directResult && !directResult.includes('Invalid') && !directResult.includes('Error')) {
    logger.info('Direct URL test passed!');
  } else {
    logger.error('Direct URL test failed!');
  }
  
  if (hardcodedResult && !hardcodedResult.includes('Invalid') && !hardcodedResult.includes('Error')) {
    logger.info('Hardcoded URL test passed!');
  } else {
    logger.error('Hardcoded URL test failed!');
  }
  
  return { directResult, hardcodedResult };
}

// Run the tests
runTests()
  .then(results => {
    if (results.directResult || results.hardcodedResult) {
      logger.info('At least one test was successful');
    } else {
      logger.error('All tests failed');
      process.exit(1);
    }
  })
  .catch(err => {
    logger.error('Test error:', err);
    process.exit(1);
  }); 