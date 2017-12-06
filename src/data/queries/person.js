import { GraphQLString as StringType } from 'graphql';
import PersonType from '../types/PersonType';
import api from '../../api';

// hardcode for 3 now
const person = {
  type: PersonType,
  args: {
    id: { type: StringType },
    limit: { type: StringType },
  },
  async resolve(obj, args /* , context not used */) {
    // construct person
    // contruct events;
    const { id, limit } = args;
    // console.log(args);

    const getAppointmentsByPerson = await api({
      action: 'getAppointmentsByPerson',
      id,
      limit,
    });
    // console.log(getAppointmentsByPerson);
    return getAppointmentsByPerson;
  },
};

export default person;
