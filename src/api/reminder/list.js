const generateJWT = require('../utilities/jwt');
const google = require('googleapis');
const moment = require('moment');

module.exports = function list(options) {
  const { calendarId, tomorrow } = options;
  const start = moment().startOf('day');
  if (tomorrow) {
    start = moment(start).add(1, 'days');
  }
  const end = moment(start).add(24, 'hours').subtract(1, 'seconds');
  // console.log(start.toISOString());
  // console.log(end.toISOString());

  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    calendar.events.list(
      {
        calendarId,
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
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
