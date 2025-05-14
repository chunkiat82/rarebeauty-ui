const logger = require('./logger');

// Define required environment variables
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
  
  // Google Calendar optional configs
  GOOGLE_PROJECT_ID: { description: 'Google Calendar project ID', critical: false },
  GOOGLE_CLIENT_EMAIL: { description: 'Google Calendar client email', critical: false },
  GOOGLE_CALENDAR_ID: { description: 'Google Calendar ID', critical: false },
  
  // Business information (optional in development)
  WORK_ADDRESS: { description: 'Business address', critical: false },
  WORK_EMAIL: { description: 'Business email', critical: false },
  WORK_MOBILE: { description: 'Business mobile number', critical: false },
  
  // Database configuration
  CBURL: { description: 'Couchbase server URL', critical: false },
  CB_BUCKET: { description: 'Couchbase bucket name', critical: false },
  CB_USERNAME: { description: 'Couchbase username', critical: false },
  CB_PASSWORD: { description: 'Couchbase password', critical: false },
  CB_SCOPE: { description: 'Couchbase scope', critical: false },
  CB_COLLECTION: { description: 'Couchbase collection', critical: false }
};

function checkEnvironment() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const missing = [];
  const usingDefaults = [];

  for (const [key, config] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      if (!config.critical || isDevelopment) {
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

  // In development mode, we'll continue even with missing variables
  return isDevelopment || missing.length === 0;
}

module.exports = checkEnvironment; 