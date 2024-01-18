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
    context.callingFunction = 'hook/google/handleCancel';
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

/**
 *
 * The retry is really weird to get transaction
 *
 * @param {*} item
 * @param {*} context
 */
async function updateTransactionOnTime(item, context) {
  const uuid = item.extendedProperties.shared.uuid;
  let transResponse = null;
  let transaction = null;

  try {
    await sleep(2000);
    transResponse = await get(`trans:${uuid}`, context);
    transaction = transResponse;
    transaction.apptDate = moment(item.start.dateTime, 'YYYY-MM-DDThh:mm:ssZ');
  } catch (err) {
    console.error(`uuid=${uuid}`);
    console.error('retrying to get transaction');
    await sleep(2000);
    try {
      transResponse = await get(`trans:${uuid}`, context);
      transaction = transResponse;
      transaction.apptDate = moment(
        item.start.dateTime,
        'YYYY-MM-DDThh:mm:ssZ',
      );
    } catch (innerErr) {
      console.error('failed to get transaction');
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
  // console.error(`headers=${JSON.stringify(headers, null, 2)}`);
  console.error('webhook invoked');
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
        const event = events[eventIndex];

        if (
          event.summary &&
          (event.summary.indexOf('-') === 0 || event.summary.indexOf('+') === 0)
        ) {
          // eslint-disable-next-line no-continue
          continue;
        }

        // console.error(JSON.stringify(event, null, 2));

        // if item is more than 7 days old return do nothing
        if (event && event.start && event.start.dateTime) {
          const apptDateMT = moment(
            event.start.dateTime,
            'YYYY-MM-DDThh:mm:ssZ',
          );
          const currentMT = moment();
          const duration = moment.duration(currentMT.diff(apptDateMT));
          const days = duration.asDays();
          if (days > 7) {
            console.error(`item more than 7 days wants changes =${event.id}`);
            console.error('currentMT', currentMT.toString());
            console.error('apptDateMT', apptDateMT.toString());
            // eslint-disable-next-line no-continue
            continue;
          }
        }

        if (event.status === 'cancelled') {
          handleCancel(event, context);
        } else if (
          event.status === 'confirmed' ||
          event.status === 'tentative'
        ) {
          // some massaging here
          try {
            populateStats(event);
            await handleUpsert(event, context);
            await updateTransactionOnTime(event, context);
          } catch (handleError) {
            console.error('Skipping with Error!!!!!!!!!! --- ', event);
          }
        } else {
          console.error(`unhandled status-${event.id}`);
        }

        // temp logging // mostly cancel use case
        // const event = eventItem;
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
