// https://medium.com/@HurricaneJames/graphql-mutations-fb3ad5ae73c4
/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntegerType,
  GraphQLList as ListType,
  GraphQLFloat as FloatType
} from 'graphql';
import moment from 'moment';
import EventType from '../types/EventType';
import api from '../../api';
import db from '../database';
import { mapOfServices } from '../database/services';

const MutationEvent = new ObjectType({
  name: 'MutationEvent',
  fields: () => ({
    createEvent: {
      type: EventType,
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
          type: new ListType(StringType)
        },
        duration: {
          type: IntegerType
        },
        resourceName: {
          type: StringType
        },
        totalAmount: {
          type: FloatType
        },
        additional: {
          type: FloatType
        },
        discount: {
          type: FloatType
        }
      },
      async resolve(
        value,
        { name, mobile, resourceName, serviceIds, start, duration, totalAmount, additional, discount },
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
            totalAmount, additional, discount
          });
          const now = moment();
          await db.upsert(`appt:${uuid}`, { id: uuid, eventId: event.id, transId: uuid, createdAt: now, lastUpdated: now });

          await db.upsert(`trans:${uuid}`, createTransactionEntry(uuid, services, totalAmount, additional, discount, now));
          console.log(`uuid=${uuid}`);
          return { name, start, mobile, serviceIds, duration, resourceName, totalAmount, additional, discount };
        } catch (err) {
          // console.log(err);
          throw err;
        }
      },
    },
  }),
});

function createTransactionEntry(uuid, entries, totalAmount, additional, discount, createdAt) {

  const items = entries.map(entry => {
    return {
      "itemId": entry.id, "name": entry.service, "price": entry.price
    }
  });

  const services = entries.reduce((sum, entry) => sum + entry.price, 0);

  const entryTemplate = {
    "id": uuid,
    items,
    totalAmount,
    services: 0,
    products: 0,
    additional,
    discount,
    createdAt
  }
  return entryTemplate;
}

export default MutationEvent;

// Sample TransactioNtry
// {
//     "id": transactionId,
//     "items": [
//       {
//         "itemId": 'service:4',
//         "name": 'Full Set - Dense',
//         "price": 60
//       },
//       {
//         "itemId": 'service:5',
//         "name": 'Eye Mask',
//         "price": 5
//       },
//       {
//         "itemId": 'service:18',
//         "name": 'Full Face Threading',
//         "price": 20
//       }
//     ],
//     "totalAmount": 85,
//     "services": 85,
//     "products": 0,
//     "discount": 0,
//     "additional": 0,
//     "createdAt": "2017-08-09T10:45:00+08:00"
//   };
