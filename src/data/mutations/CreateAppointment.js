import {
  //   GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntegerType,
  GraphQLList as ListType,
  GraphQLFloat as FloatType,
} from 'graphql';
import moment from 'moment';
import AppointmentType from '../types/AppointmentType';
import api from '../../api';
import { upsert } from '../database';
import { mapOfServices, astListOfServices} from '../database/services';

function createTransactionEntry(
  uuid,
  entries,
  totalAmount,
  additional,
  discount,
  createdAt,
  apptDate,
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
    apptDate,
  };
  return entryTemplate;
}

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

    try {
      const services = serviceIds.map(serviceId => mapOfServices[serviceId]);

      services.map(service => astListOfServices.get(services.index));

      // get finalResourceName here
      const person = await api({
        action: 'getContact',
        resourceName: finalResourceName,
      });
      const userDefined = person && person.userDefined;

      let reminded = false;

      if (userDefined) {
        const validPhoneArray = userDefined.filter(
          obj => obj.key === 'validPhone',
        );
        // this is the business logic
        reminded = validPhoneArray[0].value === 'false';
      }

      const { event, uuid } = await api({
        action: 'createEvent',
        name,
        start,
        mobile,
        // these services sent in are objects
        services,
        duration,
        resourceName: finalResourceName,
        // these are sent in as floats
        totalAmount,
        additional,
        discount,
        reminded,
      });
      const now = moment();
      await upsert(`appt:${uuid}`, {
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
        moment(event.start.dateTime),
      );
      await upsert(`trans:${uuid}`, transaction);
      // console.log(`uuid=${uuid}`);
      // console.log(`transaction=${JSON.stringify(transaction, null, 2)}`);
      return { id: uuid, event, transaction, createdAt: now, lastUpdated: now };
    } catch (err) {
      // console.log(err);
      throw err;
    }
  },
};
