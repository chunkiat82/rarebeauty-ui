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
} from 'graphql';
import EventType from '../types/EventType';
import api from '../../api';

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
          type: StringType,
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
        // console.log(`resourceName=${resourceName}`);

        if (resourceName === '') {
          const firstLast = name.split(' ');
          const first = firstLast[0];
          const last = firstLast[1] || '';
          // console.log('first=${first} last = ${last}');
          const res = await api({
            action: 'contactCreate',
            first,
            last,
            mobile,
          });
          finalResourceName = res.resourceName;
        }

        // console.log(`finalResourceName=${finalResourceName}`);

        await api({
          action: 'calendarCreate',
          name,
          start,
          mobile,
          services,
          duration,
          finalResourceName,
        });
        return { name, start, mobile, services, duration, resourceName };
      },
    },
  }),
});

export default MutationEvent;
