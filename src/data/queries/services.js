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
  // GraphQLString as StringType
} from 'graphql';
import ServiceType from '../types/ServiceType.js';
import { get } from '../database.js';

const services = {
  type: new ListType(ServiceType),
  async resolve(_, _args, context) {
    const response = await get(`config:services`, context);
    const finalServices = response.services;
    return finalServices;
  },
};

export default services;
