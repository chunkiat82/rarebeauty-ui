/**
 /**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { GraphQLList as List } from 'graphql';
import EventType from '../types/EventType';
import api from '../../api';

const events = {
  type: new List(EventType),
  async resolve() {
    // items = await api({ action: 'listContacts' });
    return items;
  },
};

export default events;
