/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable max-len */
// Use environment variables directly instead of trying to load JSON files

if (process.env.BROWSER) {
  throw new Error(
    'Do not import `config.js` from inside the client-side code.',
  );
}

const config = {
  server: {
    port: process.env.PORT || 3004,
    env: process.env.NODE_ENV || 'development',
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key-here',
      expiresIn: '1h',
    },
  },
  database: {
    couchbase: {
      url: process.env.CBURL || process.env.COUCHBASE_URL || 'couchbase://localhost',
      bucket: process.env.CB_BUCKET || process.env.COUCHBASE_BUCKET || 'appointments_dev',
      username: process.env.CB_USERNAME || process.env.COUCHBASE_USERNAME || 'rarebeauty',
      password: process.env.CB_PASSWORD || process.env.COUCHBASE_PASSWORD || 'soho!@#$',
    },
    url: process.env.CBURL || process.env.COUCHBASE_URL || 'couchbase://localhost',
  },
  google: {
    calendar: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    },
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'https://appointments.soho.sg',
      'https://rb.soho.sg',
      'https://rarebeauty.soho.sg',
      'https://rarebeautysg.soho.sg',
    ],
  },
};

module.exports = config;
