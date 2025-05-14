const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLList
} = require('graphql');

const ItemType = new GraphQLObjectType({
  name: 'Item',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    type: {
      type: new GraphQLNonNull(GraphQLString),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    price: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    quantity: {
      type: GraphQLInt,
      resolve: (obj) => (obj.quantity !== undefined ? obj.quantity : 1),
    },
  },
});

module.exports = ItemType;
