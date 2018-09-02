import jwt from 'jsonwebtoken';
import moment from 'moment';
import AST from 'auto-sorting-array';
import config from '../config';
import calendarList from './calendar/list';
import calendarGet from './calendar/get';
import calendarDelta from './calendar/delta';
import contactLists from './contacts/list';

import calendarCreate from './calendar/create';
import urlCreate from './urlshortener/create';
import contactGet from './contacts/get';
import contactCreate from './contacts/create';
import contactUpdate from './contacts/update';

import appointmentsByPerson from './appointments/person';

import calendarPatch from './calendar/patch';

const calendarDayBefore = require('./calendar/dayBeforeEvents');

const calendarWatch = require('./calendar/watch');
const calendarWatchStop = require('./calendar/watch/stop');

const { sendMessage: sms } = require('./utilities/sms');
const { getSyncToken, setSyncToken } = require('./utilities/token');
const configs = require('./utilities/configs');
const { get, upsert } = require('../data/database');

const NO_MOBILE_NUMBER = '00000000';
const calendarId = configs.get('work_email');

const confirmationURL = configs.get('confirmationURL');
const reservationURL = configs.get('reservationURL');
const webHookURL = configs.get('webHookURL');
const webHookId = configs.get('webHookId');

async function listEvents(options) {
  const finalOptions = Object.assign(
    {
      calendarId,
    },
    options,
  );
  try {
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
      calendarId,
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
      calendarId,
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

async function informReservationToCustomer(options) {
  const { updated } = options;
  const finalOptions = Object.assign(
    {
      calendarId,
    },
    options,
  );

  try {
    const event = await calendarGet(finalOptions);
    // console.log(event);
    if (
      event.extendedProperties &&
      event.extendedProperties.shared &&
      (event.extendedProperties.shared.informed === 'false' ||
        event.extendedProperties.shared.informed === false)
    ) {
      try {
        let name = 'dear';
        name =
          event.attendees &&
          event.attendees.filter(a => a.displayName)[0].displayName;
        const mobile =
          (event.extendedProperties &&
            event.extendedProperties.shared &&
            event.extendedProperties.shared.mobile) ||
          -1;
        const startDate = moment(event.start.dateTime).format('DD-MMM');
        const startTime = moment(event.start.dateTime).format('hh:mm a');
        const shortURL = await urlCreate({
          longURL: `${reservationURL}${event.id}`,
        });

        const message = `${updated
          ? 'Updated - '
          : ''}Your appt with Rare Beauty on ${startDate} at ${startTime} is reserved.\n\nClick ${shortURL.id} to view address/details`;

        console.error(`message=${message}`);

        if (mobile.indexOf(NO_MOBILE_NUMBER) === -1) {
          await sms(Object.assign({}, options, { mobile, message }));
        } else {
          console.error(`${name} not sent because mobile number is ${mobile}`);
        }

        await calendarPatch({
          eventId: event.id,
          calendarId,
          informed: true,
          shortURL: shortURL.id,
        });
      } catch (err) {
        console.error(`informReservationToCustomer-${err}`);
      }
    }
    return event;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function createEvent(options) {
  // node index --action=calendarCreate --name=Raymond Ho --mobile=12345678 --start=20170730T1130 --duration=105 --services=ELFS,HLW
  try {
    const { event, uuid } = await calendarCreate(
      Object.assign({}, options, {
        calendarId,
      }),
    );
    const finalEvent = await informReservationToCustomer({ eventId: event.id });
    return { event: finalEvent, uuid };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function patchEvent(options) {
  // node index --action=patchEvent --eventId=XXX --mobile=11111111 --services=ELFS,HLW
  // console.log(options);
  try {
    const event = await calendarPatch(
      Object.assign({}, options, {
        calendarId,
      }),
    );

    const finalEvent = await informReservationToCustomer({
      eventId: event.id,
      updated: true,
    });
    // console.log(finalEvent);
    return finalEvent;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function remindCustomers(options) {
  const { tomorrow } = options;
  try {
    const events = await calendarDayBefore(
      Object.assign({}, options, {
        calendarId,
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
            let name = 'dear';
            name =
              event.attendees &&
              event.attendees.filter(a => a.displayName)[0].displayName;
            const mobile =
              (event.extendedProperties &&
                event.extendedProperties.shared &&
                event.extendedProperties.shared.mobile) ||
              -1;
            const startDate = moment(event.start.dateTime).format('DD-MMM');
            const startTime = moment(event.start.dateTime).format('hh:mm a');

            let message = '';
            if (tomorrow) {
              const shortURL = await urlCreate({
                longURL: `${confirmationURL}${event.id}`,
              });
              message = `Click ${shortURL.id} to confirm your appt on ${startDate} ${startTime}.\n\nAny changes, msg to REPLY_MOBILE by 12pm!`;
            } else {
              message = `<Reminder>Appt on ${startDate} ${startTime}.\n\nFor last minute cancellation, msg to REPLY_MOBILE.\n\nOtherwise see you later`;
            }

            // const message = `<Reminder>Appt on ${startDate} at ${startTime}.\n\nAny changes, please reply now to REPLY_MOBILE.`;

            console.error(`message=${message}`);

            if (mobile.indexOf(NO_MOBILE_NUMBER) === -1) {
              await sms(Object.assign({}, options, { mobile, message }));
            } else {
              console.error(
                `${name} not reminded because mobile number is ${mobile}`,
              );
            }

            await calendarPatch({
              eventId: event.id,
              calendarId,
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

async function syncContacts() {
  try {
    const contacts = await contactLists();

    // remember to delete all records first

    contacts.forEach(rec => {
      const contact = rec;
      contact.type = 'contact';
      delete contact.id;
      upsert(`contact:${contact.resourceName}`, contact);
      // console.log(`contact:${contact.resourceName}`);
    });

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

    upsert(`contact:${contact.resourceName}`, contact);
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

async function getContact(options) {
  try {
    const contact = await contactGet(options);
    // console.log(contact);
    return contact;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function watchCalendar(options) {
  const finalOptions = Object.assign({}, options, {
    calendarId,
    address: webHookURL,
    id: webHookId,
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
    calendarId,
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
    /* need to abstract this logic */
    const response = await get(`config:services`);
    const listOfServices = response.value.services;
    // const mapOfServices = convertToMap(listOfServices);
    const services = new AST(listOfServices, 'id');

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
        const inputServices = event.extendedProperties.shared.services.split(
          ',',
        );

        // this is full set services which are eligible for touch up

        const naturalService = inputServices.indexOf('service:20181') > -1;
        const denseService = inputServices.indexOf('service:20182') > -1;
        if (!naturalService && !denseService) {
          return;
        }

        remindedEvents[remindedEvents.length] = event;

        try {
          const lashService = naturalService
            ? 'service:20181'
            : 'service:20182';
          const followUpService = services.peekByKey(lashService).followUp;
          const followUpPrice = services.peekByKey(followUpService).price;
          let name = 'dear';
          name =
            event.attendees &&
            event.attendees.filter(a => a.displayName)[0].displayName;
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
            calendarId,
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

async function getAppointmentsByPerson(options) {
  const appointments = await appointmentsByPerson(options);
  return appointments;
}

const functions = {
  listEvents,
  listDeltaEvents,
  createEvent,
  patchEvent,
  getEvent,
  informReservationToCustomer,
  remindCustomers,
  listContacts,
  createContact,
  updateContact,
  getContact,
  watchCalendar,
  stopWatchCalendar,
  getSyncToken,
  setSyncToken,
  generateJWT,
  listCustomerAppointments,
  remindCustomersTouchUp,
  createShortURL,
  getAppointmentsByPerson,
  syncContacts,
};

export default functions;
