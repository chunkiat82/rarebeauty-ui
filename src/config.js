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
  // Backend Service
  port: process.env.PORT || 3000,
  // API Gateway
  apiUrl: `http://${process.env.API_CLIENT_URL}`,
  // Authentication
  auth: {
    jwt: { secret: process.env.JWT_SECRET || 'SOHO Appointment Kit' },
  },
  app: {
    oldWorkAddress: keys.old_work_address,
    workAddress: keys.work_address,
    workDomain: keys.domain,
    safeEntryLink: keys.safe_entry,
    oldSafeEntryLink: keys.old_safe_entry,
    workCalendar: keys.calendarName,
    customerURL: keys.customerURL,
  },
};
