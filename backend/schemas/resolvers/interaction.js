import Interaction from '../../db/models/Interaction.js';

const Query = {
  async interactions(_, { personId }, { orgId }) {
    return Interaction.find({ orgId, personId }).sort({ date: -1, _id: 1 }).lean();
  },
};

const Mutation = {
  async createInteraction(_, { input }, { orgId }) {
    const doc = await Interaction.create({ ...input, orgId });
    return doc.toObject();
  },
};

export default { Query, Mutation };

