const generateJWT = require('../utilities/jwt');
const google = require('googleapis');
const couchbase = require('couchbase');

export default function listDelta(options) {
  return new Promise(async (res, rej) => {
    const { calendarId, syncToken } = options;
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
          // console.log(response);
          res(response);
        }
      },
    );
  });
}
