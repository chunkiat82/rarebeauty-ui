import moment from 'moment';
import api from './../api';
import { get, remove, upsert } from '../data/database';

const { getSyncToken, setSyncToken } = require('../api/utilities/token');

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

export async function handleCalendarWebhook(headers) {
  // console.log(`headers=${JSON.stringify(headers, null, 2)}`);
  // console.log('-------------------------------------------------------');
  // headers not used
  const { value: configWatch } = await get('config:watch');
  console.error('-------------------------------------------------------');
  // console.log(headers["x-goog-resource-id"]);
  // console.log(configWatch.resourceId);
  // console.log('-------------------------------------------------------');
  if (headers['x-goog-resource-id'] !== configWatch.resourceId) {
    console.error('need to check this ASAP');
    return;
  }

  const syncToken = await getSyncToken(headers);
  const response = await api({
    action: 'listDeltaEvents',
    syncToken,
  });

  const { items: events, nextSyncToken } = response;
  console.error('----------------------------------------------');
  console.error(JSON.stringify(response, null, 2));
  console.error('----------------------------------------------');
  console.error(JSON.stringify(response.items, null, 2));
  console.error('----------------------------------------------');
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
      const apptDateMT = moment(item.start.dateTime);
      const currentMT = moment();
      const appDays = moment.duration(apptDateMT, 'days');
      const currentDays = moment.duration(currentMT, 'days');
      console.error(`apptDateMT=${apptDateMT}`);
      console.error(`currentDays=${currentDays}`);
      console.error(`difference=${currentDays - appDays}`);
      if (currentDays - appDays > 7) {
        console.error(`item more than 7 days wants changes =${item.id}`);
        return;
      }
    }

    if (item.status === 'cancelled') {
      handleCancel(item);
    } else if (item.status === 'confirmed' || item.status === 'tentative') {
      //some massaging here
      populateStats(item);
      handleUpsert(item);
      try {
        const uuid = item.extendedProperties.shared.uuid;
        console.error(`uuid=${uuid}`);
        const transResponse = await get(`trans:${uuid}`);
        const transaction = transResponse.value;
        transaction.apptDate = moment(item.start.dateTime);
        await upsert(`trans:${uuid}`, transaction);
      } catch (err) {
        console.error(err);
      }
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
  }

  // console.log(events);
}


//instead of scripting on kibana, i'm duplicating the content here,
function populateStats(item) {
  const apptDateMT = moment(item.start.dateTime);
  const createdDateMT = moment(item.created);
  const apptSeconds = moment.duration(apptDateMT, 'seconds');
  const createdSeconds = moment.duration(createdDateMT, 'seconds');
  item.extendedProperties.shared['bookedAhead'] = apptSeconds - createdSeconds < 0 ? 0 :  apptSeconds - createdSeconds;
}

export default handleCalendarWebhook;
