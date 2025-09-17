export default `#graphql
  type Person {
    id: ID!
    orgId: ID!
    firstName: String!
    lastName: String!
    birthDate: Date
    contactIds: [String!]
    relationship: String
    howWeMet: String
    anniversaryDate: Date

    city: String
    employer: String
    workRole: String

    interests: [String!]
    favorites: Favorites
    allergies: [String!]
    dietaryRestrictions: [String!]
    sizes: Sizes
    brandsLiked: [String!]
    wishlistLinks: [String!]

    currentEvents: [String!]
    upcomingEvents: [UpcomingEvent!]

    pinnedNotes: [String!]
    lastContactedAt: Date

    createdAt: Date
    updatedAt: Date
  }

  type Favorites {
    foods: [String!]
    musicArtists: [String!]
    books: [String!]
    sportsTeams: [String!]
    coffeeOrder: String
  }

  type Sizes {
    shirt: String
    pants: String
    shoes: String
  }

  type UpcomingEvent {
    title: String
    date: Date
    notes: String
  }

  input UpcomingEventInput {
    title: String
    date: Date
    notes: String
  }

  input PersonFilterInput {
    search: String
    interest: String
  }

  input PersonInput {
    firstName: String!
    lastName: String!
    birthDate: Date
    relationship: String
    city: String
    employer: String
    workRole: String
    interests: [String!]
    currentEvents: [String!]
    upcomingEvents: [UpcomingEventInput!]
  }

  extend type Query {
    persons(filter: PersonFilterInput): [Person!]!
    person(id: ID!): Person
  }

  extend type Mutation {
    createPerson(input: PersonInput!): Person!
    updatePerson(id: ID!, input: PersonInput!): Person!
    deletePerson(id: ID!): Boolean!
  }
`;
