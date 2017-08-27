import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

import EventType from '../types/EventType';
import TransactionType from '../types/TransactionType';
import { get } from '../database';

const AppointmentType = new ObjectType({
  name: 'Appointment',
  fields: {
    id: { type: StringType },
    event: {
      type: EventType,
      async resolve(obj /* , args*/) {
        if (obj.eventId) {
          const res = await get(`event:${obj.eventId}`);
          return res.value;
        }
        return obj.event;
      },
    },
    transaction: {
      type: TransactionType,
      async resolve(obj /* , args*/) {
        if (obj.transId) {
          const res = await get(`trans:${obj.transId}`);
          return res.value;
        }
        return obj.transaction;
      },
    },
    // transactions: { type: new ListType(StringType) },
    createdAt: { type: new NonNull(StringType) },
    lastUpdated: { type: new NonNull(StringType) },
  },
});

export default AppointmentType;
