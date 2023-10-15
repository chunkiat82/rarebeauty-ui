import moment from 'moment';
import { get, query } from '../../data/database';
import { get as getAppointment } from '../../data/database/appointment';

const collectionFullName =
  process.env.CB_BUCKET && process.env.CB_SCOPE && process.env.CB_COLLECTION
    ? `${process.env.CB_BUCKET}.${process.env.CB_SCOPE}.${process.env.CB_COLLECTION}`
    : `default`;

// CREATE INDEX canceledAt_index ON `default`(canceledAt);
export function cancelledByPerson(options) {
  // console.log(options);
  return new Promise(async (res, rej) => {
    const { id } = options;

    const queryString = `Select count(*) as totalCancelledLess36 from (
      select cancelHours
        from (select DATE_DIFF_MILLIS(STR_TO_MILLIS(event.\`value\`.\`start\`.dateTime), STR_TO_MILLIS(canceledAt), 'hour') as cancelHours, 
        canceledAt, event.\`value\`.\`start\`.dateTime, id
          from ${collectionFullName} cancelledEvents
          where canceledAt is not null and event.\`value\`.extendedProperties.shared.resourceName = '${id}') as cancelHoursTable 
        where cancelHours < 36) as lessThanThirtySix`;

    try {
      // console.log(queryString);
      const idObjs = await query(queryString);
      let totalCancelledLess36 = -1;
      if (idObjs.length === 1) {
        totalCancelledLess36 = idObjs[0].totalCancelledLess36;
      }
      res({
        id,
        cancelledAppointmentsCount: totalCancelledLess36,
      });
    } catch (err) {
      console.error(`Error byPerson=${JSON.stringify(err)}`);
      rej(err);
    }
  });
}

export function byPerson(options) {
  // console.log(options);
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
      const idObjs = await query(queryString);
      // console.log(`idObjs=${JSON.stringify(idObjs,null,2)}`);
      // need to get batch here instead
      const promises = [];
      let uuidObjs = [];
      idObjs.forEach(idObj => {
        const { uuid } = idObj;
        // console.log(`uuid=${uuid}`);
        promises[promises.length] = get(`appt:${uuid}`);
      });

      uuidObjs = await Promise.all(promises);

      const appointmentsPromises = [];

      uuidObjs.forEach(uuidObj => {
        // console.log(`uuidObj.id=${uuidObj.id}`);
        if (uuidObj !== null)
          appointmentsPromises[appointmentsPromises.length] = getAppointment(
            uuidObj.id,
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
  const { id } = options;
  // console.log(options);
  return new Promise(async (res, rej) => {
    try {
      const queryString = `select count(*) from ${collectionFullName} event where extendedProperties.shared.resourceName='${id}'`;
      // console.log(queryString);
      const counts = await query(queryString);

      const { $1: count } = counts[0];
      //   console.log(`count=${count}`);
      res({ count });
    } catch (err) {
      rej(err);
    }
  });
}

export default byPerson;
