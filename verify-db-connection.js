/**
 * Simple database connection verification script
 * This script tests the basic database connection without any complex queries
 */

require('./load-env'); // Load environment variables
const db = require('./src/utils/db');
const logger = require('./src/utils/logger');

async function verifyDatabaseConnection() {
  try {
    // Connect to the database
    logger.info('Attempting to connect to the database...');
    await db.connect();
    
    if (db.isConnected) {
      logger.info('✅ Successfully connected to the database');
      logger.info(`Connected to: ${db.bucket.name} (bucket), ${db.scope.name} (scope), ${db.collection.name} (collection)`);
      
      // Close the connection
      logger.info('Closing database connection...');
      await db.close();
      logger.info('✅ Database connection closed');
      
      return true;
    } else {
      logger.error('❌ Failed to connect to the database');
      return false;
    }
  } catch (error) {
    logger.error('❌ Error during database verification:', error);
    return false;
  }
}

// Run the verification
verifyDatabaseConnection()
  .then(success => {
    if (success) {
      logger.info('✅ Database connection verification completed successfully');
      process.exit(0);
    } else {
      logger.error('❌ Database verification failed');
      process.exit(1);
    }
  })
  .catch(error => {
    logger.error('❌ Unhandled error in verification script:', error);
    process.exit(1);
  }); 