const generateJWT = require('../utilities/jwt');
const google = require('googleapis');
const moment = require('moment');

module.exports = function list(options) {
  const { calendarId } = options;
  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    calendar.events.list(
      {
        calendarId,
        timeMin: moment().subtract(1, 'hours').toISOString(),
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
