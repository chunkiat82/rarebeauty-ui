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
  GraphQLBoolean as BooleanType,
  GraphQLList as ListType,
} from 'graphql';

const EventType = new ObjectType({
  name: 'Event',
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
    resourceName: {
      type: new NonNull(StringType),
      resolve(obj) {
        return obj.extendedProperties.shared.resourceName;
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
    created: {
      type: new NonNull(StringType),
      resolve(obj) {
        return String(obj.created);
      },
    },
    serviceIds: {
      type: new ListType(StringType),
      resolve(obj) {
        return obj.extendedProperties.shared.services.split(',');
      },
    },
    apptId: {
      type: StringType,
      resolve(obj) {
        return obj.extendedProperties.shared.uuid;
      },
    },
    informed: {
      type: BooleanType,
      resolve(obj) {
        return obj.extendedProperties.shared.informed;
      },
    },
    confirmed: {
      type: StringType,
      resolve(obj) {
        return obj.extendedProperties.shared.confirmed;
      },
    },
    shortURL: {
      type: StringType,
      resolve(obj) {
        return obj.extendedProperties.shared.shortURL;
      },
    },
  },
});

export default EventType;
