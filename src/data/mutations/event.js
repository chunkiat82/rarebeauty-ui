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
        start: {
          type: StringType,
        },
        name: {
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
        await api({
          action: 'calendarCreate',
          name,
          start,
          mobile,
          services,
          duration,
          resourceName,
        });
        return { name, start, mobile, services, duration, resourceName };
      },
    },
  }),
});

export default MutationEvent;
