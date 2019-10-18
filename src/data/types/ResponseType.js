import {
  GraphQLObjectType as ObjectType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,
} from 'graphql';

const ResponseType = new ObjectType({
  name: 'Response',
  uniqueKey: 'id',
  fields: () => ({
    id: { type: new NonNull(StringType) },
    code: { type: IntType },
  }),
});

export default ResponseType;
