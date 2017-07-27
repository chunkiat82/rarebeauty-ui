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
  GraphQLNonNull as NonNull,
} from 'graphql';
import EventType from './EventType';

const MutationEventType = new ObjectType({
  name: 'MutationEvent',
  fields: () => ({
    createEvent: {
      type: EventType,
      args: {
        name: {
          type: StringType,
        },
      },
      resolve(value, { name }) {
        console.log(name);
        return {
          name: 'Raymond',
          services: 'XXX',
          mobile: '99999999',
          duration: 75,
        };
      },
    },
  }),
});

// const EventType = new ObjectType({
//   name: 'Event',
//   fields: {
//     name: { type: new NonNull(StringType) },
//     mobile: { type: new NonNull(StringType) },
//     services: { type: StringType },
//     duration: { type: new NonNull(IntegerType) },
//   },
// });

// const TestSchema = new GraphQLSchema({
//   query: QueryRootType,
//   mutation: new GraphQLObjectType({
//     name: 'MutationRoot',
//     fields: {
//       writeTest: {
//         type: QueryRootType,
//         resolve: () => ({})
//       }
//     }
//   })
// });

// const QueryRootType = new GraphQLObjectType({
//   name: 'QueryRoot',
//   fields: {
//     test: {
//       type: GraphQLString,
//       args: {
//         who: {
//           type: GraphQLString
//         }
//       },
//       resolve: (root, { who }) => 'Hello ' + ((who: any) || 'World')
//     },
//     nonNullThrower: {
//       type: new GraphQLNonNull(GraphQLString),
//       resolve: () => { throw new Error('Throws!'); }
//     },
//     thrower: {
//       type: GraphQLString,
//       resolve: () => { throw new Error('Throws!'); }
//     },
//     context: {
//       type: GraphQLString,
//       resolve: (obj, args, context) => context,
//     },
//     contextDotFoo: {
//       type: GraphQLString,
//       resolve: (obj, args, context) => {
//         return (context: any).foo;
//       },
//     },
//   }

export default MutationEventType;
