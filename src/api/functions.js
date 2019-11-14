/* eslint-disable no-param-reassign */
import jwt from 'jsonwebtoken';
import moment from 'moment';
import AST from 'auto-sorting-array';
import config from '../config';
import calendarList from './calendar/list';
import calendarGet from './calendar/get';
import calendarDelete from './calendar/delete';
import calendarDelta from './calendar/delta';
import contactLists from './contacts/list';
import calendarListFree from './calendar/listFree';

import calendarCreate from './calendar/create';
import waitingCalendarCreate from './calendar/createWaiting';
import urlCreate from './urlshortener/create';
import contactGet from './contacts/get';
import contactCreate from './contacts/create';
import contactUpdate from './contacts/update';
import contactDelete from './contacts/delete';

import {
  byPerson as appointmentsByPerson,
  cancelledByPerson as countCancelledAppointmentsByPerson,
} from './appointments/person';

import { listTransactions as listTransactionsDB } from './transactions/list';

import calendarPatch from './calendar/patch';

const calendarDayBefore = require('./calendar/dayBeforeEvents');

const calendarWatch = require('./calendar/watch');
const calendarWatchStop = require('./calendar/watch/stop');

const { sendMessage: sms } = require('./utilities/sms');
const { getSyncToken, setSyncToken } = require('./utilities/token');
const configs = require('./utilities/configs');
const { get, upsert } = require('../data/database');

const NO_MOBILE_NUMBER = '00000000';
const calendarId = configs.get('calendar_id');
const waitingListCalendarId = configs.get('waitinglist_calendar_id');

const confirmationURL = configs.get('confirmationURL');
const reservationURL = configs.get('reservationURL');
const webHookURL = configs.get('webHookURL');
const webHookId = configs.get('webHookId');

const TOUCHUP_SERVICES = ['service:3', 'service:4', 'service:20192'];
const FULL_SERVICES = ['service:20181', 'service:20182', 'service:20191'];

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

async function cancelEvent(options) {
  const finalOptions = Object.assign(
    {
      calendarId,
    },
    options,
  );
  try {
    const event = await calendarDelete(finalOptions);
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
  let { event } = options;
  let shortURL = null;

  const finalOptions = Object.assign(
    {
      calendarId,
    },
    options,
  );

  try {
    // if event not in cache
    if (!event) event = await calendarGet(finalOptions);
    // console.log(event);

    // creating shortURL
    try {
      shortURL = await urlCreate({
        longURL: `${reservationURL}${event.id}`,
      });
    } catch (urlError) {
      console.error('unable to create URL - trying again', urlError);
      shortURL = await urlCreate({
        longURL: `${reservationURL}${event.id}`,
      });
    }

    // to message if needed to be informed
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

        const message = `${
          updated ? 'Updated - ' : ''
        }Your appt with Rare Beauty on ${startDate} at ${startTime} is reserved.\n\nClick ${
          shortURL.id
        } to view address/details`;

        console.error(`message=${message}`);

        if (mobile.indexOf(NO_MOBILE_NUMBER) === -1) {
          await sms(
            Object.assign({}, options, {
              mobile,
              message,
            }),
          );
        } else {
          console.error(`${name} not sent because mobile number is ${mobile}`);
        }
      } catch (err) {
        console.error(`informReservationToCustomer calendarPatch failed`, err);
      }
    }
    return shortURL.id;
  } catch (err) {
    console.error(`informReservationToCustomer final step`, err);
    throw err;
  }
}

async function createEvent(options) {
  // node index --action=createEvent --name=Raymond Ho --mobile=12345678 --start=20170730T1130 --duration=105 --services=service:20181

  try {
    const { event, uuid } = await calendarCreate(
      Object.assign({ calendarId }, options),
    );

    const shortURL = await informReservationToCustomer({ event });

    // no waiting here
    calendarPatch({
      event,
      calendarId,
      informed: true,
      shortURL,
    });

    return {
      event,
      uuid,
    };
  } catch (err) {
    console.error('createEvent - ', err);
    throw err;
  }
}

async function createWaitingEvent(options) {
  // node index --action=createWaitingEvent --name=Raymond Ho --mobile=12345678 --start=20170730T1130 --duration=105 --services=service:20181 --force=true

  try {
    const { event, uuid } = await waitingCalendarCreate(
      Object.assign({}, options, {
        calendarId: waitingListCalendarId,
      }),
    );

    // not able to inform today because of no event being stored in DB, this is best effort information
    // const finalEvent = await informReservationToCustomer({ eventId: event.id });
    return {
      event,
      uuid,
    };
  } catch (err) {
    console.error('createWaitingEvent - ', err);
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
    console.error(`patchEvent`, err);
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

      // to slow down on purpose hence not promise all
      for (let loopIndex = 0; loopIndex < events.length; loopIndex += 1) {
        const event = events[loopIndex];
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
              await sms(
                Object.assign({}, options, {
                  mobile,
                  message,
                }),
              );
            } else {
              console.error(
                `${name} not reminded because mobile number is ${mobile}`,
              );
            }

            await calendarPatch({
              event,
              calendarId,
              reminded: true,
            });
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
    return remindedEvents;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function listContacts(options) {
  try {
    const contacts = await contactLists(options);
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

async function deleteContact(options) {
  try {
    const contact = await contactDelete(options);
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

    // console.log(JSON.stringify(events, null ,2));
    for (let loopIndex = 0; loopIndex < events.length; loopIndex += 1) {
      const event = events[loopIndex];
      if (event.summary.indexOf('+') === 0) return;
      // console.log(event);
      // console.log(`services=${JSON.stringify(event.extendedProperties.shared.services, null, 2)}`);

      const resourceName =
        (event.extendedProperties &&
          event.extendedProperties.shared &&
          event.extendedProperties.shared.resourceName) ||
        null;
      let futureTouchServices = [];
      try {
        const { appointments } = await appointmentsByPerson({
          now: true,
          id: resourceName,
        });
        // console.log(JSON.stringify(appointments, null ,2));
        // extractUnqiueServicesFromAppointmnets(appointments);
        // filter only touchUp services;
        futureTouchServices = Array.from(
          new Set(
            appointments
              .map(appointment =>
                appointment.event.extendedProperties.shared.services.split(','),
              )
              .reduce((a, b) => a.concat(b), []),
          ),
        ).filter(item => TOUCHUP_SERVICES.indexOf(item) > -1);
      } catch (appointmentsByPersonError) {
        console.error(`resourceName=${resourceName}`);
        console.error(appointmentsByPersonError);
      }

      // becareful short circuit here to don't send SMS when touch up services are booked already
      if (
        Array.isArray(futureTouchServices) &&
        futureTouchServices.length > 0
      ) {
        console.error(
          `resourceName=${resourceName} was not reminded because ${event.attendees[0].displayName} has touchup already`,
        );
        return;
      }

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
        let foundFullLashService = null;
        FULL_SERVICES.forEach(service => {
          if (inputServices.indexOf(service) > -1) {
            foundFullLashService = service;
          }
        });
        if (!foundFullLashService) {
          return;
        }

        remindedEvents[remindedEvents.length] = event;

        try {
          const lashService = foundFullLashService;
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

          await sms(
            Object.assign({}, options, {
              mobile,
              message,
            }),
          );

          await calendarPatch({
            eventId: event.id,
            calendarId,
            touchUpReminded: true,
          });
        } catch (err) {
          console.error(err);
        }
      }
    }
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

async function getCountCancelledAppointmentsByPerson(options) {
  const countCancelledAppointments = await countCancelledAppointmentsByPerson(
    options,
  );
  return countCancelledAppointments;
}

async function listTransactions(options) {
  if (options.endDT === null) {
    options.startDT = moment(options.startDT).startOf('day');
    options.endDT = moment(options.startDT).endOf('day');
  }
  // console.log(options);
  const listTransactionsByRange = await listTransactionsDB(options);
  return listTransactionsByRange;
}

async function listFreeSlots(options) {
  try {
    const slots = await calendarListFree(
      Object.assign({}, options, {
        calendarId,
      }),
    );
    return slots;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

const functions = {
  listEvents,
  listDeltaEvents,
  createEvent,
  patchEvent,
  getEvent,
  cancelEvent,
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
  getCountCancelledAppointmentsByPerson,
  deleteContact,
  createWaitingEvent,
  listTransactions,
  listFreeSlots,
};

export default functions;
