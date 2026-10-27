import mongoose from 'mongoose';
import Asset from '../../db/models/asset.js';
import Log from '../../db/models/log.js';
import Procedure from '../../db/models/procedure.js';

const { Types } = mongoose;

const TITLE_MAX = 200;
const LINE_MAX = 500;
const LIST_MAX = 100;

function assertId(id, message) {
  if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }
  const cast = String(new Types.ObjectId(id));
  if (cast !== id) throw new Error(message);
}

function cleanTitle(title) {
  const trimmed = typeof title === 'string' ? title.trim() : '';
  if (!trimmed) throw new Error('A job name is required.');
  if (trimmed.length > TITLE_MAX) throw new Error('Job name is too long.');
  return trimmed;
}

function cleanLines(lines, label) {
  if (lines == null) return [];
  if (!Array.isArray(lines)) throw new Error(`${label} must be a list.`);
  const cleaned = [];
  for (const line of lines) {
    if (typeof line !== 'string') continue;
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.length > LINE_MAX) throw new Error(`${label} line is too long.`);
    cleaned.push(trimmed);
  }
  if (cleaned.length > LIST_MAX) throw new Error(`Too many ${label.toLowerCase()}.`);
  return cleaned;
}

function cleanParts(parts) {
  if (parts == null) return [];
  if (!Array.isArray(parts)) throw new Error('Parts must be a list.');
  const cleaned = [];
  for (const part of parts) {
    const name = typeof part?.name === 'string' ? part.name.trim() : '';
    if (!name) continue;
    if (name.length > LINE_MAX) throw new Error('Part name is too long.');
    const quantity = typeof part?.quantity === 'string' ? part.quantity.trim() : '';
    if (quantity.length > LINE_MAX) throw new Error('Part quantity is too long.');
    cleaned.push(quantity ? { name, quantity } : { name });
  }
  if (cleaned.length > LIST_MAX) throw new Error('Too many parts.');
  return cleaned;
}

function cleanSpecs(specs) {
  if (specs == null) return [];
  if (!Array.isArray(specs)) throw new Error('Specs must be a list.');
  const cleaned = [];
  for (const spec of specs) {
    const label = typeof spec?.label === 'string' ? spec.label.trim() : '';
    const value = typeof spec?.value === 'string' ? spec.value.trim() : '';
    if (!label && !value) continue;
    if (!label || !value) throw new Error('Each spec needs a label and a value.');
    if (label.length > LINE_MAX || value.length > LINE_MAX) throw new Error('Spec is too long.');
    cleaned.push({ label, value });
  }
  if (cleaned.length > LIST_MAX) throw new Error('Too many specs.');
  return cleaned;
}

function documentFromInput(input) {
  return {
    title: cleanTitle(input.title),
    steps: cleanLines(input.steps, 'Steps'),
    parts: cleanParts(input.parts),
    tools: cleanLines(input.tools, 'Tools'),
    specs: cleanSpecs(input.specs),
  };
}

async function loadAsset(assetId, orgId) {
  assertId(assetId, 'Asset not found.');
  const asset = await Asset.findOne({ _id: assetId, orgId }).select('_id').lean();
  if (!asset) throw new Error('Asset not found.');
  return asset;
}

async function loadOwned(id, orgId) {
  assertId(id, 'Procedure not found.');
  const doc = await Procedure.findOne({ _id: id, orgId }).lean();
  if (!doc) throw new Error('Procedure not found.');
  return doc;
}

const Query = {
  async procedures(_, { assetId }, { orgId }) {
    await loadAsset(assetId, orgId);
    return Procedure.find({ orgId, assetId }).sort({ title: 1 }).lean();
  },
  async proceduresForAssets(_, { assetIds }, { orgId }) {
    if (!Array.isArray(assetIds) || assetIds.length === 0) return [];
    if (assetIds.length > 200) throw new Error('Too many assets.');
    for (const id of assetIds) assertId(id, 'Asset not found.');
    return Procedure.find({ orgId, assetId: { $in: assetIds } }).sort({ title: 1 }).lean();
  },
  async procedure(_, { id }, { orgId }) {
    assertId(id, 'Procedure not found.');
    return Procedure.findOne({ _id: id, orgId }).lean();
  },
};

const Mutation = {
  async createProcedure(_, { input }, { orgId }) {
    const asset = await loadAsset(input.assetId, orgId);
    const doc = await Procedure.create({
      orgId,
      assetId: asset._id,
      ...documentFromInput(input),
    });
    return doc.toObject();
  },

  async updateProcedure(_, { id, input }, { orgId }) {
    const existing = await loadOwned(id, orgId);
    const replacement = documentFromInput(input);
    const updated = await Procedure.findOneAndUpdate(
      { _id: existing._id, orgId },
      { $set: replacement },
      { new: true }
    ).lean();
    if (!updated) throw new Error('Procedure not found.');
    return updated;
  },

  async deleteProcedure(_, { id }, { orgId }) {
    const existing = await loadOwned(id, orgId);
    const res = await Procedure.deleteOne({ _id: existing._id, orgId });
    if (res.deletedCount !== 1) return false;
    await Log.deleteMany({ orgId, procedureId: existing._id });
    return true;
  },
};

export default { Query, Mutation };
