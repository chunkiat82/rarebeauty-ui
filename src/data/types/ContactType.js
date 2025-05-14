const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull
} = require('graphql');

const ContactType = new GraphQLObjectType({
  name: 'Contact',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      async resolve(obj /* , args */) {
        // console.log(obj);
        const selectedObj = (obj.names && obj.names[0]) || null;

        if (selectedObj === null) return obj.name;
        return selectedObj.displayName || selectedObj.givenName;
      },
    },
    display: {
      type: new GraphQLNonNull(GraphQLString),
      async resolve(obj /* , args */) {
        // console.log(obj);
        const selectedObj = (obj.names && obj.names[0]) || null;

        if (selectedObj === null) return obj.display;
        return selectedObj.displayName || selectedObj.givenName;
      },
    },
    mobile: {
      type: new GraphQLNonNull(GraphQLString),
      async resolve(obj /* , args */) {
        // console.log(obj);
        let selectedObj =
          (obj.phoneNumbers &&
            obj.phoneNumbers.filter(x => x.type === 'mobile')[0]) ||
          null;
        if (selectedObj === null)
          selectedObj =
            (obj.phoneNumbers &&
              obj.phoneNumbers.filter(x => x.type === 'home')[0]) ||
            null;
        if (selectedObj === null)
          selectedObj =
            (obj.phoneNumbers &&
              obj.phoneNumbers.filter(x => x.type === 'other')[0]) ||
            null;
        if (selectedObj === null) return obj.mobile;
        return selectedObj.canonicalForm || selectedObj.value || selectedObj;
      },
    },
    resourceName: { type: GraphQLString },
  },
});

module.exports = ContactType;
