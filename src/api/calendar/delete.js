const generateJWT = require('../utilities/jwt');
const google = require('googleapis');
// const moment = require('moment');

export default function deleteEvent(options) {
  const { calendarId, eventId } = options;
  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    // const timeMin = timeStart || moment().subtract(1, 'hours').toISOString();
    calendar.events.delete(
      {
        calendarId,
        eventId,
      },
      async (err, response) => {
        if (err) {
          rej(err);
        } else {
          res(response);
        }
      },
    );
  });
}
