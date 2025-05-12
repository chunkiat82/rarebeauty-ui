/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const {
  GraphQLSchema,
  GraphQLObjectType
} = require('graphql');

const me = require('./queries/me');
const contacts = require('./queries/contacts');
const contact = require('./queries/contact');
const event = require('./queries/event');
const events = require('./queries/events');
const appointment = require('./queries/appointment');
const person = require('./queries/person');
const services = require('./queries/services');
const slots = require('./queries/slots');

const mutations = require('./mutations/index');

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
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

module.exports = schema;
