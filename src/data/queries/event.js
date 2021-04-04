import { GraphQLList as ListType, GraphQLString as StringType } from 'graphql';
import moment from 'moment';
import EventType from '../types/EventType';
import { get } from '../database';

const events = {
  type: EventType,
  args: {
    id: { type: StringType },
  },
  async resolve(obj, args) {
    const event = await get(`event:${args.id}`);

    return event.value;
  },
};

function queryEvent(id) {
  return api({ action: 'getEvent', eventId: id });
}

export default events;
