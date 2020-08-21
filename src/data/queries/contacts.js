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
import ContactType from '../types/ContactType';
import api from '../../api';

const contacts = {
  type: new List(ContactType),
  async resolve() {
    // console.log('graphql listContacts');

    const data = await api({ action: 'listContacts' });
    return data;
  },
};

export default contacts;
