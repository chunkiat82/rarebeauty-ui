const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

module.exports = function patch(options) {
  const { calendarId, eventId, mobile, services } = options;

  if (!calendarId || !eventId) {
    return new Promise((res, rej) => {
      rej('no event patched');
    });
  }

  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    const patchObject = Object.assign(
      {},
      {
        calendarId,
        eventId,
        resource: {},
      },
    );
    if (mobile) {
      patchObject.resource.extendedProperties = {
        shared: { mobile },
      };
    }
    if (services) {
      patchObject.resource.description = services;
    }

    calendar.events.patch(patchObject, (err, event) => {
      if (err) {
        // console.log(
        //   `There was an error contacting the Calendar service: ${err}`,
        // );
        rej(err);
      }
      res(event);
    });
  });
};
