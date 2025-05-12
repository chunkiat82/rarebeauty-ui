const db = require('../utils/db');
const logger = require('../utils/logger');

async function testListContacts() {
  try {
    // Connect to database with default tenant
    await db.connect();
    logger.info('Connected to database');
    
    // Try listing contacts
    const contacts = await db.listContacts();
    
    // Log results
    logger.info(`Retrieved ${contacts.length} contacts`);
    if (contacts.length > 0) {
      logger.info('Sample contact:', contacts[0]);
    } else {
      logger.info('No contacts found in the database');
      
      // Insert a test contact to verify writing works
      const testContactKey = 'contact:test';
      const testContact = {
        type: 'contact',
        name: 'Test Contact',
        mobile: '12345678',
        resourceName: 'test123',
        createdAt: new Date().toISOString()
      };
      
      await db.upsert(testContactKey, testContact);
      logger.info('Inserted test contact');
      
      // Try listing contacts again
      const updatedContacts = await db.listContacts();
      logger.info(`After insertion: Retrieved ${updatedContacts.length} contacts`);
    }
    
    // Close connection
    await db.close();
    logger.info('Test completed successfully');
    
    return true;
  } catch (error) {
    logger.error('Test failed:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  testListContacts()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

module.exports = testListContacts; 