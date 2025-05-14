const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLList
} = require('graphql');

const EventStatusType = new GraphQLObjectType({
  name: 'EventStatus',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return obj.id;
      },
    },
    status: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return obj.status;
      },
    },
  },
});

module.exports = EventStatusType;
