/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import me from './queries/me';
import news from './queries/news';
import contacts from './queries/contacts';
import contact from './queries/contact';
import event from './queries/event';
import events from './queries/events';
import appointment from './queries/appointment';
import person from './queries/person';
import services from './queries/services';
import slots from './queries/slots';

import mutations from './mutations';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      me,
      news,
      contacts,
      event,
      events,
      appointment,
      person,
      services,
      contact,
      slots,
    },
  }),
  mutation: mutations,
});

export default schema;
