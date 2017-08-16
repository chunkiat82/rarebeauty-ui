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
import moment from 'moment';
import EventType from '../types/EventType';
import api from '../../api';

const events = {
  type: new ListType(EventType),
  args: {
    id: { type: StringType },
  },
  async resolve(obj, args) {
    const response = await queryEvents();
    return response;
  },
};

function queryEvents() {
  return api({ action: 'listEvents' });
}

export default events;
