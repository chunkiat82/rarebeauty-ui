/* eslint-disable no-undef */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
// import Hashids from 'hashids';
import moment from 'moment';
import api from './../api';
import { get, remove, upsert } from '../data/database';
// import { tenants } from '../api/keys/tenants.json';

const { getSyncToken, setSyncToken } = require('../api/utilities/token');

// instead of scripting on kibana, i'm duplicating the content here,
function populateStats(item) {
  const apptDateMT = moment(item.start.dateTime, 'YYYY-MM-DDThh:mm:ssZ');
  const createdDateMT = moment(item.created, 'YYYY-MM-DDThh:mm:ssZ');
  const duration = moment.duration(createdDateMT.diff(apptDateMT));
  const seconds = duration.asSeconds();

  try {
    item.extendedProperties.shared.bookedAhead = seconds < 0 ? 0 : seconds;
  } catch (populateStatsError) {
    console.error(`populateStats - item cannot be read - item.id=`, item.id);
    throw populateStatsError;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleCancel(item, context) {
  try {
    const eventId = item.id;
    const response = await get(`event:${eventId}`, context);
    const event = response;
    // console.log(event);
    const apptId = event.extendedProperties.shared.uuid;
    try {
      await remove(`event:${eventId}`, context);
    } catch (e) {
      console.error(`unable to remove event= ${eventId}`);
    }
    try {
      await remove(`trans:${apptId}`, context);
    } catch (e) {
      console.error(`unable to remove transaction= ${apptId}`);
    }
    try {
      await remove(`appt:${apptId}`, context);
    } catch (e) {
      console.error(`unable to remove appointment= ${apptId}`);
    }
  } catch (e) {
    console.error(`cannot get event-${item.id}`);
  }
}

async function handleUpsert(item, context) {
  await upsert(`event:${item.id}`, item, context);
}

async function updateTransactionOnTime(item) {
  const uuid = item.extendedProperties.shared.uuid;
  let transResponse = null;
  let transaction = null;

  try {
    console.error(`uuid=${uuid}`);
    transResponse = await get(`trans:${uuid}`, context);
    transaction = transResponse;
    transaction.apptDate = moment(item.start.dateTime, 'YYYY-MM-DDThh:mm:ssZ');
  } catch (err) {
    console.error('retrying to get transaction', err);
    await sleep(2000);
    try {
      transResponse = await get(`trans:${uuid}`, context);
      transaction = transResponse;
      transaction.apptDate = moment(
        item.start.dateTime,
        'YYYY-MM-DDThh:mm:ssZ',
      );
    } catch (innerErr) {
      console.error('failed to get transaction', innerErr);
      throw innerErr;
    }
  }

  // If transaction is not null or undefined
  if (transaction) {
    try {
      await upsert(`trans:${uuid}`, transaction, context);
    } catch (upsertError) {
      console.error('upsert transaction', upsertError);
      throw upsertError;
    }
  }
}

export async function handleCalendarWebhook(headers) {
  console.error(`headers=${JSON.stringify(headers, null, 2)}`);
  // setting tenantName
  const context = { tenant: headers['x-goog-channel-id'] || 'notenantfound' };
  try {
    console.error(
      '-------------------------------------------------------0 START',
    );
  } catch (configErr) {
    console.error('configErr', configErr);
    throw configErr;
  }
  let runOnce = false;
  let nextPageToken = null;
  let nextSyncToken = null;
  let syncToken = null;
  while (!runOnce || nextPageToken || nextSyncToken) {
    if (runOnce) break;
    let response = null;
    try {
      // first call on the first run
      if (!nextPageToken || !nextSyncToken) {
        syncToken = await getSyncToken(context);
      }

      response = await api({
        action: 'listDeltaEvents',
        syncToken,
        nextPageToken,
        nextSyncToken,
        context,
      });
      // need to fix next pagetoken error
      const { items: events } = response;
      nextPageToken = response.nextPageToken;
      nextSyncToken = response.nextSyncToken;

      console.error('----------------------------------------------1');
      console.error(`nextSyncToken=`, nextSyncToken);
      console.error(`nextPageToken=`, nextPageToken);
      console.error('----------------------------------------------2');
      // console.error(JSON.stringify(response.items, null, 2));
      // console.error('----------------------------------------------3');
      console.error(`Incoming Changed events (${events.length}):`);

      for (let eventIndex = 0; eventIndex < events.length; eventIndex += 1) {
        const item = events[eventIndex];

        if (
          item.summary &&
          (item.summary.indexOf('-') === 0 || item.summary.indexOf('+') === 0)
        ) {
          // eslint-disable-next-line no-continue
          continue;
        }

        console.error(JSON.stringify(item, null, 2));

        // if item is more than 7 days old return do nothing
        if (item && item.start && item.start.dateTime) {
          const apptDateMT = moment(
            item.start.dateTime,
            'YYYY-MM-DDThh:mm:ssZ',
          );
          const currentMT = moment();
          const duration = moment.duration(currentMT.diff(apptDateMT));
          const days = duration.asDays();
          if (days > 7) {
            console.error(`item more than 7 days wants changes =${item.id}`);
            console.error('currentMT', currentMT);
            console.error('apptDateMT', apptDateMT);
            // eslint-disable-next-line no-continue
            continue;
          }
        }

        if (item.status === 'cancelled') {
          handleCancel(item, context);
        } else if (item.status === 'confirmed' || item.status === 'tentative') {
          // some massaging here
          try {
            populateStats(item);
            await handleUpsert(item, context);
            await updateTransactionOnTime(item, context);
          } catch (handleError) {
            console.error('Skipping with Error!!!!!!!!!! --- ', item);
          }
        } else {
          console.error(`unhandled status-${item.id}`);
        }

        // temp logging // mostly cancel use case
        const event = item;
        if (!event.start) {
          console.error(
            `event start date missing for - ${event.id} - ${event.status}`,
          );
        }
      }

      // save only when there is nextSyncToken otherwise it screws others
      if (nextSyncToken) {
        runOnce = true;
        await setSyncToken({
          syncToken: nextSyncToken,
          lastUpdated: moment(),
          context,
        });
        console.error('next Sync Token', nextSyncToken);
      }
    } catch (mainError) {
      console.error('anything that went wrong', mainError);
      throw mainError;
    }
  }

  console.error('----------------------------------------------4 END');

  // console.log(events);
  // return events;
}

export default handleCalendarWebhook;
