const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Separate critical and optional environment variables
const requiredEnvVars = {
  // Critical in production only
  JWT_SECRET: { description: 'Secret key for JWT authentication', critical: true },
  GOOGLE_PRIVATE_KEY: { description: 'Google Calendar API private key', critical: true },
  TWILIO_ACCOUNT_SID: { description: 'Twilio account SID', critical: true },
  TWILIO_AUTH_TOKEN: { description: 'Twilio auth token', critical: true },

  // Optional with defaults
  PORT: { description: 'Server port (default: 3004)', critical: false },
  NODE_ENV: { description: 'Environment (default: development)', critical: false },
  ALLOWED_ORIGINS: { description: 'Comma-separated list of allowed CORS origins', critical: false },
  
  // Google Calendar optional configs (can be loaded from file)
  GOOGLE_PROJECT_ID: 'Google Calendar project ID',
  GOOGLE_CLIENT_EMAIL: 'Google Calendar client email',
  GOOGLE_CALENDAR_ID: 'Google Calendar ID',
  
  // Business information (optional in development)
  WORK_ADDRESS: { description: 'Business address', critical: false },
  WORK_EMAIL: { description: 'Business email', critical: false },
  WORK_MOBILE: { description: 'Business mobile number', critical: false },
  
  // Database configuration (can be loaded from file)
  COUCHBASE_URL: { description: 'Couchbase server URL', critical: false },
  COUCHBASE_BUCKET: { description: 'Couchbase bucket name', critical: false },
  COUCHBASE_USERNAME: { description: 'Couchbase username', critical: false },
  COUCHBASE_PASSWORD: { description: 'Couchbase password', critical: false }
};

function checkEnvironment() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const missing = [];
  const usingDefaults = [];
  const usingFiles = [];

  // Check if config files exist
  const serverConfigExists = fs.existsSync(path.join(__dirname, '../api/keys/server.json'));
  const googleConfigExists = fs.existsSync(path.join(__dirname, '../api/keys/google.json'));
  const twilioConfigExists = fs.existsSync(path.join(__dirname, '../api/keys/twilio.json'));
  const tenantsConfigExists = fs.existsSync(path.join(__dirname, '../api/keys/tenants.json'));

  // Load server config if it exists
  let serverConfig = null;
  if (serverConfigExists) {
    try {
      serverConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../api/keys/server.json'), 'utf8'));
    } catch (error) {
      logger.warn('Failed to parse server.json:', error);
    }
  }

  for (const [key, config] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      // Check if the missing var can be found in config files
      if (serverConfig && serverConfig[key]) {
        usingFiles.push(`${key} (using server.json)`);
      } else if (key.startsWith('GOOGLE_') && googleConfigExists) {
        usingFiles.push(`${key} (using google.json)`);
      } else if (key.startsWith('TWILIO_') && twilioConfigExists) {
        usingFiles.push(`${key} (using twilio.json)`);
      } else if (key.startsWith('COUCHBASE_') && tenantsConfigExists) {
        usingFiles.push(`${key} (using tenants.json)`);
      } else if (!config.critical || isDevelopment) {
        usingDefaults.push(`${key} (${config.description})`);
      } else {
        missing.push(`${key} (${config.description})`);
      }
    }
  }

  // Log missing critical variables
  if (missing.length > 0 && !isDevelopment) {
    logger.error('\n⚠️  Missing required environment variables:');
    missing.forEach(item => logger.error(`   - ${item}`));
  }

  // Log variables using defaults
  if (usingDefaults.length > 0) {
    logger.info('\n⚠️  Using default values for:');
    usingDefaults.forEach(item => logger.info(`   - ${item}`));
    if (!isDevelopment) {
      logger.warn('   Please set these in production!');
    }
  }

  // Log variables from config files
  if (usingFiles.length > 0) {
    logger.info('\nℹ️  Using configuration files for:');
    usingFiles.forEach(item => logger.info(`   - ${item}`));
    if (!isDevelopment) {
      logger.warn('   Consider moving these to environment variables in production!');
    }
  }

  // In development mode, we'll continue even with missing variables
  return isDevelopment || missing.length === 0;
}

module.exports = checkEnvironment; 