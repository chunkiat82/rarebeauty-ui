const couchbase = require('couchbase');
const logger = require('./logger');

class Database {
  constructor() {
    this.isConnected = false;
    this.cluster = null;
    this.bucket = null;
    this.scope = null;
    this.collection = null;
  }

  async connect(tenantName = 'rarebeauty') {
    try {
      // Determine database settings from environment variables
      const dbSettings = {
        collectionName: process.env.CB_COLLECTION || 'default',
        bucketName: process.env.CB_BUCKET || 'appointments_dev',
        scopeName: process.env.CB_SCOPE || tenantName,
        username: process.env.CB_USERNAME || 'rarebeautysg',
        password: process.env.CB_PASSWORD || 'soho!@#$',
        connectionUrl: process.env.CBURL || process.env.COUCHBASE_URL || 'couchbase://localhost'
      };

      // Handle password special characters - only log first part to avoid revealing full password
      const passFirstPart = dbSettings.password.substring(0, 4);
      logger.info(`Using DB settings - bucket: ${dbSettings.bucketName}, scope: ${dbSettings.scopeName}, collection: ${dbSettings.collectionName}, username: ${dbSettings.username}, connectionUrl: ${dbSettings.connectionUrl}`);
      logger.info(`Password first few chars: ${passFirstPart}***`);

      // Connect to Couchbase cluster with properly handled password
      logger.info(`Connecting to Couchbase at ${dbSettings.connectionUrl}`);
      
      this.cluster = await couchbase.connect(dbSettings.connectionUrl, {
        username: dbSettings.username,
        password: dbSettings.password, // The full password with special chars
        timeouts: {
          kvTimeout: 10000, // 10 seconds
          connectTimeout: 10000,
        },
      });

      // Get bucket reference
      this.bucket = this.cluster.bucket(dbSettings.bucketName);

      // Get scope reference
      this.scope = this.bucket.scope(dbSettings.scopeName);

      // Get collection reference
      this.collection = this.scope.collection(dbSettings.collectionName);

      this.isConnected = true;
      logger.info(`Connected to Couchbase bucket: ${dbSettings.bucketName}, scope: ${dbSettings.scopeName}, collection: ${dbSettings.collectionName}`);
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async get(key) {
    try {
      const result = await this.collection.get(key);
      return result.content;
    } catch (error) {
      if (error.code === couchbase.errors.KeyNotFoundError) {
        return null;
      }
      logger.error(`Failed to get document ${key}:`, error);
      throw error;
    }
  }

  async upsert(key, value) {
    try {
      await this.collection.upsert(key, value);
      return true;
    } catch (error) {
      logger.error(`Failed to upsert document ${key}:`, error);
      throw error;
    }
  }

  async query(statement, options = {}) {
    try {
      // Make sure we're connected
      if (!this.isConnected) {
        await this.connect();
      }
      
      // Verify that we have a valid cluster reference
      if (!this.cluster) {
        throw new Error('Database connection not properly established');
      }
      
      const result = await this.cluster.query(statement, {
        parameters: options.parameters,
        scanConsistency: options.scanConsistency || couchbase.QueryScanConsistency.RequestPlus,
      });

      return result.rows;
    } catch (error) {
      logger.error('Query failed:', error);
      throw error;
    }
  }

  async listContacts() {
    try {
      // Make sure we're connected
      if (!this.isConnected) {
        await this.connect();
      }
      
      // Verify that we have valid database references
      if (!this.bucket || !this.scope || !this.collection) {
        throw new Error('Database connection not properly established');
      }
      
      const statement = `
        SELECT c.*
        FROM \`${this.bucket.name}\`.\`${this.scope.name}\`.\`${this.collection.name}\` c
        WHERE c.type = 'contact'
        ORDER BY c.name`;
      
      const result = await this.query(statement);
      return result
        .filter(contact => contact && contact.name && contact.mobile) // Filter out null or incomplete contacts
        .map(contact => ({
          name: contact.name || '',
          mobile: contact.mobile || '',
          display: `${contact.name || ''} - ${contact.mobile || ''}`,
          resourceName: contact.resourceName || ''
        }));
    } catch (error) {
      logger.error('Failed to list contacts:', error);
      throw error;
    }
  }

  async searchContacts(nameQuery) {
    try {
      // Make sure we're connected
      if (!this.isConnected) {
        await this.connect();
      }
      
      // Verify that we have valid database references
      if (!this.bucket || !this.scope || !this.collection) {
        throw new Error('Database connection not properly established');
      }
      
      const statement = `
        SELECT c.*
        FROM \`${this.bucket.name}\`.\`${this.scope.name}\`.\`${this.collection.name}\` c
        WHERE c.type = 'contact'
        AND LOWER(c.name) LIKE LOWER($1)
        ORDER BY c.name
        LIMIT 10`;
      
      const result = await this.query(statement, {
        parameters: [`%${nameQuery}%`]
      });
      
      return result
        .filter(contact => contact && contact.name && contact.mobile) // Filter out null or incomplete contacts
        .map(contact => ({
          name: contact.name || '',
          mobile: contact.mobile || '',
          display: `${contact.name || ''} - ${contact.mobile || ''}`,
          resourceName: contact.resourceName || ''
        }));
    } catch (error) {
      logger.error('Failed to search contacts:', error);
      throw error;
    }
  }

  async close() {
    try {
      if (this.cluster) {
        await this.cluster.close();
        this.cluster = null;
        this.bucket = null;
        this.scope = null;
        this.collection = null;
      }

      this.isConnected = false;
      logger.info('Disconnected from database');
    } catch (error) {
      logger.error('Error closing database connection:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const db = new Database();

module.exports = db; 