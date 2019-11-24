const { generateCalendarObj } = require('../utilities/jwt');

export default async function getDelta(options) {
  return new Promise(async (res, rej) => {
    const { syncToken, nextPageToken, nextSyncToken } = options;
    const { calendarId } = options;

    if (nextPageToken) {
      const calendar = await generateCalendarObj();
      calendar.events.list(
        {
          calendarId,
          singleEvents: false,
          pageToken: nextPageToken,
          maxResults: 100,
        },
        async (err, { data: response }) => {
          if (err) {
            rej(err);
          } else {
            res(response);
          }
        },
      );
    } else {
      const calendar = await generateCalendarObj();
      calendar.events.list(
        {
          calendarId,
          singleEvents: true,
          syncToken: nextSyncToken || syncToken,
          maxResults: 100,
        },
        async (err, { data: response }) => {
          if (err) {
            rej(err);
          } else {
            res(response);
          }
        },
      );
    }
  });
}
