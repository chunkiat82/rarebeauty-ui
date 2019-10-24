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
  const minutes = inputMoment.minutes();
  const AMP = ['A', 'M', 'P'];
  switch (true) {
    case hour < 12 || (hour === 12 && minutes <= 0):
      return AMP[0];
    case hour >= 17:
      return AMP[2];
    default:
      return AMP[1];
  }
}

function generatEndMoment(inputMoment) {
  if (inputMoment.day() > 0 && inputMoment.day() < 6) {
    return moment(inputMoment)
      .hours(21)
      .minutes(0)
      .seconds(0);
  }
  return moment(inputMoment)
    .hours(19)
    .minutes(0)
    .seconds(0);
}

function generatStartMoment(inputMoment) {
  return moment(inputMoment)
    .hours(10)
    .minutes(30)
    .seconds(0);
}

function storeIntoFreeSLots(freeSlots, start, end) {
  const duration = moment.duration(end.diff(start));
  const durationInMinutes = duration.asMinutes();
  // start = moment("2019-10-19T00:00:00Z");
  // console.log(start.day());
  if (durationInMinutes > 0) {
    freeSlots.push({
      start: start.format('YYYY-MM-DDTHH:mm:ssZ'),
      end: end.format('YYYY-MM-DDTHH:mm:ssZ'),
      durationInMinutes,
      amp: generateAMP(start),
    });
  }
}

function splitfreeSlots(freeSlots) {
  const slots = [];
  freeSlots.forEach(freeSlot => {
    // console.log(freeSlot);
    const start = moment(freeSlot.start);
    const end = moment(freeSlot.end);

    if (start.dayOfYear() < end.dayOfYear()) {
      // caters for start and end within one day
      const differenceInDays = end.dayOfYear() - start.dayOfYear();
      if (differenceInDays === 1) {
        storeIntoFreeSLots(slots, moment(start), generatEndMoment(start));
        storeIntoFreeSLots(slots, generatStartMoment(end), end);
      } else {
        // console.log(`start`, start);
        // console.log(`end`, end);
        storeIntoFreeSLots(slots, moment(start), generatEndMoment(start));
        for (let i = 1; i < differenceInDays; i += 1) {
          const tempStart = moment(start).add(i, 'days');
          storeIntoFreeSLots(
            slots,
            generatStartMoment(tempStart),
            generatEndMoment(tempStart),
          );
        }
        storeIntoFreeSLots(slots, generatStartMoment(end), moment(end));
      }
    } else {
      slots[slots.length] = freeSlot;
    }
  });
  return slots;
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
    const endMoment = moment(freeEnd);

    storeIntoFreeSLots(freeSlots, startMoment, endMoment);
    freeStart = busySlot.end;
  }

  return splitfreeSlots(freeSlots);
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
      .add(90, 'days')
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
          console.err(err);
          rej([]);
        } else {
          const freeSlots = convertBusyToFree(calendarId, response);
          res(freeSlots);
        }
      },
    );
  });
}
