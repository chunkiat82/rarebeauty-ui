import { GraphQLString as StringType } from 'graphql';
import PersonType from '../../types/PersonType';
import api from '../../../api';

// hardcode for 3 now
const person = {
  type: PersonType,
  args: {
    id: { type: StringType },
    limit: { type: StringType },
  },
  async resolve(_, args, context) {
    // construct person
    // contruct events;
    const { id, limit } = args;
    // console.log(args);

    const getAppointmentsByPerson = await api({
      action: 'getAppointmentsByPerson',
      id,
      limit,
      context,
    });
    // console.log(getAppointmentsByPerson);
    return getAppointmentsByPerson;
  },
};

export default person;
