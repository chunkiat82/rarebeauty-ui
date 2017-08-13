import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntegerType,
    GraphQLNonNull as NonNull,
    GraphQLList as ListType,
} from 'graphql';

import EventType from '../types/EventType';
import TransactionType from '../types/TransactionType';
import { get } from '../database';

const AppointmentType = new ObjectType({
    name: 'Appointment',
    fields: {
        id: { type: new NonNull(StringType) },
        event: {
            type: new NonNull(EventType),
            async resolve(obj, args) {                
                const res = await get(`event:${obj.eventId}`);                
                return res.value;
            }
        },
        transaction: {
            type: TransactionType,
            async resolve(obj, args) {
                const res = await get(`trans:${obj.transId}`);                
                return res.value;
            }
        },
        // transactions: { type: new ListType(StringType) },
        createdAt: { type: new NonNull(StringType) },
        lastUpdated: { type: new NonNull(StringType) },
    },
});

export default AppointmentType;
