/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  // GraphQLInt as IntegerType,
  GraphQLNonNull as NonNull,
  // GraphQLFloat as FloatType,
  // GraphQLList as ListType,
} from 'graphql';

const EventStatusType = new ObjectType({
  name: 'EventStatus',
  fields: {
    id: {
      type: new NonNull(StringType),
      resolve(obj) {
        return obj.id;
      },
    },
    status: {
      type: new NonNull(StringType),
      resolve(obj) {
        return obj.status;
      },
    },
  },
});

export default EventStatusType;
