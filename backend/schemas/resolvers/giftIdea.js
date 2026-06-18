import GiftIdea from '../../db/models/giftIdea.js';
import { touchPerson } from './_touchPerson.js';

const Query = {
  async giftIdeas(_, { personId }, { orgId }) {
    return GiftIdea.find({ orgId, personId }).sort({ priority: -1, createdAt: -1 }).lean();
  },
};

const Mutation = {
  async createGiftIdea(_, { input }, { orgId }) {
    const doc = await GiftIdea.create({ ...input, orgId });
    await touchPerson(input.personId, orgId);
    return doc.toObject();
  },
  async updateGiftIdea(_, { id, input }, { orgId }) {
    const doc = await GiftIdea.findOneAndUpdate(
      { _id: id, orgId },
      { $set: input },
      { new: true }
    );
    if (doc) await touchPerson(doc.personId, orgId);
    return doc ? doc.toObject() : null;
  },
  async deleteGiftIdea(_, { id }, { orgId }) {
    const doc = await GiftIdea.findOneAndDelete({ _id: id, orgId });
    if (doc) await touchPerson(doc.personId, orgId);
    return !!doc;
  },
};

export default { Query, Mutation };

