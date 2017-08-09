import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntegerType,
  GraphQLNonNull as NonNull,
  GraphQLList as ListType
} from 'graphql';

const AppointmentType = new ObjectType({
  name: 'Appointment',
  fields: {
    id: { type: new NonNull(StringType) },
    eventId: { type: new NonNull(StringType) },
    transId: { type: StringType },
    transactions: { type: new ListType(StringType) },
    createdAt: { type: new NonNull(StringType) },
    lastUpdated: { type: new NonNull(StringType) },
  }
});

export default AppointmentType;
