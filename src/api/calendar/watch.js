const { generateCalendarObj } = require('../utilities/jwt');

module.exports = function create(options) {
  const { calendarId, address } = options;

  return new Promise(async (res, rej) => {
    const calendar = await generateCalendarObj();
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
