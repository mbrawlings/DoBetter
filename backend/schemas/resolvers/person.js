import Person from '../../db/models/Person.js';

const Query = {
  async persons(_, { filter }, { orgId }) {
    const query = { orgId };
    if (filter?.search) {
      query.$text = { $search: filter.search };
    }
    if (filter?.interest) {
      query.interests = filter.interest;
    }
    return Person.find(query).sort({ lastName: 1, firstName: 1 }).lean();
  },
  async person(_, { id }, { orgId }) {
    return Person.findOne({ _id: id, orgId }).lean();
  },
};

const Mutation = {
  async createPerson(_, { input }, { orgId }) {
    const doc = await Person.create({ ...input, orgId });
    return doc.toObject();
  },
  async updatePerson(_, { id, input }, { orgId }) {
    const doc = await Person.findOneAndUpdate(
      { _id: id, orgId },
      { $set: input },
      { new: true }
    );
    return doc ? doc.toObject() : null;
  },
  async deletePerson(_, { id }, { orgId }) {
    const res = await Person.deleteOne({ _id: id, orgId });
    return res.deletedCount === 1;
  },
};

export default { Query, Mutation };

