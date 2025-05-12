/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const { GraphQLList, GraphQLString } = require('graphql');
const ServiceType = require('../types/ServiceType');
const { get } = require('../database');

const services = {
  type: new GraphQLList(ServiceType),
  async resolve(_, _args, context) {
    const response = await get(`config:services`, context);
    const finalServices = response.services;
    return finalServices;
  },
};

module.exports = services;
