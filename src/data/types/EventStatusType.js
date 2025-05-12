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
  GraphQLList
} = require('graphql');

const EventStatusType = new GraphQLObjectType({
  name: 'EventStatus',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return obj.id;
      },
    },
    status: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return obj.status;
      },
    },
  },
});

module.exports = EventStatusType;
