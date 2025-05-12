const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');

const ResponseType = new GraphQLObjectType({
  name: 'Response',
  uniqueKey: 'id',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    code: { type: GraphQLInt },
  }),
});

module.exports = ResponseType;
