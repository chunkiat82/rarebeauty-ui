const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql');

const FREE_TYPE = 'Free';

const SlotType = new GraphQLObjectType({
  name: 'Slot',
  fields: {
    start: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return obj.start;
      },
    },
    end: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return obj.end;
      },
    },
    durationInMinutes: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve(obj) {
        return obj.durationInMinutes;
      },
    },
    type: {
      type: new GraphQLNonNull(GraphQLString),
      resolve() {
        return FREE_TYPE;
      },
    },
    amp: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return obj.amp;
      },
    },
  },
});

module.exports = SlotType;
