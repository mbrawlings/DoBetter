import Person from '../../db/models/person.js';
import GiftIdea from '../../db/models/giftIdea.js';
import Interaction from '../../db/models/interaction.js';
import { buildUpdateDoc } from './_updateDoc.js';

const MAX_IMPORT_BATCH = 500;

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
      buildUpdateDoc(input),
      { new: true }
    );
    return doc ? doc.toObject() : null;
  },
  async deletePerson(_, { id }, { orgId }) {
    const res = await Person.deleteOne({ _id: id, orgId });
    if (res.deletedCount !== 1) return false;
    await Promise.all([
      GiftIdea.deleteMany({ orgId, personId: id }),
      Interaction.deleteMany({ orgId, personId: id }),
    ]);
    return true;
  },
  async importContacts(_, { contacts }, { orgId }) {
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return { createdCount: 0, skippedCount: 0, created: [] };
    }
    if (contacts.length > MAX_IMPORT_BATCH) {
      throw new Error(`Too many contacts in one import (max ${MAX_IMPORT_BATCH}).`);
    }

    // De-dup within the incoming batch, keeping the first occurrence per contactId.
    const byContactId = new Map();
    for (const c of contacts) {
      if (c?.contactId && !byContactId.has(c.contactId)) {
        byContactId.set(c.contactId, c);
      }
    }
    const requestedIds = [...byContactId.keys()];

    // Skip any contactId already imported for this org.
    const existing = await Person.find({
      orgId,
      contactIds: { $in: requestedIds },
    })
      .select('contactIds')
      .lean();
    const existingIds = new Set(existing.flatMap((p) => p.contactIds ?? []));

    const docs = [];
    for (const [contactId, c] of byContactId) {
      if (existingIds.has(contactId)) continue;
      docs.push({
        orgId,
        firstName: c.firstName,
        lastName: c.lastName,
        birthDate: c.birthDate ?? undefined,
        contactIds: [contactId],
      });
    }

    const created = docs.length ? await Person.insertMany(docs) : [];
    return {
      createdCount: created.length,
      skippedCount: requestedIds.length - created.length,
      created: created.map((d) => d.toObject()),
    };
  },
};

export default { Query, Mutation };

