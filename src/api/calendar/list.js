const { generateCalendarObj } = require('../utilities/jwt');
const moment = require('moment');

export default function list(options) {
  // console.log(options);
  const {
    calendarId,
    timeStart,
    startDT,
    endDT,
    orderBy,
    maxResults,
  } = options;

  return new Promise(async (res, rej) => {
    const calendar = await generateCalendarObj();
    const timeMin =
      timeStart ||
      startDT ||
      moment()
        .subtract(3, 'hours')
        .toISOString();
    let finalOptions = {
      calendarId,
      timeMin,
      maxResults: maxResults || 2000,
      singleEvents: true,
      orderBy: orderBy || 'startTime',
      // syncToken: 'CPC4kJ_I5-UCEPC4kJ_I5-UCGAU=',
    };

    if (endDT)
      finalOptions = Object.assign(
        {
          timeMax: endDT,
        },
        finalOptions,
      );

    // console.log(`finalOptions=${JSON.stringify(finalOptions, null, 2)}`);

    calendar.events.list(finalOptions, async (err, output) => {
      if (err) {
        rej(err);
      } else {
        const { data } = output;
        // console.log(`output`, output);
        res(data.items);
      }
    });
  });
}
