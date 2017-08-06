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
} from 'graphql';
import EventType from '../types/EventType';
import api from '../../api';
import db from '../database';

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
        services: {
          type: new ListType(StringType),
        },
        duration: {
          type: IntegerType,
        },
        resourceName: {
          type: StringType,
        },
      },
      async resolve(
        value,
        { name, mobile, resourceName, services, start, duration },
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
          const event = await api({
            action: 'createCalendar',
            name,
            start,
            mobile,
            services,
            duration,
            finalResourceName,
          });
          // console.log(`event.id=${event.id}`);
        } catch (err) {
          // console.log(err);
          throw err;
        }
        return { name, start, mobile, services, duration, resourceName };
      },
    },
  }),
});

export default MutationEvent;
