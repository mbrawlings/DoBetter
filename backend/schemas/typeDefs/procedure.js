export default `#graphql
  type ProcedurePart {
    name: String!
    quantity: String
  }

  type ProcedureSpec {
    label: String!
    value: String!
  }

  type Procedure {
    id: ID!
    orgId: ID!
    assetId: ID!
    title: String!
    steps: [String!]!
    parts: [ProcedurePart!]!
    tools: [String!]!
    specs: [ProcedureSpec!]!
    createdAt: Date
    updatedAt: Date
  }

  input ProcedurePartInput {
    name: String!
    quantity: String
  }

  input ProcedureSpecInput {
    label: String!
    value: String!
  }

  input ProcedureInput {
    assetId: ID!
    title: String!
    steps: [String!]
    parts: [ProcedurePartInput!]
    tools: [String!]
    specs: [ProcedureSpecInput!]
  }

  input ProcedureUpdateInput {
    title: String!
    steps: [String!]!
    parts: [ProcedurePartInput!]!
    tools: [String!]!
    specs: [ProcedureSpecInput!]!
  }

  extend type Query {
    procedures(assetId: ID!): [Procedure!]!
    proceduresForAssets(assetIds: [ID!]!): [Procedure!]!
    procedure(id: ID!): Procedure
  }

  extend type Mutation {
    createProcedure(input: ProcedureInput!): Procedure!
    updateProcedure(id: ID!, input: ProcedureUpdateInput!): Procedure!
    deleteProcedure(id: ID!): Boolean!
  }
`;
