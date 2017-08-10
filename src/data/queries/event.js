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
  type: new ListType(EventType),
  args: {
    id: { type: StringType},
  },
  async resolve(obj, args) {
    // if (args.id) {
    //   console.log(`args=${args}`);
    //   const event = await queryEvent(id[0]);
    //   return [event];
    // }
    // console.log(`args=${args}`);
    return [{id:'a',  name:'h', mobile:'12341234', start:moment(), end:moment()}];
  },
};

function queryEvent(id) {
  return api({ action: 'getEvent', eventId: id });
}

export default events;
