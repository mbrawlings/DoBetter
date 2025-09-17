export default `#graphql
  type GiftIdea {
    id: ID!
    orgId: ID!
    personId: ID!
    title: String!
    notes: String
    url: String
    priceRange: String
    occasion: String
    priority: Int
    status: String
    secret: Boolean
    createdAt: Date
    updatedAt: Date
  }

  input GiftIdeaInput {
    personId: ID!
    title: String!
    notes: String
    url: String
    priceRange: String
    occasion: String
    priority: Int
    status: String
    secret: Boolean
  }

  input GiftIdeaUpdateInput {
    title: String
    notes: String
    url: String
    priceRange: String
    occasion: String
    priority: Int
    status: String
    secret: Boolean
  }

  extend type Query {
    giftIdeas(personId: ID!): [GiftIdea!]!
  }

  extend type Mutation {
    createGiftIdea(input: GiftIdeaInput!): GiftIdea!
    updateGiftIdea(id: ID!, input: GiftIdeaUpdateInput!): GiftIdea!
    deleteGiftIdea(id: ID!): Boolean!
  }
`;
