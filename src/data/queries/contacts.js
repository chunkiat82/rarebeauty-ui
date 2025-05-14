/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const { GraphQLList, GraphQLString, GraphQLBoolean } = require('graphql');
// const fetch = require('isomorphic-fetch');
const ContactType = require('../types/ContactType');
const api = require('../../api');
const db = require('../../utils/db');

const contacts = {
  type: new GraphQLList(ContactType),
  args: {
    nameQuery: { type: GraphQLString },
    forceRefresh: { type: GraphQLBoolean },
  },
  async resolve(_, args, context) {
    const { nameQuery, forceRefresh } = args;

    try {
      // If nameQuery is provided, use Google Contacts search via API
      if (nameQuery) {
        // Use Google API to search contacts
        const results = await api({
          action: 'searchContacts',
          query: nameQuery,
          context,
        });
        return results;
      }

      // Otherwise, return all contacts from Google API
      const results = await api({
        action: 'listContacts',
        forceRefresh,
        context,
      });
      return results;
    } catch (error) {
      console.error('Error fetching contacts from Google API:', error);
      
      // Fallback to database if Google API fails
      if (nameQuery) {
        return await db.searchContacts(nameQuery);
      }
      return await db.listContacts();
    }
  },
};

module.exports = contacts;
