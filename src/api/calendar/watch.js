const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

module.exports = function create(options) {
  const { calendarId, address } = options;

  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    calendar.events.watch(
      {
        calendarId,
        resource: {
          id: 'anythingintheworld',
          token: 'anythingbutme',
          type: 'web_hook',
          address,
          params: {
            ttl: 1314000,
          },
        },
      },
      (err, event) => {
        if (err) {
          rej(err);
        }
        res(event);
      },
    );
  });
};
