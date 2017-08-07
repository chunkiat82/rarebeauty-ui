const google = require('googleapis');
const generateJWT = require('../utilities/jwt');
const { getSyncToken, setSyncToken } = require('../utilities/token');

export default async function getDelta(options) {
  return new Promise(async (res, rej) => {
    const syncToken = await getSyncToken();
    const { calendarId } = options;

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
          rej(err);
        } else {
          res(response.items);
        }
      },
    );
  });
}
