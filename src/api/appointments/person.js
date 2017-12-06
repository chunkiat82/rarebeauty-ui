import moment from 'moment';
import { get, query } from '../../data/database';
import { get as getAppointment } from '../../data/database/appointment';

function byPerson(options) {
  const { limit, id } = options;
  // console.log(options);
  return new Promise(async (res, rej) => {
    try {
      const queryString = `select extendedProperties.shared.uuid from default event where extendedProperties.shared.resourceName='${id}' ORDER BY   \`start\`.\`dateTime\` desc LIMIT ${limit ||
        '3'}`;
      // console.log(queryString);
      const idObjs = await query(queryString);
      // console.log(`idObjs=${JSON.stringify(idObjs,null,2)}`);
      // need to get batch here instead
      const promises = [];
      idObjs.forEach(idObj => {
        const { uuid } = idObj;
        // console.log(`uuid=${uuid}`);
        promises[promises.length] = get(`appt:${uuid}`);
      });
      const uuidObjs = await Promise.all(promises);

      const appointmentsPromises = [];
      uuidObjs.forEach(uuidObj => {
        // console.log(`uuidObj.value.id=${uuidObj.value.id}`);
        appointmentsPromises[appointmentsPromises.length] = getAppointment(
          uuidObj.value.id,
        );
      });
      const appointments = await Promise.all(appointmentsPromises);
      // console.log(appointments);
      res({
        id,
        createdAt: moment(),
        lastUpdated: moment(),
        appointments,
      });
    } catch (err) {
      rej(err);
    }
  });
}
export default byPerson;
