const { generateCalendarObj } = require('../utilities/jwt');

export default function listDelta(options) {
  return new Promise(async (res, rej) => {
    const { calendarId, syncToken } = options;
    const calendar = await generateCalendarObj();
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
