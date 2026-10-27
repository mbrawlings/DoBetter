// schemas/typeDefs.js
import base from './typeDefs/_base.js';
import auth from './typeDefs/auth.js';
import person from './typeDefs/person.js';
import interaction from './typeDefs/interaction.js';
import giftIdea from './typeDefs/giftIdea.js';
import asset from './typeDefs/asset.js';
import procedure from './typeDefs/procedure.js';
import log from './typeDefs/log.js';

const typeDefs = `#graphql
  ${base}
  ${auth}
  ${person}
  ${interaction}
  ${giftIdea}
  ${asset}
  ${procedure}
  ${log}
`;

export default typeDefs;


