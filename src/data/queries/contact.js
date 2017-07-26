/**
 /**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { GraphQLList as List } from 'graphql';
// import fetch from 'isomorphic-fetch';
import ContactItemType from '../types/ContactItemType';
import api from '../../api';

let items = [
  {
    name: 'Raymond',
    mobile: '93663631',
    resourceName: 'people/c9054502601102741848',
  },
];

const contacts = {
  type: new List(ContactItemType),
  async resolve() {
    items = await api({ action: 'listContacts' });
    return items;
  },
};

export default contacts;
