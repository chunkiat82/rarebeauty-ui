const { generateCalendarObj } = require('../utilities/jwt');

export default function deleteEvent(options) {
  const { calendarId, eventId } = options;
  return new Promise(async (res, rej) => {
    const calendar = await generateCalendarObj();
    // const timeMin = timeStart || moment().subtract(1, 'hours').toISOString();
    calendar.events.delete(
      {
        calendarId,
        eventId,
      },
      async (err, response) => {
        if (err) {
          rej(err);
        } else {
          res(response);
        }
      },
    );
  });
}
