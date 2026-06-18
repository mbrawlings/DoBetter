// schemas/resolvers.js
import { GraphQLScalarType, Kind } from 'graphql';
import auth from './resolvers/auth.js';
import person from './resolvers/person.js';
import interaction from './resolvers/interaction.js';
import giftIdea from './resolvers/giftIdea.js';

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

function toCalendarDate(value) {
  if (value == null) return null;
  if (value instanceof Date) {
    // Legacy docs stored a UTC-midnight Date; recover the intended day from UTC parts.
    const yyyy = value.getUTCFullYear();
    const mm = String(value.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(value.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  const str = String(value);
  if (YMD_RE.test(str)) return str;
  // Tolerate full ISO strings by taking the date portion.
  return str.split('T')[0];
}

function requireAuth(resolverMap) {
  return Object.fromEntries(
    Object.entries(resolverMap).map(([name, fn]) => [
      name,
      (parent, args, context, info) => {
        if (!context?.orgId) {
          throw new Error('Unauthorized');
        }
        return fn(parent, args, context, info);
      },
    ])
  );
}

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
  CalendarDate: new GraphQLScalarType({
    name: 'CalendarDate',
    serialize(value) {
      return toCalendarDate(value);
    },
    parseValue(value) {
      return toCalendarDate(value);
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return toCalendarDate(ast.value);
      }
      return null;
    },
  }),
  Query: {
    ...auth.Query,
    ...requireAuth({
      ...person.Query,
      ...interaction.Query,
      ...giftIdea.Query,
    }),
  },
  Mutation: {
    ...auth.Mutation,
    ...requireAuth({
      ...person.Mutation,
      ...interaction.Mutation,
      ...giftIdea.Mutation,
    }),
  },
  User: {
    id: (parent) => (parent.id ?? parent._id?.toString()),
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


