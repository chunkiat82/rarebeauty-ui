/**
 /**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import {
  GraphQLList as ListType,
  GraphQLString as StringType
} from 'graphql';
import moment from 'moment';
import EventType from '../types/EventType';
import { get } from '../database';

const events = {
  type: EventType,
  args: {
    id: { type: StringType },
  },
  async resolve(obj, args) {
    // if (args.id) {
    // console.log(`args=${args}`);
    //   const event = await queryEvent(id[0]);
    //   return [event];
    // }/
    // console.log(`args=${args}`);
    // console.log(`event:${args.id}1`);
    const event = await get(`event:${args.id}`);
    // console.log(`event:${args.id}1`);
    // console.log(event);
    return event.value;
  },
};

function queryEvent(id) {
  return api({ action: 'getEvent', eventId: id });
}

export default events;
