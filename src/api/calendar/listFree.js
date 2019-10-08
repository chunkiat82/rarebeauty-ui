const google = require('googleapis');
const moment = require('moment');

const generateJWT = require('../utilities/jwt');

// function to get AM (A), EarlyPM (E) or PM (P)
/*
 * For A Before 12pm
 * For E 12pm to 5pm
 * For P After 5pm
 */
function generateAMP(inputMoment) {
  const hour = inputMoment.hour();
  const AMP = ['A', 'M', 'P'];
  switch (true) {
    case hour <= 12:
      return AMP[0];
    case hour >= 17:
      return AMP[2];
    default:
      return AMP[1];
  }
}

function storeIntoFreeSLots(freeSlots, start, end) {
  const duration = moment.duration(end.diff(start));
  const durationInMinutes = duration.asMinutes();
  if (durationInMinutes > 0) {
    freeSlots.push({
      start: start.format('YYYY-MM-DDTHH:mm:ssZ'),
      end: end.format('YYYY-MM-DDTHH:mm:ssZ'),
      durationInMinutes,
      amp: generateAMP(start),
    });
  }
}

function convertBusyToFree(calendarId, response) {
  const { calendars } = response;

  const busySlots = calendars[calendarId].busy;
  const freeSlots = [];

  if (busySlots.length === 0) return freeSlots;

  let busySlot = busySlots.shift();

  let freeStart = busySlot.end;

  while (busySlots.length > 0) {
    busySlot = busySlots.shift();

    const freeEnd = busySlot.start;

    const startMoment = moment(freeStart);
    let endMoment = moment(freeEnd);

    if (endMoment.hours() >= 21) {
      endMoment = moment(startMoment)
        .hours(21)
        .minutes(0)
        .seconds(0);
    }

    // catering for scenario if first appointment is after 10.30am
    // condition programming - sequence matters a lot here
    if (startMoment.dayOfYear() < endMoment.dayOfYear()) {
      const tempStartMoment = moment(endMoment)
        .hours(10)
        .minutes(30)
        .seconds(0);
      const tempEndMoment = moment(endMoment);
      endMoment = moment(startMoment)
        .hours(21)
        .minutes(0)
        .seconds(0);

      storeIntoFreeSLots(freeSlots, startMoment, endMoment);
      storeIntoFreeSLots(freeSlots, tempStartMoment, tempEndMoment);
    } else {
      storeIntoFreeSLots(freeSlots, startMoment, endMoment);
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
        headers: {
          'content-type': 'application/json',
        },
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
