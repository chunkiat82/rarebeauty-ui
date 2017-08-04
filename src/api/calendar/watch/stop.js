const generateJWT = require('../../utilities/jwt');
const google = require('googleapis');

module.exports = function create(options) {
  const { calendarId, resourceId, id } = options;

  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    calendar.channels.stop(
      {
        calendarId,
        resource: {
          id,
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
