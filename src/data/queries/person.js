const { GraphQLString } = require('graphql');
const PersonType = require('../types/PersonType');
const api = require('../../api/index');

// hardcode for 3 now
const person = {
  type: PersonType,
  args: {
    id: { type: GraphQLString },
    limit: { type: GraphQLString },
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

module.exports = person;
