const {
  GraphQLString
} = require('graphql');
const moment = require('moment');
const EventStatusType = require('../types/EventStatusType');
const api = require('../../api/index');

module.exports = {
  type: EventStatusType,
  args: {
    id: {
      type: GraphQLString,
    },
    status: {
      type: GraphQLString,
    },
  },
  async resolve(_, args, context) {
    const { id, status } = args;
    try {
      await api({
        action: 'patchEvent',
        status: 'confirmed',
        eventId: id,
        confirmed: moment().format('lll'),
        context,
      });
      return { id, status };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
