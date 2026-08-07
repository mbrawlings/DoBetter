import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        emailVerified
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!, $name: String) {
    signup(email: $email, password: $password, name: $name) {
      email
    }
  }
`;

export const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($email: String!, $code: String!) {
    verifyEmail(email: $email, code: $code) {
      token
      user {
        id
        email
        name
        emailVerified
      }
    }
  }
`;

export const RESEND_VERIFICATION_MUTATION = gql`
  mutation ResendVerificationEmail($email: String!) {
    resendVerificationEmail(email: $email)
  }
`;

export const UPDATE_ME_MUTATION = gql`
  mutation UpdateMe($name: String) {
    updateMe(name: $name) {
      id
      email
      name
      emailVerified
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      emailVerified
    }
  }
`;

export const PERSONS_QUERY = gql`
  query Persons($filter: PersonFilterInput) {
    persons(filter: $filter) {
      id
      firstName
      lastName
      relationship
      city
      tags
      contactIds
      birthDate
      anniversaryDate
      upcomingEvents { title date startsAt notes }
      createdAt
      updatedAt
    }
  }
`;

export const PERSON_TAGS_QUERY = gql`
  query PersonTags {
    personTags
  }
`;

export const IMPORT_CONTACTS_MUTATION = gql`
  mutation ImportContacts($contacts: [ImportContactInput!]!) {
    importContacts(contacts: $contacts) {
      createdCount
      skippedCount
      created {
        id
        firstName
        lastName
      }
    }
  }
`;

export const CREATE_PERSON_MUTATION = gql`
  mutation CreatePerson($input: PersonInput!) {
    createPerson(input: $input) {
      id
      firstName
      lastName
    }
  }
`;

export const CREATE_GIFT_IDEA_MUTATION = gql`
  mutation CreateGiftIdea($input: GiftIdeaInput!) {
    createGiftIdea(input: $input) { id }
  }
`;

export const CREATE_INTERACTION_MUTATION = gql`
  mutation CreateInteraction($input: InteractionInput!) {
    createInteraction(input: $input) { id }
  }
`;

export const GET_PERSON_QUERY = gql`
  query Person($id: ID!) {
    person(id: $id) {
      id
      firstName
      lastName
      birthDate
      relationship
      background
      city
      employer
      workRole
      interests
      tags
      currentEvents
      upcomingEvents { title date startsAt notes }
    }
  }
`;

export const UPDATE_PERSON_MUTATION = gql`
  mutation UpdatePerson($id: ID!, $input: PersonInput!) {
    updatePerson(id: $id, input: $input) {
      id
      firstName
      lastName
    }
  }
`;

export const DELETE_PERSON_MUTATION = gql`
  mutation DeletePerson($id: ID!) { deletePerson(id: $id) }
`;

export const GIFT_IDEAS_QUERY = gql`
  query GiftIdeas($personId: ID!) { giftIdeas(personId: $personId) { id title notes occasion status priority createdAt } }
`;

export const INTERACTIONS_QUERY = gql`
  query Interactions($personId: ID!) { interactions(personId: $personId) { id date channel location summary } }
`;

export const UPDATE_GIFT_IDEA_MUTATION = gql`
  mutation UpdateGiftIdea($id: ID!, $input: GiftIdeaUpdateInput!) { updateGiftIdea(id: $id, input: $input) { id } }
`;

export const DELETE_GIFT_IDEA_MUTATION = gql`
  mutation DeleteGiftIdea($id: ID!) { deleteGiftIdea(id: $id) }
`;

export const UPDATE_INTERACTION_MUTATION = gql`
  mutation UpdateInteraction($id: ID!, $input: InteractionUpdateInput!) { updateInteraction(id: $id, input: $input) { id } }
`;

export const DELETE_INTERACTION_MUTATION = gql`
  mutation DeleteInteraction($id: ID!) { deleteInteraction(id: $id) }
`;


