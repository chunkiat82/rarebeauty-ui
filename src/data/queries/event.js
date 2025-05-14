const { GraphQLString } = require('graphql');
const EventType = require('../types/EventType');
const { get } = require('../database');

const events = {
  type: EventType,
  args: {
    id: { type: GraphQLString },
  },
  async resolve(_, args, context) {
    context.callingFunction = 'eventType';
    const event = await get(`event:${args.id}`, context);

    return event;
  },
};

module.exports = events;
