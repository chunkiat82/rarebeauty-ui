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

const EventType = new ObjectType({
  name: 'Event',
  fields: {
    id: { 
      type: new NonNull(StringType),
      resolve(obj, args){
        return obj.id
      }
    },
    name: { 
      type: StringType
    },
    mobile: { 
      type: StringType
    },
    start: { 
      type: StringType
    },
    end: { 
      type: StringType
    },
    serviceIds: { 
      type: new ListType(StringType)
    }
  },
});

export default EventType;
