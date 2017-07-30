const fs = require('fs');
const argv = require('yargs').argv;
const moment = require('moment');
const listEvents = require('./src/api/calendar/list');
const calendarCreate = require('./src/api/calendar/create');
const patchEvent = require('./src/api/calendar/patch');
const reminderList = require('./src/api/reminder/list');
const contactLists = require('./src/api/contacts/list');
const contactCreate = require('./src/api/contacts/create');


const { sendReminder: sms } = require('./src/api/utilities/sms');

async function calendarList(options) {

    const finalOptions = Object.assign({ calendarId: 'rarebeauty@soho.sg'}, options);
    try {
        const events = await listEvents(finalOptions);
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
                    (event.extendedProperties &&
                        event.extendedProperties.shared &&
                        event.extendedProperties.shared.reminded) ||
                    'false'
                );
            }
        }
        // fs.writeFileSync('./data.json', JSON.stringify(events, null, 2), 'utf-8');
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
            console.log('Upcoming events for tomorrow');
            for (let i = 0; i < events.length; i += 1) {
                const event = events[i];
                // console.log(event);
                if (event.extendedProperties &&
                    event.extendedProperties.shared && (
                        event.extendedProperties.shared.reminded === 'false' ||
                        event.extendedProperties.shared.reminded === false)) {
                    sms({
                        name: event.summary,
                        mobile:
                        (event.extendedProperties &&
                            event.extendedProperties.shared &&
                            event.extendedProperties.shared.mobile) ||
                        -1,
                        event,
                    }, async (message) => {
                        console.log(message.sid + "-" + event.summary);
                        await calendarPatch(Object.assign({}, options, { eventId: event.id, reminded: true }));
                    });
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
        console.log(contacts);
        return contacts;
    } catch (err) {
        throw err;
    }
}

async function createContact(options) {
    try {
        const contact = await contactCreate(options);
        console.log(contact);
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
    createContact
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
