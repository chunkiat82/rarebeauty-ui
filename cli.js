const argv = require('yargs').argv;
const moment = require('moment');
const listEvents = require('./src/api/calendar/list');
const createEvent = require('./src/api/calendar/create');
const patchEvent = require('./src/api/calendar/patch');
const reminderList = require('./src/api/reminder/list');
const contactLists = require('./src/api/contacts/list');

const sms = require('./src/api/utilities/sms');

async function calendarList() {
    try {
        const events = await listEvents({ calendarId: 'rarebeauty@soho.sg' });
        if (events.length === 0) {
            // console.log('No upcoming events found.');
        } else {
            // console.log(`Upcoming events (${events.length}):`);
            for (let i = 0; i < events.length; i += 1) {
                const event = events[i];
                const start = event.start.dateTime || event.start.date;
                console.log(
                    '%s - %s - %s - %s',
                    start,
                    event.summary,
                    event.id,
                    (event.extendedProperties &&
                        event.extendedProperties.shared &&
                        event.extendedProperties.shared.mobile) ||
                    '0',
                );
            }
        }
        return events;
    } catch (err) {
        throw err;
    }
}

async function calendarCreate(options) {
    // node index --action=calendarCreate --name=Raymond Ho --mobile=12345678 --start=20170730T1130 --duration=105 --services=ELFS,HLW
    try {
        const event = await createEvent(
            Object.assign({}, options, { calendarId: 'rarebeauty@soho.sg' }),
        );
        console.log(event);
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
        console.log(event);
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
                sms({
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

const functions = {
    calendarList,
    calendarCreate,
    calendarPatch,
    remindCustomers,
    listContacts,
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
    return options.action(options);
}

main(argv);
