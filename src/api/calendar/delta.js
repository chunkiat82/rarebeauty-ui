const { generateCalendarObj } = require('../utilities/jwt');
const { getSyncToken } = require('../utilities/token');

export default async function getDelta(options) {
  return new Promise(async (res, rej) => {
    let { syncToken } = options;
    const { calendarId } = options;

    if (!syncToken) {
      syncToken = await getSyncToken();
    }

    const calendar = await generateCalendarObj();
    calendar.events.list(
      {
        calendarId,
        singleEvents: true,
        syncToken,
        maxResults: 100,
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
