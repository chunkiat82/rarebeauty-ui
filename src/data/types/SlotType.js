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
  GraphQLNonNull
} = require('graphql');

const FREE_TYPE = 'Free';

const SlotType = new GraphQLObjectType({
  name: 'Slot',
  fields: {
    start: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return obj.start;
      },
    },
    end: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return obj.end;
      },
    },
    durationInMinutes: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve(obj) {
        return obj.durationInMinutes;
      },
    },
    type: {
      type: new GraphQLNonNull(GraphQLString),
      resolve() {
        return FREE_TYPE;
      },
    },
    amp: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return obj.amp;
      },
    },
  },
});

module.exports = SlotType;
