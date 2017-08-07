const generateJWT = require('../utilities/jwt');
const google = require('googleapis');
const moment = require('moment');

export default function list(options) {
  const { calendarId, timeStart, orderBy } = options;
  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    const timeMin = timeStart || moment().subtract(1, 'hours').toISOString();
    calendar.events.list(
      {
        calendarId,
        timeMin,
        maxResults: 250,
        singleEvents: true,
        orderBy: orderBy || 'startTime',
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
