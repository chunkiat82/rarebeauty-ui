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
  },
  async resolve(_obj, args) {
    const { id } = args;
    const item = await api({ action: 'getContact', resourceName: id });

    // console.log(item);
    return item;
  },
};

export default contact;
