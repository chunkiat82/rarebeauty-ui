import api from './../api';
import moment from 'moment';
import db from '../data/database';

const { getSyncToken, setSyncToken } = require('../api/utilities/token');

export async function handleCalendarWebhook(headers) {

    // console.log(`headers=${JSON.stringify(headers, null, 2)}`);
    // console.log('-------------------------------------------------------');
    // headers not used
    const { value: configWatch } = await db.get("config:watch");
    console.log('-------------------------------------------------------');
    // console.log(headers["x-goog-resource-id"]);
    // console.log(configWatch.resourceId);
    // console.log('-------------------------------------------------------');
    if (headers["x-goog-resource-id"] !== configWatch.resourceId) {
        console.log('need to check this ASAP');
        return;
    }


    const syncToken = await getSyncToken(headers);
    const response = await api({
        action: 'listDeltaEvents',
        syncToken,
    });

    const { items: events, nextSyncToken } = response;

    console.log(`Incoming Changed events (${events.length}):`);
    events.forEach(async (item) => {
        // implement this feature later
        if (item.summary && item.summary.indexOf('-') === 0) return;

        if (item.status === 'cancelled') {
            handleCancel(item);
        } else if (item.status === 'confirmed') {
            handleUpsert(item);
            try {
                const uuid = item.extendedProperties.shared.uuid;
                console.error(`uuid=${uuid}`);
                const response = await db.get(`trans:${uuid}`);
                const transaction = response.value;
                transaction.apptDate = moment(item.start.dateTime);
                await db.upsert(`trans:${uuid}`, transaction);
            } catch (err) {
                console.error(err);
            }
        } else {
            console.error(`unhandled status-${item.id}`);
        }

        // temp loggin
        const event = item;
        if (event.start) {
            const start = event.start.dateTime || event.start.date;
            // console.log(
            //   '%s - %s - %s - %s',
            //   start,
            //   event.summary,
            //   event.id,
            //   (event.extendedProperties &&
            //     event.extendedProperties.shared &&
            //     event.extendedProperties.shared.mobile) ||
            //     '0',
            //   (event.extendedProperties &&
            //     event.extendedProperties.shared &&
            //     event.extendedProperties.shared.reminded) ||
            //     'false',
            // );
        } else {
            console.error(
                `event start date missing for - ${event.id} - ${event.status}`,
            );
        }
    });

    // save only when there is nextSyncToken otherwise it screws others
    if (nextSyncToken) {
        await setSyncToken({
            syncToken: nextSyncToken,
            lastUpdated: moment(),
        });
    }

    // console.log(events);
}

async function handleCancel(item) {
    try {
        const eventId = item.id;
        const response = await db.get(`event:${eventId}`);
        const event = response.value;
        // console.log(event);
        const apptId = event.extendedProperties.shared.uuid;
        try {
            await db.remove(`event:${eventId}`);
        } catch (e) {
            console.log('unable to remove event= ' + eventId);
        }
        try {
            await db.remove(`trans:${apptId}`);
        } catch (e) {
            console.log('unable to remove transaction= ' + apptId);
        }
        try {
            await db.remove(`appt:${apptId}`);
        } catch (e) {
            console.log('unable to remove appointment= ' + apptId);
        }
    } catch (e) {
        console.log('cannot get event-' + item.id);
    }
}

async function handleUpsert(item) {
    // if (item.creator.email === 'rarebeauty@soho.sg') {
    //   console.log('-----THIS APPOINTMENT NOT CREATED BY THE APP---');
    //   console,log(item);
    //   return;
    // }
    await db.upsert(`event:${item.id}`, item);
}

const functionToCall = {
    cancelled: handleCancel,
    confirmed: handleUpsert,
};

export default handleCalendarWebhook;
