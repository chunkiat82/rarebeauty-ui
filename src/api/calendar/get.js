const { generateCalendarObj } = require('../utilities/jwt');

export default function get(options) {
  const { calendarId, eventId } = options;
  // console.error(`options`, options);
  return new Promise(async (res, rej) => {
    const calendar = await generateCalendarObj();
    // const timeMin = timeStart || moment().subtract(1, 'hours').toISOString();
    calendar.events.get(
      {
        calendarId,
        eventId,
      },
      async (err, { data: event }) => {
        if (err) {
          rej(err);
        } else {
          res(event);
        }
      },
    );
  });
}
