import api from './../api';
import moment from 'moment';
import db from '../data/database';

const { getSyncToken, setSyncToken } = require('../api/utilities/token');

export async function handleCalendarWebhook(headers) {
  // headers not used
  const syncToken = await getSyncToken(headers);
  const response = await api({
    action: 'calendarListDelta',
    syncToken,
  });

  const { items: changes, nextSyncToken } = response;

  changes.forEach(item => {
    if (item.id.indexOf('_') === 0) return;

    if (item.status === 'cancelled') {
      handleCancel(item);
    } else if (item.status === 'confirmed') {
      handleUpsert(item);
    } else {
      console.log('unhandled status');
    }
  });

  // save only when there is nextSyncToken otherwise it screws others
  if (nextSyncToken) {
    await setSyncToken({
      syncToken: nextSyncToken,
      lastUpdated: moment(),
    });
  }

  console.log(changes);
}

async function handleCancel(item) {
  await db.remove(`event:${item.id}`);
}

async function handleUpsert(item) {
  if (item.id.indexOf('_') !== 0) {
    await db.upsert(`event:${item.id}`, item);
  } else {
    console.log(`item.id =${item.id} ignored`);
  }
}

const functionToCall = {
  cancelled: handleCancel,
  confirmed: handleUpsert,
};

export default handleCalendarWebhook;
