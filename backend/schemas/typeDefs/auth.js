export default `#graphql
  type User {
    id: ID!
    email: String!
    name: String
    emailVerified: Boolean!
    createdAt: Date
    updatedAt: Date
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type SignupPayload {
    email: String!
  }

  extend type Query {
    me: User
  }

  extend type Mutation {
    login(email: String!, password: String!): AuthPayload!
    signup(email: String!, password: String!, name: String): SignupPayload!
    verifyEmail(email: String!, code: String!): AuthPayload!
    resendVerificationEmail(email: String!): Boolean!
    updateMe(name: String): User!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
  }
`;
