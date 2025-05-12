/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLBoolean
} = require('graphql');

const ServiceType = new GraphQLObjectType({
  name: 'Service',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    service: {
      type: new GraphQLNonNull(GraphQLString),
    },
    price: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    followUp: {
      type: GraphQLString,
    },
    count: {
      type: GraphQLInt,
      resolve(obj) {
        return obj.count || 1;
      },
    },
    duration: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    enabled: {
      type: GraphQLBoolean,
      resolve(obj) {
        return obj.enabled;
      },
    },
  },
});

module.exports = ServiceType;
