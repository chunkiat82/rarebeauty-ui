const couchbase = require('couchbase');
const path = require('path');
const config = require('../config');
const logger = require('./logger');

// Load tenants configuration
const tenantsConfig = require('../api/keys/tenants.json');

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
      const tenant = tenantsConfig[tenantName];
      
      if (!tenant) {
        throw new Error(`Tenant ${tenantName} not found in configuration`);
      }

      // Connect to Couchbase cluster
      const connectionUrl = process.env.COUCHBASE_URL || config.database.couchbase.url;
      logger.info(`Connecting to Couchbase at ${connectionUrl}`);
      
      this.cluster = await couchbase.connect(connectionUrl, {
        username: tenant.database.username,
        password: tenant.database.password,
        timeouts: {
          kvTimeout: 10000, // 10 seconds
          connectTimeout: 10000,
        },
      });

      // Get bucket reference
      this.bucket = this.cluster.bucket(tenant.database.bucketName);

      // Get scope reference
      this.scope = this.bucket.scope(tenant.database.scopeName);

      // Get collection reference
      this.collection = this.scope.collection(tenant.database.collectionName);

      this.isConnected = true;
      logger.info(`Connected to Couchbase bucket: ${tenant.database.bucketName}, scope: ${tenant.database.scopeName}, collection: ${tenant.database.collectionName}`);
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