const fs = require('fs');
const moment = require('moment');

import calendarList from './calendar/list';
import calendarDelta from './calendar/delta';
import contactLists from './contacts/list';

const calendarCreate = require('./calendar/create');
const calendarPatch = require('./calendar/patch');
const reminderList = require('./reminder/list');

const contactCreate = require('./contacts/create');
const calendarWatch = require('./calendar/watch');
const calendarWatchStop = require('./calendar/watch/stop');
const generateJWT = require('./utilities/jwt');

const { sendReminder: sms } = require('./utilities/sms');
const { getSyncToken, setSyncToken } = require('./utilities/token');

async function listEvents(options) {
  const finalOptions = Object.assign(
    { calendarId: 'rarebeauty@soho.sg' },
    options,
  );
  try {
    const events = await calendarList(finalOptions);
    if (events.length === 0) {
      console.log('No changed events found.');
    } else {
      console.log(`Upcoming events (${events.length}):`);
      for (let i = 0; i < events.length; i += 1) {
        const event = events[i];
        if (event.start) {
          const start = event.start.dateTime || event.start.date;
          // console.log(JSON.stringify(event, null, 2));
          const description = (event.description && event.description.split('\n')[0] ) || 'No Description'
          console.log(
            '%s - %s - %s - %s - %s - %s',
            start,
            event.summary,
            event.id,
            description,
            (event.extendedProperties &&
              event.extendedProperties.shared &&
              event.extendedProperties.shared.services) ||
            'no services',
            (event.extendedProperties &&
              event.extendedProperties.shared &&
              event.extendedProperties.shared.mobile) ||
            '0',
            (event.extendedProperties &&
              event.extendedProperties.shared &&
              event.extendedProperties.shared.reminded) ||
            'false',
          );
        } else {
          console.error(event);
        }
      }
    }
    return events;
  } catch (err) {
    throw err;
  }
}

async function listDeltaEvents(options) {
  const finalOptions = Object.assign(
    { calendarId: 'rarebeauty@soho.sg' },
    options,
  );
  try {
    const response = await calendarDelta(finalOptions);
    return response;
  } catch (err) {
    throw err;
  }
}

async function createEvent(options) {
  // node index --action=calendarCreate --name=Raymond Ho --mobile=12345678 --start=20170730T1130 --duration=105 --services=ELFS,HLW
  try {
    const event = await calendarCreate(
      Object.assign({}, options, { calendarId: 'rarebeauty@soho.sg' }),
    );
    // console.log(event);
    return event;
  } catch (err) {
    throw err;
  }
}

async function patchEvent(options) {
  // node index --action=calendarPatch --eventId=XXX --mobile=11111111 --services=ELFS,HLW
  try {
    const event = await calendarPatch(
      Object.assign({}, options, { calendarId: 'rarebeauty@soho.sg' }),
    );
    // console.log(event);
    return event;
  } catch (err) {
    throw err;
  }
}

async function remindCustomers(options) {
  try {
    const events = await reminderList(
      Object.assign({}, options, { calendarId: 'rarebeauty@soho.sg' }),
    );
    if (events.length === 0) {
      console.log('No reminder events found.');
    } else {
      console.log(`Upcoming events for tomorrow ${events.length}`);
      for (let i = 0; i < events.length; i += 1) {
        const event = events[i];
        // console.log(event);
        if (
          event.extendedProperties &&
          event.extendedProperties.shared &&
          (event.extendedProperties.shared.reminded === 'false' ||
            event.extendedProperties.shared.reminded === false)
        ) {
          console.log(event);
          try {
            await sms(
              {
                name: event.summary,
                mobile:
                (event.extendedProperties &&
                  event.extendedProperties.shared &&
                  event.extendedProperties.shared.mobile) ||
                -1,
                event,
              },
              async message => {
                console.log(`${message.sid}-${event.summary}`);
                await calendarPatch(
                  Object.assign({}, options, {
                    eventId: event.id,
                    calendarId: 'rarebeauty@soho.sg',
                    reminded: true,
                  }),
                );
              },
              async err => {
                console.log(err);
              },
            );
          } catch (err) {
            console.log(err);
          }
        }
      }
    }
    return events;
  } catch (err) {
    throw err;
  }
}

async function listContacts() {
  try {
    const contacts = await contactLists();
    return contacts;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function createContact(options) {
  try {
    const contact = await contactCreate(options);
    console.log(contact);
    return contact;
  } catch (err) {
    console.log(err);
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
    console.log(response);
    return response;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function stopWatchCalendar(options) {
  const finalOptions = Object.assign({}, options, {
    calendarId: 'rarebeauty@soho.sg',
    id: 'anythingintheworld',
    resourceId: '7kUO96Be7gwvDBulEetjGAHV9O8',
  });
  try {
    const response = await calendarWatchStop(finalOptions);
    console.log(response);
    return response;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

const functions = {
  listEvents,
  listDeltaEvents,
  createEvent,
  patchEvent,
  remindCustomers,
  listContacts,
  createContact,
  watchCalendar,
  stopWatchCalendar,
  getSyncToken,
  setSyncToken,
};

export default functions;
