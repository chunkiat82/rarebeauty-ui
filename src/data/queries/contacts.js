/**
 /**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { GraphQLList as List, GraphQLString as StringType } from 'graphql';
// import fetch from 'isomorphic-fetch';
import ContactType from '../types/ContactType.js';
import api from '../../api/index.js';

const contacts = {
  type: new List(ContactType),
  args: {
    nameQuery: { type: StringType },
  },
  async resolve(_, args, context) {
    const { nameQuery } = args;

    // If nameQuery is provided, use searchContacts
    if (nameQuery) {
      return api({ action: 'searchContacts', query: nameQuery, context });
    }

    // Otherwise, return all contacts
    return api({ action: 'listContacts', context });
  },
};

export default contacts;
