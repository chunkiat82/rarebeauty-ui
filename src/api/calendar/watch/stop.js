const { generateCalendarObj } = require('../../utilities/jwt');

module.exports = function stop(options) {
  const { calendarId, resourceId, selfIdentifier } = options;

  return new Promise(async (res, rej) => {
    const calendar = await generateCalendarObj();
    calendar.channels.stop(
      {
        calendarId,
        resource: {
          id: selfIdentifier,
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
