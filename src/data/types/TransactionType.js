const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull
} = require('graphql');

// Import ItemType instead of redefining it
const ItemType = require('./ItemType');

// "totalAmount": 85,
//     "services": 85,
//     "products": 0,
//     "discount": 0,
//     "additional": 0,
//     "createdAt": "2017-08-09T10:45:00+08:00"
const TransactionType = new GraphQLObjectType({
  name: 'Transaction',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    items: {
      type: new GraphQLList(ItemType),
    },
    totalAmount: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    service: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    product: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    discount: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    additional: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLString),
    },
    deposit: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
  },
});

module.exports = TransactionType;
