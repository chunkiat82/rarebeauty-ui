import { GraphQLString as StringType } from 'graphql';
import EventType from '../types/EventType';
import { get } from '../database';

const events = {
  type: EventType,
  args: {
    id: { type: StringType },
  },
  async resolve(_, args, context) {
    context.callingFunction = 'eventType';
    const event = await get(`event:${args.id}`, context);

    return event;
  },
};

export default events;
