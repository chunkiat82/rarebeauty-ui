const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

module.exports = function create(options) {
  const { calendarId, address, id } = options;

  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    calendar.events.watch(
      {
        calendarId,
        eventId: _8cpj2gpi89234ba46t13cb9k8kr3iba16gsjgb9j64ok4e9m8co4cdhk74,
        resource: {
          id,
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
