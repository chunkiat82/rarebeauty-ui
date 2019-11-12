const { generateCalendarObj } = require('../../utilities/jwt');

module.exports = function create(options) {
  const { calendarId, resourceId } = options;

  return new Promise(async (res, rej) => {
    const calendar = await generateCalendarObj();
    calendar.channels.stop(
      {
        calendarId,
        resource: {
          id: 'anythingintheworld',
          resourceId,
        },
      },
      (err, response) => {
        if (err) {
          rej(err);
        }
        res(response);
      },
    );
  });
};
