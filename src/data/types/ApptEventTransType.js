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

// n ame, mobile, resourceName, serviceIds, start, duration, totalAmount, additional, discount
const ApptEventTransType = new ObjectType({
  name: 'Event',
  fields: {
    id: {
      type: StringType,
      resolve(obj) {
        return obj.id;
      },
    },
    name: {
      type: new NonNull(StringType),
      resolve(obj) {
        return obj.attendees[0].displayName;
      },
    },
    mobile: {
      type: new NonNull(StringType),
      resolve(obj) {
        return obj.extendedProperties.shared.mobile;
      },
    },
    start: {
      type: new NonNull(StringType),
      resolve(obj) {
        return String(obj.start.dateTime);
      },
    },
    end: {
      type: new NonNull(StringType),
      resolve(obj) {
        return String(obj.end.dateTime);
      },
    },
    serviceIds: {
      type: new ListType(StringType),
      resolve(obj) {
        return obj.extendedProperties.shared.services.split(',');
      },
    },
  },
});

export default ApptEventTransType;
