/**
 * Simple test script for the URL shortener function.
 * Run with: node test-url-shortener.js
 */

require('../load-env');
const createShortURL = require('../src/api/urlshortener/create');
const logger = require('../src/utils/logger');

// Test URL to shorten - a longer URL with special characters
const timestamp = Date.now();
const testURL = `https://www.soho.sg/booking/confirm?customer=John+Doe&date=${timestamp}&services=Haircut,Color,Treatment&notes=Special+request:+Please+use+organic+products&referral=Google%20Search`;

// Test the shortener function
async function runTest() {
  try {
    logger.info(`Testing URL shortener with URL: ${testURL}`);
    
    const shortURL = await createShortURL({
      longURL: testURL
    });
    
    logger.info('Test successful!');
    logger.info(`Original URL: ${testURL}`);
    logger.info(`Short URL: ${shortURL}`);
    
    return shortURL;
  } catch (error) {
    logger.error('Test failed with error:', error);
    return null;
  }
}

// Run the test
runTest()
  .then(result => {
    if (result) {
      logger.info('✓ URL shortener is working correctly');
      process.exit(0);
    } else {
      logger.error('✗ URL shortener test failed');
      process.exit(1);
    }
  })
  .catch(err => {
    logger.error('Test error:', err);
    process.exit(1);
  }); 