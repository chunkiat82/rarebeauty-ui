/**
 /**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { GraphQLList as ListType, GraphQLString as StringType } from 'graphql';
// import moment from 'moment';
import EventType from '../types/EventType';
import api from '../../api';

const events = {
  type: new ListType(EventType),
  args: {
    id: { type: StringType },
  },
  // parent, args, contextValue, info
  async resolve(_, args, context) {
    console.log('events resolve context', context);
    const response = await api({ action: 'listEvents', context, ...args });
    return response;
  },
};

export default events;
