export default `#graphql
  type Asset {
    id: ID!
    orgId: ID!
    name: String!
    realm: String!
    parentId: ID
    note: String
    favorite: Boolean!
    createdAt: Date
    updatedAt: Date
  }

  input AssetInput {
    name: String!
    realm: String
    parentId: ID
    note: String
    favorite: Boolean
  }

  input AssetUpdateInput {
    name: String
    realm: String
    parentId: ID
    note: String
    favorite: Boolean
  }

  extend type Query {
    assets: [Asset!]!
    asset(id: ID!): Asset
  }

  extend type Mutation {
    createAsset(input: AssetInput!): Asset!
    updateAsset(id: ID!, input: AssetUpdateInput!): Asset!
    deleteAsset(id: ID!): Boolean!
  }
`;
