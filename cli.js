const fs = require('fs');
const argv = require('yargs').argv;
const moment = require('moment');
import listEvents from './src/api/calendar/list';
const calendarCreate = require('./src/api/calendar/create');
const patchEvent = require('./src/api/calendar/patch');
const reminderList = require('./src/api/reminder/list');
const contactLists = require('./src/api/contacts/list');
const contactCreate = require('./src/api/contacts/create');
const calendarWatch = require('./src/api/calendar/watch');
const calendarWatchStop = require('./src/api/calendar/watch/stop');
const generateJWT = require('./src/api/utilities/jwt');

const { sendReminder: sms } = require('./src/api/utilities/sms');
const { getSyncToken, setSyncToken } = require('./src/api/utilities/token');

async function calendarList(options) {

    const syncToken = await getSyncToken();

    const finalOptions = Object.assign({ calendarId: 'rarebeauty@soho.sg', syncToken }, options);
    try {
        const events = await listEvents(finalOptions);
        // console.log(response);
        if (events.length === 0) {
            console.log('No changed events found.');
        } else {
            // bucket.manager().createPrimaryIndex(function () {
            console.log(`Upcoming events (${events.length}):`);
            for (let i = 0; i < events.length; i += 1) {
                const event = events[i];
                if (event.start) {
                    const start = event.start.dateTime || event.start.date;
                    // console.log(JSON.stringify(event, null, 2));
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

                    console.log(event);
                    await sms({
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
                    }, async (err) => {
                        console.log(err);
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
        id: 'anythingintheworld'
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
        resourceId: '7kUO96Be7gwvDBulEetjGAHV9O8'
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



function getObject(bucket, id) {
    return new Promise((res, rej) => {
        bucket.get(id, function (err, result) {
            if (err) {
                rej(err);
            } else {
                res(result);
            }
        });
    });

}



function setObject(bucket, id, obj) {
    return new Promise((res, rej) => {
        bucket.upsert(id, obj, function (err, result) {
            if (err) {
                rej(err);
            } else {
                res(result);
            }
        });
    });

}

const functions = {
    calendarList,
    createCalendar,
    calendarPatch,
    remindCustomers,
    listContacts,
    createContact,
    watchCalendar,
    stopWatchCalendar,
    getSyncToken,
    setSyncToken
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

async function main(argv) {
    const options = processArguments(argv);
    const results = await options.action(options);
    // process.exit(0);
}

try {
    main(argv);
} catch (err) {
    console.log(err);
}