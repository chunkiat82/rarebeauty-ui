/**
 /**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { GraphQLString as StringType } from 'graphql';
import EventType from '../types/EventType';
import { get } from '../database';

const events = {
  type: EventType,
  args: {
    id: { type: StringType },
  },
  async resolve(obj, args) {
    const event = await get(`event:${args.id}`);

    return event.value;
  },
};

export default events;
