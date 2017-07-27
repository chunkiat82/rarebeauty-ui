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

const EventType = new ObjectType({
  name: 'Event',
  fields: {
    name: { type: new NonNull(StringType) },
    mobile: { type: new NonNull(StringType) },
    services: { type: StringType },
    duration: { type: new NonNull(IntegerType) },
  },
});

export default EventType;
