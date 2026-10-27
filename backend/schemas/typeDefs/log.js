export default `#graphql
  type LogMeter {
    unit: String!
    value: Float!
  }

  type Log {
    id: ID!
    orgId: ID!
    procedureId: ID!
    assetId: ID!
    date: CalendarDate!
    cost: Float
    note: String
    meter: LogMeter
    title: String!
    steps: [String!]!
    parts: [ProcedurePart!]!
    tools: [String!]!
    specs: [ProcedureSpec!]!
    createdAt: Date
    updatedAt: Date
  }

  input LogMeterInput {
    unit: String!
    value: Float!
  }

  input LogInput {
    procedureId: ID!
    date: CalendarDate!
    cost: Float
    note: String
    meter: LogMeterInput
  }

  input LogUpdateInput {
    date: CalendarDate!
    cost: Float
    note: String
    meter: LogMeterInput
  }

  extend type Query {
    logs(procedureId: ID!): [Log!]!
    logsForAssets(assetIds: [ID!]!): [Log!]!
    log(id: ID!): Log
  }

  extend type Mutation {
    createLog(input: LogInput!): Log!
    updateLog(id: ID!, input: LogUpdateInput!): Log!
    deleteLog(id: ID!): Boolean!
  }
`;
