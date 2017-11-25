import AST from 'auto-sorting-array';
import {
  GraphQLString as StringType,
  GraphQLInt as IntegerType,
  GraphQLList as ListType,
  GraphQLFloat as FloatType,
} from 'graphql';
import moment from 'moment';
import AppointmentType from '../types/AppointmentType';
import api from '../../api';
import { get, upsert } from '../database';

function createTransactionEntry(
  transId,
  entries,
  totalAmount,
  additional,
  discount,
  createdAt,
  apptDate,
  name,
  resourceName,
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
    apptDate,
    name,
    resourceName,
  };
  return entryTemplate;
}

export default {
  type: AppointmentType,
  args: {
    id: {
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
      const apptResponse = await get(`appt:${id}`);
      const { eventId, transId } = apptResponse.value;

      // console.log(`eventId=${eventId}`);
      // console.log(`transId=${transId}`);

      /* need to abstract this logic */
      const response = await get(`config:services`);
      const listOfServices = response.value.services;
      const astServices = new AST(listOfServices, 'id');

      const services = serviceIds.map(item => astServices.getByKey(item));

      // console.log(`services=${JSON.stringify(services, null ,2)}`);

      upsert(`config:services`, {
        services: astServices.getArray(),
      });

      const event = await api({
        action: 'patchEvent',
        eventId,
        apptId: id, // appointmentId
        transId,
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
      // console.log(`fullEvent:${JSON.stringify(event)}`);
      const now = moment();
      await upsert(`appt:${id}`, {
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
        moment(event.start.dateTime),
        name,
        resourceName,
      );
      await upsert(`trans:${transId}`, transaction);
      // console.log(`id=${id}`);
      // console.log(`transaction=${JSON.stringify(transaction, null, 2)}`);
      return { id, event, transaction, createdAt: now, lastUpdated: now };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
