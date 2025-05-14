const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLBoolean
} = require('graphql');

const ServiceType = new GraphQLObjectType({
  name: 'Service',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    service: {
      type: new GraphQLNonNull(GraphQLString),
    },
    price: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    followUp: {
      type: GraphQLString,
    },
    count: {
      type: GraphQLInt,
      resolve(obj) {
        return obj.count || 1;
      },
    },
    duration: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    enabled: {
      type: GraphQLBoolean,
      resolve(obj) {
        return obj.enabled;
      },
    },
  },
});

module.exports = ServiceType;
