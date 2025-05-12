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

const ItemType = new GraphQLObjectType({
  name: 'Item',
  fields: {
    id: {
      type: new GraphQLNonNull(StringType),
    },
    type: {
      type: new GraphQLNonNull(StringType),
    },
    name: {
      type: new GraphQLNonNull(StringType),
    },
    price: {
      type: new GraphQLNonNull(FloatType),
    },
  },
});

module.exports = ItemType;
