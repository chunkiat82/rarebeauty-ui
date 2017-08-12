import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntegerType,
  GraphQLNonNull as NonNull,
  GraphQLList as ListType,
} from 'graphql';

import EventType from '../types/EventType';
import TransactionType from '../types/TransactionType';

const AppointmentType = new ObjectType({
  name: 'Appointment',
  fields: {
    id: { type: new NonNull(StringType) },
    event: { type: new NonNull(EventType) },
    transaction: { type: TransactionType },
    // transactions: { type: new ListType(StringType) },
    createdAt: { type: new NonNull(StringType) },
    lastUpdated: { type: new NonNull(StringType) },
  },
});

export default AppointmentType;
