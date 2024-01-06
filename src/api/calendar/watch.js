const { generateCalendarObj } = require('../utilities/jwt');
const Hashids = require('hashids/cjs');

module.exports = function create(options) {
  const { calendarId, address, selfIdentifier } = options;

  return new Promise(async (res, rej) => {
    const calendar = await generateCalendarObj();
    const hashids = new Hashids(process.env.JWT_SECRET);
    calendar.events.watch(
      {
        calendarId,
        resource: {
          id: selfIdentifier,
          token: hashids.encode(8200),
          type: 'web_hook',
          address,
          params: {
            ttl: 1314000,
          },
        },
      },
      (err, { data: event }) => {
        if (err) {
          rej(err);
        }
        res(event);
      },
    );
  });
};
