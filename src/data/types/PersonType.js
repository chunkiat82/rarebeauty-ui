import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
  GraphQLList as ListType,
} from 'graphql';

import AppointmentType from './AppointmentType';
// import { get } from '../database';

const PersonType = new ObjectType({
  name: 'Person',
  fields: {
    id: { type: new NonNull(StringType) },
    cancelCount: { type: new NonNull(IntType) },
    appointments: { type: new ListType(AppointmentType) },
    createdAt: { type: new NonNull(StringType) },
    lastUpdated: { type: new NonNull(StringType) },
  },
});

export default PersonType;
