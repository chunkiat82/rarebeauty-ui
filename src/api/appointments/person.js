import moment from 'moment';
import { get, query } from '../../data/database';

export async function getAppointment(id, context) {
  try {
    const apptResponse = await get(`appt:${id}`, context);
    const appt = apptResponse;
    const { eventId, transId } = appt;
    // console.log(`appt1=${JSON.stringify(appt, null, 2)}`);
    context.callingFunction = 'appointments/person';
    const eventResponse = await get(`event:${eventId}`, context);
    // console.log(`event=${JSON.stringify(appt, null, 2)}`);

    const transactionResponse = await get(`trans:${transId}`, context);
    // console.log(`trans=${JSON.stringify(appt, null, 2)}`);

    appt.event = eventResponse;
    appt.transaction = transactionResponse;
    // console.log(`appt2=${JSON.stringify(appt, null, 2)}`);
    return appt;
  } catch (error) {
    console.error('[DB get by person error]', error);
    // return { id, event:{}, transaction:{},createdAt:new Date(), lastUpdate: new Date() }
    throw error;
  }
}

// CREATE INDEX canceledAt_index ON `default`(canceledAt);
export function cancelledByPerson(options) {
  // console.log(options);
  return new Promise(async (res, rej) => {
    const { id, context } = options;
    const { tenant: tenantName } = context;
    const collectionFullName =
      tenantName === 'legacy' ? 'default' : 'appointments.rarebeauty.default';

    const queryString = `Select count(*) as totalCancelledLess36 from (
      select cancelHours
        from (select DATE_DIFF_MILLIS(STR_TO_MILLIS(event.\`value\`.\`start\`.dateTime), STR_TO_MILLIS(canceledAt), 'hour') as cancelHours, 
        canceledAt, event.\`value\`.\`start\`.dateTime, id
          from ${collectionFullName} cancelledEvents
          where canceledAt is not null and event.\`value\`.extendedProperties.shared.resourceName = '${id}') as cancelHoursTable 
        where cancelHours < 36) as lessThanThirtySix`;

    try {
      // console.log(queryString);
      const idObjs = await query(queryString, context);
      let totalCancelledLess36 = -1;
      if (idObjs.length === 1) {
        totalCancelledLess36 = idObjs[0].totalCancelledLess36;
      }
      res({
        id,
        cancelledAppointmentsCount: totalCancelledLess36,
      });
    } catch (err) {
      console.error(`cancelledByPerson=${JSON.stringify(err)}`);
      rej(err);
    }
  });
}

export function byPerson(options) {
  const { context } = options;
  const { tenant: tenantName } = context;
  const collectionFullName =
    tenantName === 'legacy' ? 'default' : 'appointments.rarebeauty.default';

  return new Promise(async (res, rej) => {
    const { limit, id, now } = options;
    let cancelCount = 0;
    try {
      const { cancelledAppointmentsCount } = await cancelledByPerson(options);

      cancelCount = cancelledAppointmentsCount;
      // console.log(`byPersonCount - ${id}`, count);
    } catch (e) {
      console.error('you can ignore this for now');
    }

    let queryString = `select extendedProperties.shared.uuid from ${collectionFullName} event where extendedProperties.shared.resourceName='${id}'`;

    try {
      if (now) queryString += ` and \`end\`.dateTime > now_str()`;
      queryString += ` ORDER BY \`start\`.\`dateTime\` desc LIMIT ${limit ||
        '5'}`;

      // console.log(queryString);
      const idObjs = await query(queryString, context);
      // console.log(`idObjs=${JSON.stringify(idObjs,null,2)}`);
      // need to get batch here instead
      const promises = [];
      let uuidObjs = [];
      idObjs.forEach(idObj => {
        const { uuid } = idObj;
        // console.log(`uuid=${uuid}`);
        promises[promises.length] = get(`appt:${uuid}`, context);
      });

      uuidObjs = await Promise.all(promises);

      const appointmentsPromises = [];

      uuidObjs.forEach(uuidObj => {
        // console.log(`uuidObj.id=${uuidObj.id}`);
        if (uuidObj !== null)
          appointmentsPromises[appointmentsPromises.length] = getAppointment(
            uuidObj.id,
            context,
          );
      });

      const appointments = await Promise.all(appointmentsPromises);
      // console.log(appointments);
      res({
        id,
        cancelCount,
        createdAt: moment(),
        lastUpdated: moment(),
        appointments: appointments || [],
      });
    } catch (err) {
      console.error(`Error byPerson=${JSON.stringify(err)}`);
      rej(err);
    }
  });
}

export function byPersonCount(options) {
  const { id, context } = options;
  const { tenant: tenantName } = context;
  const collectionFullName =
    tenantName === 'legacy' ? 'default' : 'appointments.rarebeauty.default';

  return new Promise(async (res, rej) => {
    try {
      const queryString = `select count(*) from ${collectionFullName} event where extendedProperties.shared.resourceName='${id}'`;
      // console.log(queryString);
      const counts = await query(queryString, context);

      const { $1: count } = counts[0];
      //   console.log(`count=${count}`);
      res({ count });
    } catch (err) {
      rej(err);
    }
  });
}

export default byPerson;
