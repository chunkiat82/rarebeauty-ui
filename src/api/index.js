const moment = require('moment');
const listEvents = require('./calendar/list');
const calendarCreate = require('./calendar/create');
const patchEvent = require('./calendar/patch');
const reminderList = require('./reminder/list');
const contactLists = require('./contacts/list');
const contactCreate = require('./contacts/create');

const { sendReminder } = require('./utilities/sms');

async function calendarList() {
  try {
    const events = await listEvents({ calendarId: 'rarebeauty@soho.sg' });
    return events;
  } catch (err) {
    throw err;
  }
}

async function createCalendar(options) {
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

async function calendarPatch(options) {
  // node index --action=calendarPatch --eventId=XXX --mobile=11111111 --services=ELFS,HLW
  try {
    const event = await patchEvent(
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
      // console.log('No reminder events found.');
    } else {
      // console.log('Upcoming events for the half day');
      for (let i = 0; i < events.length; i += 1) {
        const event = events[i];
        sendReminder({
          name: event.summary,
          mobile:
            (event.extendedProperties &&
              event.extendedProperties.shared &&
              event.extendedProperties.shared.mobile) ||
            -1,
          event,
        });
        // break;
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
    throw err;
  }
}

async function createContact(options) {
  try {
    const contact = await contactCreate(options);
    return contact;
  } catch (err) {
    throw err;
  }
}

const functions = {
  calendarList,
  createCalendar,
  calendarPatch,
  remindCustomers,
  listContacts,
  createContact,
};

function processArguments(argv) {
  const options = argv;
  const startDT = moment(argv.start);
  const endDT = moment(startDT).add(argv.duration, 'minutes');

  return Object.assign({}, options, {
    startDT: startDT.toISOString(),
    endDT: endDT.toISOString(),
    action: functions[argv.action] || calendarList,
  });
}

function main(argv) {
  const options = processArguments(argv);
  // console.log(`options=${options.action}`);
  return options.action(options);
}

export default main;
