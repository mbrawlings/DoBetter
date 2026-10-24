import mongoose from 'mongoose';
import Asset from '../../db/models/asset.js';
import Procedure from '../../db/models/procedure.js';
import { buildUpdateDoc } from './_updateDoc.js';

const { Types } = mongoose;

const REALMS = new Set(['home', 'vehicle', 'trailer']);
const NOTE_MAX = 4000;

function assertId(id, message) {
  if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }
  const cast = String(new Types.ObjectId(id));
  if (cast !== id) throw new Error(message);
}

function assertRealm(realm) {
  if (!REALMS.has(realm)) {
    throw new Error('Realm must be home, vehicle, or trailer.');
  }
}

function cleanName(name) {
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (!trimmed) throw new Error('Name is required.');
  return trimmed;
}

function cleanNote(note) {
  if (typeof note !== 'string') throw new Error('Note must be text.');
  const trimmed = note.trim();
  if (trimmed.length > NOTE_MAX) throw new Error('Note is too long.');
  return trimmed.length ? trimmed : null;
}

async function loadOwned(id, orgId) {
  assertId(id, 'Asset not found.');
  const doc = await Asset.findOne({ _id: id, orgId }).lean();
  if (!doc) throw new Error('Asset not found.');
  return doc;
}

// Walk up from the proposed parent. A cycle is a parent that is the asset itself
// or one of its descendants. Returns the parent document.
async function resolveParent(parentId, orgId, assetId) {
  assertId(parentId, 'Parent not found.');
  if (assetId && String(parentId) === String(assetId)) {
    throw new Error('An asset cannot be its own parent.');
  }
  const parent = await Asset.findOne({ _id: parentId, orgId }).lean();
  if (!parent) throw new Error('Parent not found.');

  let current = parent.parentId;
  const seen = new Set([String(parent._id)]);
  while (current) {
    const key = String(current);
    if (assetId && key === String(assetId)) {
      throw new Error('An asset cannot be placed under one of its components.');
    }
    if (seen.has(key)) {
      throw new Error('An asset cannot be placed under one of its components.');
    }
    seen.add(key);
    const ancestor = await Asset.findOne({ _id: current, orgId }).select('parentId').lean();
    if (!ancestor) break;
    current = ancestor.parentId;
  }
  return parent;
}

async function cascadeRealm(rootId, realm, orgId) {
  let frontier = [rootId];
  const seen = new Set([String(rootId)]);
  while (frontier.length) {
    const children = await Asset.find({ orgId, parentId: { $in: frontier } }).select('_id').lean();
    const ids = [];
    for (const child of children) {
      const key = String(child._id);
      if (seen.has(key)) continue;
      seen.add(key);
      ids.push(child._id);
    }
    if (!ids.length) break;
    await Asset.updateMany({ _id: { $in: ids }, orgId }, { $set: { realm } });
    frontier = ids;
  }
}

const Query = {
  async assets(_, __, { orgId }) {
    return Asset.find({ orgId }).sort({ name: 1 }).lean();
  },
  async asset(_, { id }, { orgId }) {
    assertId(id, 'Asset not found.');
    return Asset.findOne({ _id: id, orgId }).lean();
  },
};

const Mutation = {
  async createAsset(_, { input }, { orgId }) {
    const name = cleanName(input.name);
    let realm;
    let parentId = null;
    if (input.parentId) {
      const parent = await resolveParent(input.parentId, orgId, null);
      realm = parent.realm;
      parentId = parent._id;
    } else {
      if (!input.realm) throw new Error('A realm is required.');
      assertRealm(input.realm);
      realm = input.realm;
    }

    const doc = {
      orgId,
      name,
      realm,
      parentId,
      favorite: Boolean(input.favorite),
    };
    if (input.note != null && input.note !== '') {
      const note = cleanNote(input.note);
      if (note) doc.note = note;
    }
    const created = await Asset.create(doc);
    return created.toObject();
  },

  async updateAsset(_, { id, input }, { orgId }) {
    const existing = await loadOwned(id, orgId);
    const normalized = {};

    if (input.name !== undefined) {
      if (input.name === null) throw new Error('Name is required.');
      normalized.name = cleanName(input.name);
    }

    if (input.note !== undefined) {
      normalized.note = input.note === null ? null : cleanNote(input.note);
    }

    if (input.favorite !== undefined && input.favorite !== null) {
      normalized.favorite = Boolean(input.favorite);
    }

    let nextRealm = existing.realm;
    if (input.parentId !== undefined) {
      if (input.parentId === null) {
        if (input.realm == null || input.realm === '') {
          throw new Error('A realm is required.');
        }
        assertRealm(input.realm);
        normalized.parentId = null;
        nextRealm = input.realm;
      } else {
        const parent = await resolveParent(input.parentId, orgId, existing._id);
        normalized.parentId = parent._id;
        nextRealm = parent.realm;
      }
    } else if (input.realm !== undefined && input.realm !== null && !existing.parentId) {
      assertRealm(input.realm);
      nextRealm = input.realm;
    }

    if (nextRealm !== existing.realm) {
      normalized.realm = nextRealm;
    }

    const update = buildUpdateDoc(normalized);
    let doc = existing;
    if (Object.keys(update).length) {
      const updated = await Asset.findOneAndUpdate(
        { _id: existing._id, orgId },
        update,
        { new: true }
      ).lean();
      if (!updated) throw new Error('Asset not found.');
      doc = updated;
    }

    if (nextRealm !== existing.realm) {
      await cascadeRealm(existing._id, nextRealm, orgId);
    }

    return doc;
  },

  async deleteAsset(_, { id }, { orgId }) {
    const existing = await loadOwned(id, orgId);
    const child = await Asset.exists({ orgId, parentId: existing._id });
    if (child) throw new Error('Move or delete its components first.');
    const res = await Asset.deleteOne({ _id: existing._id, orgId });
    if (res.deletedCount !== 1) return false;
    await Procedure.deleteMany({ orgId, assetId: existing._id });
    return true;
  },
};

export default { Query, Mutation };
