// schemas/resolvers.js
import { GraphQLScalarType, Kind } from 'graphql';
import person from './resolvers/person.js';
import interaction from './resolvers/interaction.js';
import giftIdea from './resolvers/giftIdea.js';

const resolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    serialize(value) {
      const date = value instanceof Date ? value : new Date(value);
      return date.toISOString();
    },
    parseValue(value) {
      return new Date(value);
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
  Query: {
    ...person.Query,
    ...interaction.Query,
    ...giftIdea.Query,
  },
  Mutation: {
    ...person.Mutation,
    ...interaction.Mutation,
    ...giftIdea.Mutation,
  },
  Person: {
    id: (parent) => (parent.id ?? parent._id?.toString()),
    orgId: (parent) => (parent.orgId ? parent.orgId.toString() : null),
  },
  Interaction: {
    id: (parent) => (parent.id ?? parent._id?.toString()),
    orgId: (parent) => (parent.orgId ? parent.orgId.toString() : null),
    personId: (parent) => (parent.personId ? parent.personId.toString() : null),
  },
  GiftIdea: {
    id: (parent) => (parent.id ?? parent._id?.toString()),
    orgId: (parent) => (parent.orgId ? parent.orgId.toString() : null),
    personId: (parent) => (parent.personId ? parent.personId.toString() : null),
  },
};

export default resolvers;


