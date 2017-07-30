const generateJWT = require('../utilities/jwt');
const google = require('googleapis');
const moment = require('moment');

module.exports = function list(options) {
  const { calendarId, timeStart } = options;
  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    const timeMin = timeStart || moment().subtract(1, 'hours').toISOString();
    calendar.events.list(
      {
        calendarId,
        timeMin,
        // maxResults: 20,
        singleEvents: true,
        orderBy: 'startTime',
      },
      (err, response) => {
        if (err) {
          // console.log(`The API returned an error: ${err}`);
          rej(err);
        } else {
          res(response.items);
        }
      },
    );
  });
};
