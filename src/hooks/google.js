/* eslint-disable no-param-reassign */
import moment from 'moment';
import api from './../api';
import { get, remove, upsert } from '../data/database';

const { getSyncToken, setSyncToken } = require('../api/utilities/token');

// instead of scripting on kibana, i'm duplicating the content here,
function populateStats(item) {
  const apptDateMT = moment(item.start.dateTime, 'YYYY-MM-DDThh:mm:ssZ');
  const createdDateMT = moment(item.created, 'YYYY-MM-DDThh:mm:ssZ');
  const duration = moment.duration(createdDateMT.diff(apptDateMT));
  const seconds = duration.asSeconds();

  item.extendedProperties.shared.bookedAhead = seconds < 0 ? 0 : seconds;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleCancel(item) {
  try {
    const eventId = item.id;
    const response = await get(`event:${eventId}`);
    const event = response.value;
    // console.log(event);
    const apptId = event.extendedProperties.shared.uuid;
    try {
      await remove(`event:${eventId}`);
    } catch (e) {
      console.error(`unable to remove event= ${eventId}`);
    }
    try {
      await remove(`trans:${apptId}`);
    } catch (e) {
      console.error(`unable to remove transaction= ${apptId}`);
    }
    try {
      await remove(`appt:${apptId}`);
    } catch (e) {
      console.error(`unable to remove appointment= ${apptId}`);
    }
  } catch (e) {
    console.error(`cannot get event-${item.id}`);
  }
}

async function handleUpsert(item) {
  await upsert(`event:${item.id}`, item);
}

async function updateTransactionOnTime(item) {
  const uuid = item.extendedProperties.shared.uuid;
  let transResponse = null;
  let transaction = null;

  try {
    console.error(`uuid=${uuid}`);
    transResponse = await get(`trans:${uuid}`);
    transaction = transResponse.value;
    transaction.apptDate = moment(item.start.dateTime, 'YYYY-MM-DDThh:mm:ssZ');
  } catch (err) {
    console.error('retrying to get transaction', err);
    await sleep(2000);
    try {
      transResponse = await get(`trans:${uuid}`);
      transaction = transResponse.value;
      transaction.apptDate = moment(
        item.start.dateTime,
        'YYYY-MM-DDThh:mm:ssZ',
      );
    } catch (innerErr) {
      console.error('failed tryng to get transaction', innerErr);
    }
  }

  // If transaction is not null or undefined
  if (transaction) {
    try {
      await upsert(`trans:${uuid}`, transaction);
    } catch (err) {
      console.error('upsert transaction', err);
    }
  }
}

export async function handleCalendarWebhook(headers) {
  console.error(`headers=${JSON.stringify(headers, null, 2)}`);
  // console.log('-------------------------------------------------------');
  // headers not used
  let response = null;
  try {
    const { value: configWatch } = await get('config:watch');
    console.error('-------------------------------------------------------0');
    // console.log(headers["x-goog-resource-id"]);
    // console.log(configWatch.resourceId);
    // console.log('-------------------------------------------------------');
    if (headers['x-goog-resource-id'] !== configWatch.resourceId) {
      console.error('need to check this ASAP');
      return;
    }

    const syncToken = await getSyncToken(headers);
    response = await api({
      action: 'listDeltaEvents',
      syncToken,
    });
  } catch (configErr) {
    console.error('configErr', configErr);
    throw configErr;
  }

  const { items: events, nextSyncToken } = response;
  console.error('----------------------------------------------1');
  console.error(JSON.stringify(response, null, 2));
  console.error('----------------------------------------------2');
  // console.error(JSON.stringify(response.items, null, 2));
  // console.error('----------------------------------------------3');
  console.error(`Incoming Changed events (${events.length}):`);
  events.forEach(async item => {
    // implement this feature later
    if (
      item.summary &&
      (item.summary.indexOf('-') === 0 || item.summary.indexOf('+') === 0)
    )
      return;

    // if item is more than 7 days old return do nothing
    if (item && item.start && item.start.dateTime) {
      const apptDateMT = moment(item.start.dateTime, 'YYYY-MM-DDThh:mm:ssZ');
      const currentMT = moment();
      const duration = moment.duration(currentMT.diff(apptDateMT));
      const days = duration.asDays();
      if (days > 7) {
        console.error(`item more than 7 days wants changes =${item.id}`);
        return;
      }
    }

    if (item.status === 'cancelled') {
      handleCancel(item);
    } else if (item.status === 'confirmed' || item.status === 'tentative') {
      // some massaging here
      populateStats(item);
      await handleUpsert(item);
      await updateTransactionOnTime(item);
    } else {
      console.error(`unhandled status-${item.id}`);
    }

    // temp loggin
    const event = item;
    if (event.start) {
      //   const start = event.start.dateTime || event.start.date;
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
    console.error(
      '---------------------------------------------- next Sync Token',
    );
  }

  console.error('----------------------------------------------4');

  // console.log(events);
}

export default handleCalendarWebhook;
