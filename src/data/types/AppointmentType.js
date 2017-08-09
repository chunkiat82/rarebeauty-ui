import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntegerType,
  GraphQLNonNull as NonNull,
} from 'graphql';

const AppointmentType = new ObjectType({
  name: 'Appointment',
  fields: {
    id: { type: new NonNull(StringType) },
    eventId: { type: new NonNull(StringType) },
    transactionId: { type: StringType }
  }
});

export default AppointmentType;
