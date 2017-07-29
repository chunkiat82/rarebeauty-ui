const generateJWT = require('../utilities/jwt');
const google = require('googleapis');
const moment = require('moment');

module.exports = function list(options) {
  const { calendarId } = options;
  const tomorrow = moment().startOf('day').add(1, 'days');
  const endTomorrow = moment(tomorrow).add(24, 'hours').subtract(1, 'seconds');
  // console.log(tomorrow.toISOString());
  // console.log(endTomorrow.toISOString());

  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    calendar.events.list(
      {
        calendarId,
        timeMin: tomorrow.toISOString(),
        timeMax: endTomorrow.toISOString(),
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
