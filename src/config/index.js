const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// No need to load JSON files, we'll use environment variables directly
const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';

const config = {
  server: {
    port: process.env.PORT || 3004,
    env: process.env.NODE_ENV || 'development'
  },

  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || (isDevelopment ? 'development-secret-key' : undefined),
      expiresIn: '24h'
    }
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').filter(Boolean)
  },

  google: {
    type: process.env.GOOGLE_ACCOUNT_TYPE || 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID || 'development',
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env.GOOGLE_TOKEN_URI || 'https://accounts.google.com/o/oauth2/token',
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
    api_key: process.env.GOOGLE_API_KEY,
    calendar_id: process.env.GOOGLE_CALENDAR_ID || 'primary',
    waitinglist_calendar_id: process.env.GOOGLE_WAITINGLIST_CALENDAR_ID,
    webHookURL: process.env.GOOGLE_WEBHOOK_URL || 'http://localhost:3004/webhooks/google/calendar',
    work: {
      address: process.env.WORK_ADDRESS || 'Development Address',
      email: process.env.WORK_EMAIL || 'dev@example.com',
      mobile: process.env.WORK_MOBILE || '+1234567890'
    },
    urls: {
      confirmation: process.env.CONFIRMATION_URL || 'http://localhost:3000/confirmation',
      reservation: process.env.RESERVATION_URL || 'http://localhost:3000/reservation',
      customer: process.env.CUSTOMER_URL || 'http://localhost:3000/customer'
    },
    domain: process.env.DOMAIN || 'localhost',
    calendarName: process.env.CALENDAR_NAME || 'Development Calendar'
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    sender: process.env.TWILIO_SENDER || 'DEVELOPMENT',
    adminNumber: process.env.TWILIO_ADMIN_NUMBER || '+1234567890'
  },

  database: {
    url: process.env.CBURL || process.env.COUCHBASE_URL || 'couchbase://localhost',
    defaultTenant: process.env.CB_DEFAULT_TENANT || 'rarebeauty',
    tenants: {
      rarebeauty: {
        database: {
          collectionName: process.env.CB_COLLECTION || 'default',
          bucketName: process.env.CB_BUCKET || 'appointments_dev',
          scopeName: process.env.CB_SCOPE || 'rarebeauty',
          username: process.env.CB_USERNAME || 'rarebeauty',
          password: process.env.CB_PASSWORD || 'default-password'
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