const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean
} = require('graphql');

const EventType = require('../types/EventType');
const TransactionType = require('../types/TransactionType');
const { get } = require('../database');

const AppointmentType = new GraphQLObjectType({
  name: 'Appointment',
  fields: {
    id: {
      type: GraphQLString,
    },
    event: {
      type: EventType,
      async resolve(obj, _, context) {
        if (obj.eventId) {
          context.callingFunction = 'AppointmenType';
          const res = await get(`event:${obj.eventId}`, context);
          return res;
        }
        return obj.event;
      },
    },
    transaction: {
      type: TransactionType,
      async resolve(obj, _, context) {
        if (obj.transId) {
          const res = await get(`trans:${obj.transId}`, context);

          // fixing 2017 issues where there are no default deposit values
          if (!res.deposit) res.deposit = 0.0;
          return res;
        }
        return obj.transaction;
      },
    },
    // transactions: { type: new GraphQLList(GraphQLString) },
    createdNewContact: { type: new GraphQLNonNull(GraphQLBoolean) },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    lastUpdated: { type: new GraphQLNonNull(GraphQLString) },
  },
});

module.exports = AppointmentType;
