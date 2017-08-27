import moment from 'moment';
import { GraphQLString as StringType } from 'graphql';
import PersonType from '../types/PersonType';
import { query, get } from '../database';
import { get as getAppointment } from '../database/appointment';

// hardcode for 3 now
const person = {
  type: PersonType,
  args: {
    id: { type: StringType },
  },
  async resolve(obj, args /* , context not used */) {
    // construct person
    // contruct events;

    const key = `${args.id}`;
    const queryString = `select extendedProperties.shared.uuid from default event where extendedProperties.shared.resourceName='${key}' LIMIT 3`;
    const idObjs = await query(queryString);

    // need to get batch here instead
    const promises = [];
    idObjs.forEach(idObj => {
      const { uuid } = idObj;
      // console.log(`uuid=${uuid}`);
      promises[promises.length] = get(`appt:${uuid}`);
    });
    const uuidObjs = await Promise.all(promises);

    const appointments = [];
    uuidObjs.forEach(uuidObj => {
      // console.log(`obj.value.id=${obj.value.id}`);
      appointments[appointments.length] = getAppointment(uuidObj.value.id);
    });

    return {
      id: key,
      createdAt: moment(),
      lastUpdated: moment(),
      appointments,
    };
  },
};

export default person;
