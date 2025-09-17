// schemas/typeDefs.js
import base from './typeDefs/_base.js';
import person from './typeDefs/person.js';
import interaction from './typeDefs/interaction.js';
import giftIdea from './typeDefs/giftIdea.js';

const typeDefs = `#graphql
  ${base}
  ${person}
  ${interaction}
  ${giftIdea}
`;

export default typeDefs;


