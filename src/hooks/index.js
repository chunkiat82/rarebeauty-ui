import api from './../api';
import moment from 'moment';
import db from '../data/database';

const { getSyncToken, setSyncToken } = require('../api/utilities/token');

export async function handleCalendarWebhook(headers) {
  // headers not used
  const syncToken = await getSyncToken(headers);
  const response = await api({
    action: 'listDeltaEvents',
    syncToken,
  });

  const { items: events, nextSyncToken } = response;

  console.log(`Upcoming Changed events (${events.length}):`);
  events.forEach(item => {
    if (item.summary.indexOf('-') === 0) return;
    if (item.status === 'cancelled') {
      handleCancel(item);
    } else if (item.status === 'confirmed') {
      handleUpsert(item);
    } else {
      console.log(`unhandled status-${item.id}`);
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
      console.log(
        `event start date missing for - ${event.summary} ${event.status}`,
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

  console.log(events);
}

async function handleCancel(item) {
  try {
    await db.remove(`event:${item.id}`);
  } catch (e){
    console.log('unable to remove event= ' + item.id);
  }

  try {
    await db.remove(`trans:${item.extendedProperties.shared.apptId}`);
  } catch (e){
    console.log('unable to remove transaction= ' + item.extendedProperties.shared.apptId);
  }

  try {
    await db.remove(`appt:${item.extendedProperties.shared.apptId}`);
  } catch (e){
    console.log('unable to remove appointment= ' + item.extendedProperties.shared.apptId);
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
