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
    let finalResourceName = resourceName;
    // console.log(`services=${services}`);

    if (resourceName === '' || resourceName === undefined) {
      const firstLast = name.split(' ');
      const first = firstLast[0];
      const last = firstLast[1] || '';
      // console.log(`first=${first} last = ${last}`);
      const res = await api({
        action: 'createContact',
        first,
        last,
        mobile,
      });
      finalResourceName = res.resourceName;
    }

    // console.log(`finalResourceName=${finalResourceName}`);
    try {
      const services = serviceIds.map(item => mapOfServices[item]);
      const { event, uuid } = await api({
        action: 'createEvent',
        name,
        start,
        mobile,
        // these services sent in are objects
        services,
        duration,
        finalResourceName,
        // these are sent in as floats
        totalAmount,
        additional,
        discount,
      });
      const now = moment();
      await db.upsert(`appt:${uuid}`, {
        id: uuid,
        eventId: event.id,
        transId: uuid,
        createdAt: now,
        lastUpdated: now,
      });
      const transaction = createTransactionEntry(
        uuid,
        services,
        totalAmount,
        additional,
        discount,
        now,
      );
      await db.upsert(`trans:${uuid}`, transaction);
      console.log(`uuid=${uuid}`);
      console.log(`transaction=${JSON.stringify(transaction, null, 2)}`);
      return { id: uuid, event, transaction, createdAt: now, lastUpdated: now };
    } catch (err) {
      // console.log(err);
      throw err;
    }
  },
};

function createTransactionEntry(
  uuid,
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
    id: uuid,
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
