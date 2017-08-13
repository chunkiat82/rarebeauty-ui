import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntegerType,
    GraphQLList as ListType,
    GraphQLFloat as FloatType,
} from 'graphql';
import moment from 'moment';
import AppointmentType from '../types/AppointmentType';
import api from '../../api';
import db from '../database';
import { mapOfServices } from '../database/services';

export default {
    type: AppointmentType,
    args: {
        id: {
            type: StringType,
        },
        eventId: {
            type: StringType,
        },
        transId: {
            type: StringType,
        },
        name: {
            type: StringType,
        },
        start: {
            type: StringType,
        },
        mobile: {
            type: StringType,
        },
        serviceIds: {
            type: new ListType(StringType),
        },
        duration: {
            type: IntegerType,
        },
        resourceName: {
            type: StringType,
        },
        totalAmount: {
            type: FloatType,
        },
        additional: {
            type: FloatType,
        },
        discount: {
            type: FloatType,
        },
    },
    async resolve(
        value,
        {
            id,
            eventId,
            transId,
            name,
            mobile,
            resourceName,
            serviceIds,
            start,
            duration,
            totalAmount,
            additional,
            discount,
        },
    ) {
        // [todo] - what if it's a mobile in the summary
        
        try {
            const services = serviceIds.map(item => mapOfServices[item]);
            const { event } = await api({
                action: 'patchEvent',           
                eventId,
                apptId: id, //appointmentId
                name,
                start,
                mobile,
                // these services sent in are objects
                services,
                duration,
                resourceName,
                // these are sent in as floats
                totalAmount,
                additional,
                discount,
            });
            const now = moment();
            await db.upsert(`appt:${id}`, {
                id,
                eventId,
                transId,
                createdAt: now,
                lastUpdated: now,
            });
            const transaction = createTransactionEntry(
                transId,
                services,
                totalAmount,
                additional,
                discount,
                now,
            );
            await db.upsert(`trans:${transId}`, transaction);
            // console.log(`id=${id}`);
            // console.log(`transaction=${JSON.stringify(transaction, null, 2)}`);
            return { id, event, transaction, createdAt: now, lastUpdated: now };
        } catch (err) {
            // console.log(err);
            throw err;
        }
    },
};

function createTransactionEntry(
    transId,
    entries,
    totalAmount,
    additional,
    discount,
    createdAt,
) {
    const items = entries.map(entry => ({
        id: entry.id,
        name: entry.service,
        type: 'service',
        price: entry.price,
    }));

    const service = entries.reduce((sum, entry) => sum + entry.price, 0);

    const entryTemplate = {
        id: transId,
        items,
        totalAmount,
        service,
        product: 0,
        additional,
        discount,
        createdAt,
    };
    return entryTemplate;
}