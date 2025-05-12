/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const { GraphQLList, GraphQLString } = require('graphql');
// const moment = require('moment');
const EventType = require('../types/EventType');
const api = require('../../api/index');

const events = {
  type: new GraphQLList(EventType),
  args: {
    id: { type: GraphQLString },
  },
  // parent, args, contextValue, info
  async resolve(_, args, context) {
    const response = await api({ action: 'listEvents', context, ...args });
    return response;
  },
};

module.exports = events;
