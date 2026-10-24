// schemas/typeDefs.js
import base from './typeDefs/_base.js';
import auth from './typeDefs/auth.js';
import person from './typeDefs/person.js';
import interaction from './typeDefs/interaction.js';
import giftIdea from './typeDefs/giftIdea.js';
import asset from './typeDefs/asset.js';

const typeDefs = `#graphql
  ${base}
  ${auth}
  ${person}
  ${interaction}
  ${giftIdea}
  ${asset}
`;

export default typeDefs;


