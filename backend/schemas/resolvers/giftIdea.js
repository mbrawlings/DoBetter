import GiftIdea from '../../db/models/GiftIdea.js';

const Query = {
  async giftIdeas(_, { personId }, { orgId }) {
    return GiftIdea.find({ orgId, personId }).sort({ priority: -1, createdAt: -1 }).lean();
  },
};

const Mutation = {
  async createGiftIdea(_, { input }, { orgId }) {
    const doc = await GiftIdea.create({ ...input, orgId });
    return doc.toObject();
  },
  async updateGiftIdea(_, { id, input }, { orgId }) {
    const doc = await GiftIdea.findOneAndUpdate(
      { _id: id, orgId },
      { $set: input },
      { new: true }
    );
    return doc ? doc.toObject() : null;
  },
  async deleteGiftIdea(_, { id }, { orgId }) {
    const res = await GiftIdea.deleteOne({ _id: id, orgId });
    return res.deletedCount === 1;
  },
};

export default { Query, Mutation };

