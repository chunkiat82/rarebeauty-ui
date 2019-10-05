const generateJWT = require('../utilities/jwt');
const google = require('googleapis');
const moment = require('moment');

function convertBusyToFree(calendarId, response) {
  const { calendars } = response;

  const busySlots = calendars[calendarId].busy;
  const freeSlots = [];

  if (busySlots.length === 0) return freeSlots;

  let busySlot = busySlots.shift();

  let freeStart = busySlot.end;

  // console.log(busySlots.length);
  while (busySlots.length > 0) {
    busySlot = busySlots.shift();
    // console.log(busySlots.length);
    const freeEnd = busySlot.start;

    const startMoment = moment(freeStart);
    let endMoment = moment(freeEnd);

    if (endMoment.hours() >= 21 || startMoment.date() !== endMoment.date()) {
      endMoment = moment(startMoment).hours(21).minutes(0).seconds(0);
    }

    const duration = moment.duration(endMoment.diff(startMoment));
    const durationInMinutes = duration.asMinutes();
    // console.log(startMoment.format('YYYY-MM-DDTHH:mm:ssZ') + ' - ' + endMoment.format('YYYY-MM-DDTHH:mm:ssZ') + ' - ' + durationInMinutes);
    if (durationInMinutes > 0) {
      freeSlots.push({
        start: startMoment.format('YYYY-MM-DDTHH:mm:ssZ'),
        end: endMoment.format('YYYY-MM-DDTHH:mm:ssZ'),
        durationInMinutes,
      });
    }
    freeStart = busySlot.end;
  }

  return freeSlots;
}

export default function listFree(options) {
  // console.log(options);
  const { calendarId } = options;

  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({
      version: 'v3',
      auth: jwtClient,
    });
    const timeMin = moment()
      .subtract(1, 'hours')
      .format('YYYY-MM-DDTHH:mm:ssZ');
    const timeMax = moment().add(30, 'days').format('YYYY-MM-DDTHH:mm:ssZ');
    // timeStart || startDT || moment().subtract(3, 'hours').toISOString();
    const finalOptions = {
      timeMin,
      timeMax,
      timeZone: '+08:00',
      calendarExpansionMax: 50,
      items: [
        {
          id: calendarId,
        },
      ],
    };

    // console.log(`finalOptions=${JSON.stringify(finalOptions, null, 2)}`);
    // https://developers.google.com/calendar/v3/reference/freebusy/query
    calendar.freebusy.query(
      {
        headers: { 'content-type': 'application/json' },
        resource: finalOptions,
      },
      async (err, response) => {
        if (err) {
          rej(err);
        } else {
          const freeSlots = convertBusyToFree(calendarId, response);
          res(freeSlots);
        }
      },
    );
  });
}
