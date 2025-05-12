const db = require('./db');
const logger = require('./logger');
const tenantsConfig = require('../api/keys/tenants.json');

async function testConnection(tenantName = 'rarebeauty') {
  try {
    const tenant = tenantsConfig[tenantName];
    if (!tenant) {
      throw new Error(`Tenant ${tenantName} not found in configuration`);
    }

    // Test connection
    await db.connect(tenantName);
    logger.info('✓ Database connection successful');

    // Test write operation
    const testKey = `test:connection:${tenantName}`;
    const testData = {
      timestamp: new Date().toISOString(),
      message: 'Connection test',
      tenant: tenantName
    };
    
    await db.upsert(testKey, testData);
    logger.info('✓ Write operation successful');

    // Test read operation
    const readData = await db.get(testKey);
    if (readData && readData.message === testData.message) {
      logger.info('✓ Read operation successful');
    } else {
      throw new Error('Read data does not match written data');
    }

    // Test query operation
    const queryResult = await db.query(`SELECT COUNT(*) as count FROM \`${tenant.database.bucketName}\`.\`${tenant.database.scopeName}\`.\`${tenant.database.collectionName}\``);
    logger.info('✓ Query operation successful');
    logger.info(`Total documents in collection: ${queryResult[0]?.count || 0}`);

    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    throw error;
  } finally {
    // Don't close the connection as it might be needed by the application
    // await db.close();
  }
}

module.exports = testConnection; 