const { graphql } = require('graphql');
const schema = require('../data/schema');
const logger = require('../utils/logger');
const db = require('../utils/db');

async function testGraphQLContacts() {
  try {
    // First ensure the database is connected
    if (!db.isConnected) {
      await db.connect();
      logger.info('Connected to database');
    }
    
    // Create a mock context that includes tenant information
    const context = {
      tenant: 'rarebeauty',
      // Add any other required context properties here
    };

    // Execute the GraphQL query
    const queryResult = await graphql({
      schema,
      source: `
        {
          contacts {
            name
            mobile
            display
            resourceName
          }
        }
      `,
      contextValue: context
    });

    // Check for errors
    if (queryResult.errors) {
      logger.error('GraphQL query errors:', queryResult.errors);
      throw new Error('GraphQL query failed');
    }

    // Display results
    const contacts = queryResult.data.contacts || [];
    logger.info(`GraphQL retrieved ${contacts.length} contacts`);
    
    if (contacts.length > 0) {
      logger.info('Sample contact:', contacts[0]);
    } else {
      logger.info('No contacts found via GraphQL query');
    }

    // Close connection
    await db.close();
    logger.info('Database connection closed');

    return true;
  } catch (error) {
    logger.error('Test failed:', error);
    
    // Attempt to close the connection even if there was an error
    try {
      if (db.isConnected) {
        await db.close();
        logger.info('Database connection closed');
      }
    } catch (closeError) {
      logger.error('Error closing database connection:', closeError);
    }
    
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  testGraphQLContacts()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

module.exports = testGraphQLContacts; 