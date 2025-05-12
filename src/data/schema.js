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

import me from './queries/me.js';
import contacts from './queries/contacts.js';
import contact from './queries/contact.js';
import event from './queries/event.js';
import events from './queries/events.js';
import appointment from './queries/appointment.js';
import person from './queries/person.js';
import services from './queries/services.js';
import slots from './queries/slots.js';

import mutations from './mutations/index.js';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      me,
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
