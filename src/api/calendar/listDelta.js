const generateJWT = require('../utilities/jwt');
const google = require('googleapis');
const moment = require('moment');
const couchbase = require('couchbase');
const { getSyncToken, setSyncToken } = require('../utilities/token');

export default function listDelta(options) {
  return new Promise(async (res, rej) => {
    const { calendarId } = options;
    const syncToken = await getSyncToken();
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    calendar.events.list(
      {
        calendarId,
        singleEvents: true,
        syncToken,
      },
      async (err, response) => {
        if (err) {
          // console.log(`The API returned an error: ${err}`);
          rej(err);
        } else {
          console.log(response);

          // save only when there is nextSyncToken otherwise it screws others
          if (response.nextSyncToken) {
            await setSyncToken({
              syncToken: response.nextSyncToken,
              lastUpdated: moment(),
            });
          }
          res(response.items);
        }
      },
    );
  });
}
