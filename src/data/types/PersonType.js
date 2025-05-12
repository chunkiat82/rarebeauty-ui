const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList
} = require('graphql');

const AppointmentType = require('./AppointmentType');
// const { get } = require('../database');

const PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    cancelCount: { type: new GraphQLNonNull(GraphQLInt) },
    appointments: { type: new GraphQLList(AppointmentType) },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    lastUpdated: { type: new GraphQLNonNull(GraphQLString) },
  },
});

module.exports = PersonType;
