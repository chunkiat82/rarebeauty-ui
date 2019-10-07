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
    // console.log(busySlot);
    const freeEnd = busySlot.start;

    let startMoment = moment(freeStart);
    let endMoment = moment(freeEnd);

    if (
      endMoment.hours() >= 21 ||
      startMoment.dayOfYear() > endMoment.dayOfYear()
    ) {
      endMoment = moment(startMoment)
        .hours(21)
        .minutes(0)
        .seconds(0);
    }

    if (startMoment.date() < endMoment.date()) {
      startMoment = moment(endMoment)
        .hours(10)
        .minutes(30)
        .seconds(0);
    }

    // // catering for scenario if first appointment is after 10.30am
    // console.log(`startMoment`, startMoment.format('YYYY-MM-DDTHH:mm:ssZ'));
    // console.log(`endMoment`, endMoment.format('YYYY-MM-DDTHH:mm:ssZ'));
    // console.log('---------');

    const duration = moment.duration(endMoment.diff(startMoment));
    const durationInMinutes = duration.asMinutes();
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
      .add(0, 'days')
      .format('YYYY-MM-DDTHH:mm:ssZ');
    const timeMax = moment()
      .add(30, 'days')
      .format('YYYY-MM-DDTHH:mm:ssZ');
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
