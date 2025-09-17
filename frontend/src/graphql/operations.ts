import { gql } from '@apollo/client';

export const PERSONS_QUERY = gql`
  query Persons($filter: PersonFilterInput) {
    persons(filter: $filter) {
      id
      firstName
      lastName
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
      city
      employer
      workRole
      interests
      currentEvents
      upcomingEvents { title date notes }
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


