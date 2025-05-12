/**
 /**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { GraphQLString as StringType } from 'graphql';
// import fetch from 'isomorphic-fetch';
import ContactType from '../types/ContactType';
import api from '../../api';

const contact = {
  type: ContactType,
  args: {
    id: { type: StringType },
    nameQuery: { type: StringType },
  },
  async resolve(_, args, context) {
    const { id, nameQuery } = args;

    // If nameQuery is provided, use searchContacts
    if (nameQuery) {
      // Use the searchContacts functionality to find contacts by name
      const items = await api({
        action: 'searchContacts',
        query: nameQuery,
        context,
      });

      // Return the best match (first result)
      if (items && items.length > 0) {
        return items[0];
      }
      return null;
    }

    // Existing functionality - search by resourceName
    const item = await api({ action: 'getContact', resourceName: id, context });
    return item;
  },
};

export default contact;
