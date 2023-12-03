import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
} from 'graphql';

import EventType from '../types/EventType';
import TransactionType from '../types/TransactionType';
import { get } from '../database';

const AppointmentType = new ObjectType({
  name: 'Appointment',
  fields: {
    id: {
      type: StringType,
    },
    event: {
      type: EventType,
      async resolve(obj /* , args */) {
        if (obj.eventId) {
          const res = await get(`event:${obj.eventId}`);
          return res;
        }
        return obj.event;
      },
    },
    transaction: {
      type: TransactionType,
      async resolve(obj /* , args */) {
        if (obj.transId) {
          const res = await get(`trans:${obj.transId}`);

          // fixing 2017 issues where there are no default deposit values
          if (!res.deposit) res.deposit = 0.0;
          return res;
        }
        return obj.transaction;
      },
    },
    // transactions: { type: new ListType(StringType) },
    createdNewContact: { type: new NonNull(BooleanType) },
    createdAt: { type: new NonNull(StringType) },
    lastUpdated: { type: new NonNull(StringType) },
  },
});

export default AppointmentType;
