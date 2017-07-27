const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

module.exports = function patch(options) {
  const { calendarId, eventId, mobile, services, reminded } = options;

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

    if (reminded) {
      if (
        patchObject.resource.extendedProperties &&
        patchObject.resource.extendedProperties.shared
      ) {
        patchObject.resource.extendedProperties.shared.reminded =
          reminded === 'true';
      } else {
        patchObject.resource.extendedProperties = {
          shared: { reminded },
        };
      }
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
