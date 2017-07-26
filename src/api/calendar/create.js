const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

module.exports = function create(options) {
  const {
    name,
    mobile,
    startDT,
    endDT,
    duration,
    services,
    calendarId,
  } = options;

  if (!name || !mobile || !startDT || !endDT || !duration || !services) {
    return new Promise((res, rej) => {
      rej('no event created');
    });
  }

  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    calendar.events.insert(
      {
        calendarId,
        resource: {
          start: { dateTime: startDT },
          end: { dateTime: endDT },
          summary: name,
          location: 'Home',
          status: 'confirmed',
          extendedProperties: {
            shared: { mobile },
          },
          description: services,
        },
      },
      (err, event) => {
        if (err) {
          // console.log(
          //   `There was an error contacting the Calendar service: ${err}`,
          // );
          rej(err);
        }
        res(event);
      },
    );
  });
};
