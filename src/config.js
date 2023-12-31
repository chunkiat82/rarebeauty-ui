/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable max-len */
const keys = require('./api/keys/google.json');

if (process.env.BROWSER) {
  throw new Error(
    'Do not import `config.js` from inside the client-side code.',
  );
}

module.exports = {
  // Node.js app
  port: process.env.PORT || 3000,

  // API Gateway
  api: {
    // API URL to be used in the client-side code
    clientUrl: process.env.API_CLIENT_URL || '',
    // API URL to be used in the server-side code
    serverUrl:
      process.env.API_SERVER_URL ||
      `http://localhost:${process.env.PORT || 3000}`,
  },

  // Database
  // databaseUrl: process.env.DATABASE_URL || 'sqlite:database.sqlite',

  // Couchbase
  couchbase: {
    url: process.env.PRODUCTION
      ? process.env.CBURL || `couchbase://172.17.0.1/`
      : `couchbase://127.0.0.1/`,
    queryUrl: process.env.PRODUCTION
      ? process.env.CBQURL || `'http://172.17.0.1:8093/'`
      : `'http://127.0.0.1:8093/'`,
  },

  // Web analytics
  analytics: {
    // https://analytics.google.com/
    googleTrackingId: process.env.GOOGLE_TRACKING_ID, // UA-XXXXX-X
  },

  // Authentication
  auth: {
    jwt: { secret: process.env.JWT_SECRET || 'SOHO Systems And Networks' },

    google: {
      id:
        process.env.GOOGLE_CLIENT_ID ||
        '251410730550-ahcg0ou5mgfhl8hlui1urru7jn5s12km.apps.googleusercontent.com',
      secret: process.env.GOOGLE_CLIENT_SECRET || 'Y8yR9yZAhm9jQ8FKAL8QIEcd',
    },
  },
  clients: keys.clients,
  app: {
    oldWorkAddress: keys.old_work_address,
    workAddress: keys.work_address,
    workDomain: keys.domain,
    workCalendar: keys.calendarName,
    customerURL: keys.customerURL,
  },
};
