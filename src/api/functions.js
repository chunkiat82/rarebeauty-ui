import jwt from 'jsonwebtoken';
import config from '../config';
import calendarList from './calendar/list';
import calendarGet from './calendar/get';
import calendarDelta from './calendar/delta';
import contactLists from './contacts/list';

const calendarCreate = require('./calendar/create');

const calendarPatch = require('./calendar/patch');
const reminderList = require('./reminder/list');

const contactCreate = require('./contacts/create');
const calendarWatch = require('./calendar/watch');
const calendarWatchStop = require('./calendar/watch/stop');

const { sendReminder: sms } = require('./utilities/sms');
const { getSyncToken, setSyncToken } = require('./utilities/token');
const { get, upsert } = require('../data/database');

async function listEvents(options) {
  const finalOptions = Object.assign(
    { calendarId: 'rarebeauty@soho.sg' },
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
    { calendarId: 'rarebeauty@soho.sg' },
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
    { calendarId: 'rarebeauty@soho.sg' },
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
      Object.assign({}, options, { calendarId: 'rarebeauty@soho.sg' }),
    );
    // console.log(event);
    return event;
  } catch (err) {
    console.error(err);
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
    console.error(err);
    throw err;
  }
}

async function remindCustomers(options) {
  try {
    const events = await reminderList(
      Object.assign({}, options, { calendarId: 'rarebeauty@soho.sg' }),
    );
    if (events.length === 0) {
      // console.log('No reminder events found.');
    } else {
      // console.log(`Upcoming events for tomorrow ${events.length}`);
      events.forEach(async event => {
        // console.log(event);
        if (
          event.extendedProperties &&
          event.extendedProperties.shared &&
          (event.extendedProperties.shared.reminded === 'false' ||
            event.extendedProperties.shared.reminded === false)
        ) {
          // console.log(event);
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
                // console.log(
                //   `${message.sid}-${event.summary}-${event.start.dateTime}`,
                // );
                try {
                  await calendarPatch(
                    Object.assign(
                      {},
                      {
                        eventId: event.id,
                        calendarId: 'rarebeauty@soho.sg',
                        reminded: true,
                      },
                    ),
                  );
                } catch (err) {
                  console.error(err);
                  console.error(message);
                }
              },
              async err => {
                console.error(err);
              },
            );
          } catch (err) {
            console.error(err);
          }
        }
      });
    }
    return events;
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

async function watchCalendar(options) {
  const finalOptions = Object.assign({}, options, {
    calendarId: 'rarebeauty@soho.sg',
    address: 'https://rarebeauty.soho.sg/events/calendar',
    id: 'anythingintheworld',
  });
  try {
    const response = await calendarWatch(finalOptions);
    // console.log(response);
    await upsert('config:watch', { resourceId: response.resourceId });
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
      data: { username: options.username || 'baduser' },
    },
    config.auth.jwt.secret,
    { expiresIn: '365d' },
  );
}

async function listCustomerAppointments(options) {
  return listEvents(Object.assign({ maxResults: 3 }, options));
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
  getEvent,
  generateJWT,
  listCustomerAppointments,
};

export default functions;
