const generateJWT = require('../utilities/jwt');
const google = require('googleapis');
const uuidv1 = require('uuid/v1');

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
    const uuid = uuidv1();
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
            shared: {
              mobile,
              reminded: false,
              services: services.join(','),
              uuid,
            },
          },
          attendees: [
            {
              displayName: name,
              comment: mobile,
              email: `${mobile.substring(
                mobile.length - 8,
              )}@rarebeauty.soho.sg`,
            },
          ],
          description: `${services.join(
            ',',
          )}\n\https://rarebeauty.soho.sg/calendar/event/${uuid}`,
        },
      },
      (err, event) => {
        if (err) {
          console.log(
            `There was an error contacting the Calendar service: ${err}`,
          );
          rej(err);
        }
        res({ event, uuid });
      },
    );
  });
};
