/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const { GraphQLList, GraphQLString } = require('graphql');
// const fetch = require('isomorphic-fetch');
const ContactType = require('../types/ContactType');
const db = require('../../utils/db');

const contacts = {
  type: new GraphQLList(ContactType),
  args: {
    nameQuery: { type: GraphQLString },
  },
  async resolve(_, args) {
    const { nameQuery } = args;

    // If nameQuery is provided, use searchContacts
    if (nameQuery) {
      return await db.searchContacts(nameQuery);
    }

    // Otherwise, return all contacts
    return await db.listContacts();
  },
};

module.exports = contacts;
