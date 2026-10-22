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

  input PushSubscriptionInput {
    endpoint: String!
    p256dh: String!
    auth: String!
  }

  input NotificationSettingsInput {
    enabled: Boolean!
    leadDays: Int!
    hour: Int!
    minute: Int!
    timeZone: String!
  }

  extend type Query {
    me: User
    webPushPublicKey: String
  }

  extend type Mutation {
    login(email: String!, password: String!): AuthPayload!
    signup(email: String!, password: String!, name: String): SignupPayload!
    verifyEmail(email: String!, code: String!): AuthPayload!
    resendVerificationEmail(email: String!): Boolean!
    updateMe(name: String): User!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
    saveWebPushSubscription(subscription: PushSubscriptionInput!, settings: NotificationSettingsInput!): Boolean!
    removeWebPushSubscription(endpoint: String!): Boolean!
    updateNotificationSettings(settings: NotificationSettingsInput!): Boolean!
  }
`;
