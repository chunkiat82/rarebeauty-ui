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
  GraphQLInt as IntegerType,
  GraphQLNonNull as NonNull,
  GraphQLFloat as FloatType,
  GraphQLBoolean as BooleanType,
  // GraphQLList as ListType,
} from 'graphql';

const ServiceType = new ObjectType({
  name: 'Service',
  fields: {
    id: {
      type: new NonNull(StringType),
    },
    service: {
      type: new NonNull(StringType),
    },
    price: {
      type: new NonNull(FloatType),
    },
    followUp: {
      type: StringType,
    },
    count: {
      type: IntegerType,
      resolve(obj) {
        return obj.count || 1;
      },
    },
    duration: {
      type: new NonNull(IntegerType),
    },
    enabled: {
      type: BooleanType,
      resolve(obj) {
        return obj.enabled;
      },
    },
  },
});

export default ServiceType;
