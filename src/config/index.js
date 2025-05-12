const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

function loadJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    logger.warn(`Failed to load config file ${filePath}:`, error);
  }
  return null;
}

// Load configuration files
const serverConfig = loadJsonFile(path.join(__dirname, '../api/keys/server.json'));
const googleConfig = loadJsonFile(path.join(__dirname, '../api/keys/google.json'));
const twilioConfig = loadJsonFile(path.join(__dirname, '../api/keys/twilio.json'));
const tenantsConfig = loadJsonFile(path.join(__dirname, '../api/keys/tenants.json'));

const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';

const config = {
  server: {
    port: process.env.PORT || serverConfig?.PORT || 3004,
    env: process.env.NODE_ENV || 'development'
  },

  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || serverConfig?.JWT_SECRET || (isDevelopment ? 'development-secret-key' : undefined),
      expiresIn: '24h'
    }
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || serverConfig?.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').filter(Boolean)
  },

  google: {
    type: process.env.GOOGLE_ACCOUNT_TYPE || googleConfig?.type || 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID || googleConfig?.project_id || 'development',
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || googleConfig?.private_key_id,
    private_key: process.env.GOOGLE_PRIVATE_KEY || googleConfig?.private_key,
    client_email: process.env.GOOGLE_CLIENT_EMAIL || googleConfig?.client_email,
    client_id: process.env.GOOGLE_CLIENT_ID || googleConfig?.client_id,
    auth_uri: process.env.GOOGLE_AUTH_URI || googleConfig?.auth_uri || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env.GOOGLE_TOKEN_URI || googleConfig?.token_uri || 'https://accounts.google.com/o/oauth2/token',
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL || googleConfig?.auth_provider_x509_cert_url || 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL || googleConfig?.client_x509_cert_url,
    api_key: process.env.GOOGLE_API_KEY || googleConfig?.api_key,
    calendar_id: process.env.GOOGLE_CALENDAR_ID || googleConfig?.calendar_id || 'primary',
    waitinglist_calendar_id: process.env.GOOGLE_WAITINGLIST_CALENDAR_ID || googleConfig?.waitinglist_calendar_id,
    webHookURL: process.env.GOOGLE_WEBHOOK_URL || googleConfig?.webHookURL || 'http://localhost:3004/webhooks/google/calendar',
    work: {
      address: process.env.WORK_ADDRESS || serverConfig?.WORK_ADDRESS || googleConfig?.work_address || 'Development Address',
      email: process.env.WORK_EMAIL || serverConfig?.WORK_EMAIL || googleConfig?.work_email || 'dev@example.com',
      mobile: process.env.WORK_MOBILE || serverConfig?.WORK_MOBILE || googleConfig?.mobile || '+1234567890'
    },
    urls: {
      confirmation: process.env.CONFIRMATION_URL || googleConfig?.confirmationURL || 'http://localhost:3000/confirmation',
      reservation: process.env.RESERVATION_URL || googleConfig?.reservationURL || 'http://localhost:3000/reservation',
      customer: process.env.CUSTOMER_URL || googleConfig?.customerURL || 'http://localhost:3000/customer'
    },
    domain: process.env.DOMAIN || googleConfig?.domain || 'localhost',
    calendarName: process.env.CALENDAR_NAME || googleConfig?.calendarName || 'Development Calendar'
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || twilioConfig?.accountSid,
    authToken: process.env.TWILIO_AUTH_TOKEN || twilioConfig?.authToken,
    sender: process.env.TWILIO_SENDER || twilioConfig?.sender || 'DEVELOPMENT',
    adminNumber: process.env.TWILIO_ADMIN_NUMBER || twilioConfig?.admin || '+1234567890'
  },

  database: {
    url: process.env.COUCHBASE_URL || 'couchbase://localhost',
    defaultTenant: 'rarebeauty',
    tenants: process.env.DATABASE_TENANTS ? 
      JSON.parse(process.env.DATABASE_TENANTS) : 
      tenantsConfig || {
        rarebeauty: {
          database: {
            collectionName: 'default',
            bucketName: process.env.COUCHBASE_BUCKET || 'appointments',
            scopeName: 'rarebeauty',
            username: process.env.COUCHBASE_USERNAME || 'rarebeauty',
            password: process.env.COUCHBASE_PASSWORD || 'default-password'
          }
        }
      }
  }
};

// Validate critical configuration
function validateConfig() {
  const missing = [];

  // Check critical configurations only in production
  if (!isDevelopment) {
    if (!config.auth.jwt.secret || config.auth.jwt.secret === 'development-secret-key') {
      missing.push('JWT_SECRET');
    }

    if (!config.google.private_key) {
      missing.push('GOOGLE_PRIVATE_KEY');
    }

    if (!config.twilio.accountSid || !config.twilio.authToken) {
      missing.push('TWILIO_ACCOUNT_SID and/or TWILIO_AUTH_TOKEN');
    }

    if (missing.length > 0) {
      const message = `Missing critical configuration: ${missing.join(', ')}`;
      logger.error(message);
      throw new Error(message);
    }
  }
}

validateConfig();

module.exports = config; 