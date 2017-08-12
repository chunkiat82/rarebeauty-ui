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
  GraphQLList as ListType,
} from 'graphql';

import ItemType from './ItemType';

// "totalAmount": 85,
//     "services": 85,
//     "products": 0,
//     "discount": 0,
//     "additional": 0,
//     "createdAt": "2017-08-09T10:45:00+08:00"
const TransactionType = new ObjectType({
  name: 'Transaction',
  fields: {
    id: {
      type: new NonNull(StringType),
    },
    items: {
      type: new ListType(ItemType),
    },
    totalAmount: {
      type: new NonNull(FloatType),
    },
    service: {
      type: new NonNull(FloatType),
    },
    product: {
      type: new NonNull(FloatType),
    },
    discount: {
      type: new NonNull(FloatType),
    },
    additional: {
      type: new NonNull(FloatType),
    },
    createdAt: {
      type: new NonNull(StringType),
    },
  },
});

export default TransactionType;
