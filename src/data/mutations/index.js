// https://medium.com/@HurricaneJames/graphql-mutations-fb3ad5ae73c4
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
  GraphQLList as ListType,
  GraphQLFloat as FloatType,
} from 'graphql';
import createAppointment from './CreateAppointment';
import updateAppointment from './UpdateAppointment';

const Mutation = new ObjectType({
  name: 'Mutation',
  fields: () => ({
    createAppointment,
    updateAppointment
  }),
});

export default Mutation;

// Sample TransactioNtry
// {
//     "id": transactionId,
//     "items": [
//       {
//         "itemId": 'service:4',
//         "name": 'Full Set - Dense',
//         "price": 60
//       },
//       {
//         "itemId": 'service:5',
//         "name": 'Eye Mask',
//         "price": 5
//       },
//       {
//         "itemId": 'service:18',
//         "name": 'Full Face Threading',
//         "price": 20
//       }
//     ],
//     "totalAmount": 85,
//     "services": 85,
//     "products": 0,
//     "discount": 0,
//     "additional": 0,
//     "createdAt": "2017-08-09T10:45:00+08:00"
//   };
