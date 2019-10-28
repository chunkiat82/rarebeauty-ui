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
  GraphQLNonNull as NonNull,
} from 'graphql';

const ContactType = new ObjectType({
  name: 'Contact',
  fields: {
    name: {
      type: new NonNull(StringType),
      async resolve(obj /* , args */) {
        // console.log(obj);
        const selectedObj = (obj.names && obj.names[0]) || null;

        if (selectedObj === null) return obj.name;
        return selectedObj.displayName || selectedObj.givenName;
      },
    },
    display: {
      type: new NonNull(StringType),
      async resolve(obj /* , args */) {
        // console.log(obj);
        const selectedObj = (obj.names && obj.names[0]) || null;

        if (selectedObj === null) return obj.display;
        return selectedObj.displayName || selectedObj.givenName;
      },
    },
    mobile: {
      type: new NonNull(StringType),
      async resolve(obj /* , args */) {
        // console.log(obj);
        let selectedObj =
          (obj.phoneNumbers &&
            obj.phoneNumbers.filter(x => x.type === 'mobile')[0]) ||
          null;
        if (selectedObj === null)
          selectedObj =
            (obj.phoneNumbers &&
              obj.phoneNumbers.filter(x => x.type === 'other')[0]) ||
            null;
        if (selectedObj === null) return obj.mobile;
        return selectedObj.value || selectedObj.canonicalForm;
      },
    },
    resourceName: { type: StringType },
  },
});

export default ContactType;
