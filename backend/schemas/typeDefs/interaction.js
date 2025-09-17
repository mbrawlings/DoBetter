export default `#graphql
  type Interaction {
    id: ID!
    orgId: ID!
    personId: ID!
    date: Date
    channel: String
    location: String
    summary: String!
    talkingPoints: [String!]
    sentiment: Int
    followUps: [FollowUp!]
    attachments: [Attachment!]
    createdAt: Date
    updatedAt: Date
  }

  type FollowUp {
    text: String
    dueAt: Date
    done: Boolean
  }

  type Attachment {
    type: String
    uri: String
  }

  input InteractionInput {
    personId: ID!
    date: Date
    channel: String
    location: String
    summary: String!
    talkingPoints: [String!]
    sentiment: Int
  }

  input InteractionUpdateInput {
    date: Date
    channel: String
    location: String
    summary: String
    talkingPoints: [String!]
    sentiment: Int
  }

  extend type Query {
    interactions(personId: ID!): [Interaction!]!
  }

  extend type Mutation {
    createInteraction(input: InteractionInput!): Interaction!
    updateInteraction(id: ID!, input: InteractionUpdateInput!): Interaction!
    deleteInteraction(id: ID!): Boolean!
  }
`;
