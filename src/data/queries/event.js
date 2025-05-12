/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const { GraphQLString } = require('graphql');
const EventType = require('../types/EventType');
const { get } = require('../database');

const events = {
  type: EventType,
  args: {
    id: { type: GraphQLString },
  },
  async resolve(_, args, context) {
    context.callingFunction = 'eventType';
    const event = await get(`event:${args.id}`, context);

    return event;
  },
};

module.exports = events;
