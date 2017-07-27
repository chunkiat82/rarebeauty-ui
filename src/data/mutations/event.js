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

// medium.com/@HurricaneJames/graphql-mutations-fb3ad5ae73c4
const events = {
  type: EventMutationType,
  async resolve(request) {
    console.log('oh yeah!!!!!!!!!!!!!!');
    console.log(request);
    return [
      { name: 'Raymond', mobile: '93663631', services: 'XXX', duration: 75 },
    ];
  },
};

export default events;
