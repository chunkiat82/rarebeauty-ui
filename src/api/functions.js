import jwt from 'jsonwebtoken';
import moment from 'moment';
import config from '../config';
import calendarList from './calendar/list';
import calendarGet from './calendar/get';
import calendarDelta from './calendar/delta';
import contactLists from './contacts/list';
import { mapOfServices } from '../data/database/services';

import calendarCreate from './calendar/create';
import urlCreate from './urlshortener/create';

const calendarPatch = require('./calendar/patch');
const calendarDayBefore = require('./calendar/dayBeforeEvents');

const contactCreate = require('./contacts/create');
const contactUpdate = require('./contacts/update');
const calendarWatch = require('./calendar/watch');
const calendarWatchStop = require('./calendar/watch/stop');

const { sendMessage: sms } = require('./utilities/sms');
const { getSyncToken, setSyncToken } = require('./utilities/token');
const { get, upsert } = require('../data/database');

const NO_MOBILE_NUMBER = '00000000';
async function listEvents(options) {
  const finalOptions = Object.assign(
    {
      calendarId: 'rarebeauty@soho.sg',
    },
    options,
  );
  try {
    // console.log(`finalOptions=${JSON.stringify(finalOptions)}`);
    const events = await calendarList(finalOptions);
    return events;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getEvent(options) {
  const finalOptions = Object.assign(
    {
      calendarId: 'rarebeauty@soho.sg',
    },
    options,
  );
  try {
    const event = await calendarGet(finalOptions);
    return event;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function listDeltaEvents(options) {
  const finalOptions = Object.assign(
    {
      calendarId: 'rarebeauty@soho.sg',
    },
    options,
  );
  try {
    const response = await calendarDelta(finalOptions);
    return response;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function createEvent(options) {
  // node index --action=calendarCreate --name=Raymond Ho --mobile=12345678 --start=20170730T1130 --duration=105 --services=ELFS,HLW
  try {
    const event = await calendarCreate(
      Object.assign({}, options, {
        calendarId: 'rarebeauty@soho.sg',
      }),
    );
    // console.log(event);
    return event;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function patchEvent(options) {
  // node index --action=patchEvent --eventId=XXX --mobile=11111111 --services=ELFS,HLW
  try {
    const event = await calendarPatch(
      Object.assign({}, options, {
        calendarId: 'rarebeauty@soho.sg',
      }),
    );
    // console.log(event);
    return event;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function remindCustomers(options) {
  try {
    const events = await calendarDayBefore(
      Object.assign({}, options, {
        calendarId: 'rarebeauty@soho.sg',
      }),
    );
    const remindedEvents = [];
    if (events.length === 0) {
      // console.log('No reminder events found.');
    } else {
      // console.log(`Upcoming events for ${events.length}`);

      events.forEach(async event => {
        // console.log(event);
        if (
          event.extendedProperties &&
          event.extendedProperties.shared &&
          (event.extendedProperties.shared.reminded === 'false' ||
            event.extendedProperties.shared.reminded === false)
        ) {
          remindedEvents[remindedEvents.length] = event;
          try {
            const name = event.summary;
            const mobile =
              (event.extendedProperties &&
                event.extendedProperties.shared &&
                event.extendedProperties.shared.mobile) ||
              -1;
            const startDate = moment(event.start.dateTime).format('DD-MMM');
            const startTime = moment(event.start.dateTime).format('hh:mm a');
            const shortURL = await urlCreate({
              longURL: `https://rarebeauty.soho.sg/public/appointment/confirm/${event.id}`,
            });
            const message = `<Reminder>Appt on ${startDate} at ${startTime}.\n\nAny changes, please reply now to REPLY_MOBILE\n\nOtherwise click ${shortURL.id} to confirm your appt`;

            // const message = `<Reminder>Appt on ${startDate} at ${startTime}.\n\nAny changes, please reply now to REPLY_MOBILE.`;

            console.error(`message=${message}`);

            if (mobile.indexOf(NO_MOBILE_NUMBER) === -1) {
              await sms(Object.assign({}, options, { mobile, message }));
              console.error(
                `${name} not reminded because mobile number is ${mobile}`,
              );
            }

            await calendarPatch({
              eventId: event.id,
              calendarId: 'rarebeauty@soho.sg',
              reminded: true,
            });
          } catch (err) {
            console.error(err);
          }
        }
      });
    }
    return remindedEvents;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function listContacts() {
  try {
    const contacts = await contactLists();
    return contacts;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function createContact(options) {
  try {
    const contact = await contactCreate(options);
    // console.log(contact);
    return contact;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function updateContact(options) {
  try {
    const contact = await contactUpdate(options);
    // console.log(contact);
    return contact;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function watchCalendar(options) {
  const finalOptions = Object.assign({}, options, {
    calendarId: 'rarebeauty@soho.sg',
    address: 'https://rarebeauty.soho.sg/events/calendar',
    id: 'anythingintheworld',
  });
  try {
    const response = await calendarWatch(finalOptions);
    // console.log(response);
    await upsert('config:watch', {
      resourceId: response.resourceId,
    });
    return response;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function stopWatchCalendar(options) {
  const response = await get('config:watch');
  // console.log(response);
  const finalOptions = Object.assign({}, options, {
    calendarId: 'rarebeauty@soho.sg',
    resourceId: response.value.resourceId,
  });
  try {
    const watchStopResponse = await calendarWatchStop(finalOptions);
    // console.log('stopped');
    return watchStopResponse;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function generateJWT(options) {
  return jwt.sign(
    {
      data: {
        username: options.username || 'baduser',
      },
    },
    config.auth.jwt.secret,
    {
      expiresIn: '365d',
    },
  );
}

async function listCustomerAppointments(options) {
  return listEvents(
    Object.assign(
      {
        maxResults: 3,
      },
      options,
    ),
  );
}

async function remindCustomersTouchUp(options) {
  const { startDT, daysBefore } = options;

  const daysBeforeFinal = daysBefore || 3; // default 3 days before end of touch up
  const daysBeforeTouchUpFinal = 14 - daysBeforeFinal; // 2 weeks for touchup period

  // 5 days before the last day for touch up
  const lastDayForTwoWeeksReminderStartOfDayDT = moment(startDT)
    .add(daysBeforeFinal, 'days')
    .startOf('day');

  const forTwoWeeksReminderStartOfDayDT = moment(startDT)
    .subtract(daysBeforeTouchUpFinal, 'days')
    .startOf('day');

  const forTwoWeeksReminderEndOfDayDT = moment(
    forTwoWeeksReminderStartOfDayDT,
  ).endOf('day');

  const events = await listEvents(
    Object.assign(options, {
      startDT: forTwoWeeksReminderStartOfDayDT.toISOString(),
      endDT: forTwoWeeksReminderEndOfDayDT.toISOString(),
    }),
  );

  const remindedEvents = [];

  if (events.length === 0) {
    // console.log('No reminder events found.');
  } else {
    // console.log(`Upcoming events for tomorrow ${events.length}`);
    events.forEach(async event => {
      // console.log(event);
      // console.log(`services=${JSON.stringify(event.extendedProperties.shared.services, null, 2)}`);

      if (
        event.extendedProperties &&
        event.extendedProperties.shared &&
        (event.extendedProperties.shared.touchUpReminded === 'false' ||
          event.extendedProperties.shared.touchUpReminded === false ||
          event.extendedProperties.shared.touchUpReminded === undefined)
      ) {
        const services = event.extendedProperties.shared.services.split(',');

        // this is full set services which are eligible for touch up

        const naturalService = services.indexOf('service:1') > -1;
        const denseService = services.indexOf('service:2') > -1;
        if (!naturalService && !denseService) {
          return;
        }

        remindedEvents[remindedEvents.length] = event;

        try {
          const lashService = naturalService ? 'service:1' : 'service:2';
          const followUpService = mapOfServices[lashService].followUp;
          const followUpPrice = mapOfServices[followUpService].price;
          const name = event.summary;
          const mobile =
            (event.extendedProperties &&
              event.extendedProperties.shared &&
              event.extendedProperties.shared.mobile) ||
            -1;
          const message = `Hi ${name},\n\nGentle Reminder.\n\nIf you need lashes touch up ($${followUpPrice}), your last eligible day is ${lastDayForTwoWeeksReminderStartOfDayDT.format(
            'DD-MMM',
          )}\n\nReply to REPLY_MOBILE to reserve your slot early.`;

          console.error(`message=${message}`);

          await sms(Object.assign({}, options, { mobile, message }));

          await calendarPatch({
            eventId: event.id,
            calendarId: 'rarebeauty@soho.sg',
            touchUpReminded: true,
          });
        } catch (err) {
          console.error(err);
        }
      }
    });
  }

  return remindedEvents;
}

async function createShortURL(options) {
  const shortURL = await urlCreate(options);
  return [shortURL];
}

const functions = {
  listEvents,
  listDeltaEvents,
  createEvent,
  patchEvent,
  remindCustomers,
  listContacts,
  createContact,
  updateContact,
  watchCalendar,
  stopWatchCalendar,
  getSyncToken,
  setSyncToken,
  getEvent,
  generateJWT,
  listCustomerAppointments,
  remindCustomersTouchUp,
  createShortURL,
};

export default functions;
