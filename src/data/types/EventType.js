const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLList
} = require('graphql');

const EventType = new GraphQLObjectType({
  name: 'Event',
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
    resourceName: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return obj.extendedProperties.shared.resourceName;
      },
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return obj.attendees[0].displayName;
      },
    },
    mobile: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return obj.extendedProperties.shared.mobile;
      },
    },
    start: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return String(obj.start.dateTime);
      },
    },
    end: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return String(obj.end.dateTime);
      },
    },
    created: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(obj) {
        return String(obj.created);
      },
    },
    serviceIds: {
      type: new GraphQLList(GraphQLString),
      resolve(obj) {
        return obj.extendedProperties.shared.services.split(',');
      },
    },
    apptId: {
      type: GraphQLString,
      resolve(obj) {
        return obj.extendedProperties.shared.uuid;
      },
    },
    informed: {
      type: GraphQLBoolean,
      resolve(obj) {
        return obj.extendedProperties.shared.informed;
      },
    },
    confirmed: {
      type: GraphQLString,
      resolve(obj) {
        return obj.extendedProperties.shared.confirmed;
      },
    },
    shortURL: {
      type: GraphQLString,
      resolve(obj) {
        return obj.extendedProperties.shared.shortURL;
      },
    },
  },
});

module.exports = EventType;
