import mongoose from 'mongoose';
import Log from '../../db/models/log.js';
import Procedure from '../../db/models/procedure.js';

const { Types } = mongoose;

const NOTE_MAX = 4000;
const COST_MAX = 10_000_000;
const METER_MAX = 100_000_000;
const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;
const METER_UNITS = new Set(['miles', 'hours']);

function assertId(id, message) {
  if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }
  const cast = String(new Types.ObjectId(id));
  if (cast !== id) throw new Error(message);
}

function cleanDate(date) {
  if (typeof date !== 'string' || !YMD_RE.test(date)) throw new Error('A date is required.');
  const [yyyy, mm, dd] = date.split('-').map(Number);
  const utc = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (utc.getUTCFullYear() !== yyyy || utc.getUTCMonth() !== mm - 1 || utc.getUTCDate() !== dd) {
    throw new Error('A date is required.');
  }
  return date;
}

function cleanCost(cost) {
  if (cost == null) return null;
  if (typeof cost !== 'number' || !Number.isFinite(cost)) throw new Error('Cost must be a number.');
  if (cost < 0) throw new Error('Cost cannot be negative.');
  const cents = Math.round(cost * 100);
  const dollars = cents / 100;
  if (dollars > COST_MAX) throw new Error('Cost is too large.');
  return dollars;
}

function cleanNote(note) {
  if (note == null) return null;
  if (typeof note !== 'string') throw new Error('Note must be text.');
  const trimmed = note.trim();
  if (trimmed.length > NOTE_MAX) throw new Error('Note is too long.');
  return trimmed.length ? trimmed : null;
}

function cleanMeter(meter) {
  if (meter == null) return null;
  if (!METER_UNITS.has(meter.unit)) throw new Error('A reading is miles or hours.');
  const value = meter.value;
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('A reading must be a number.');
  if (value < 0) throw new Error('A reading cannot be negative.');
  if (value > METER_MAX) throw new Error('A reading is too large.');
  return { unit: meter.unit, value: Math.round(value * 1000) / 1000 };
}

function detailsFromInput(input) {
  return {
    date: cleanDate(input.date),
    cost: cleanCost(input.cost),
    note: cleanNote(input.note),
    meter: cleanMeter(input.meter),
  };
}

function snapshotFrom(procedure) {
  return {
    title: procedure.title,
    steps: procedure.steps ?? [],
    parts: (procedure.parts ?? []).map((part) => (
      part.quantity ? { name: part.name, quantity: part.quantity } : { name: part.name }
    )),
    tools: procedure.tools ?? [],
    specs: (procedure.specs ?? []).map((spec) => ({ label: spec.label, value: spec.value })),
  };
}

async function loadProcedure(id, orgId) {
  assertId(id, 'Procedure not found.');
  const doc = await Procedure.findOne({ _id: id, orgId }).lean();
  if (!doc) throw new Error('Procedure not found.');
  return doc;
}

const Query = {
  async logs(_, { procedureId }, { orgId }) {
    await loadProcedure(procedureId, orgId);
    return Log.find({ orgId, procedureId }).sort({ date: -1, _id: -1 }).lean();
  },
  async logsForAssets(_, { assetIds }, { orgId }) {
    if (!Array.isArray(assetIds) || assetIds.length === 0) return [];
    if (assetIds.length > 200) throw new Error('Too many assets.');
    for (const id of assetIds) assertId(id, 'Asset not found.');
    return Log.find({ orgId, assetId: { $in: assetIds } }).sort({ date: -1, _id: -1 }).lean();
  },
  async log(_, { id }, { orgId }) {
    assertId(id, 'Log not found.');
    return Log.findOne({ _id: id, orgId }).lean();
  },
};

const Mutation = {
  async createLog(_, { input }, { orgId }) {
    const procedure = await loadProcedure(input.procedureId, orgId);
    const details = detailsFromInput(input);
    const doc = {
      orgId,
      procedureId: procedure._id,
      assetId: procedure.assetId,
      date: details.date,
      ...snapshotFrom(procedure),
    };
    if (details.cost != null) doc.cost = details.cost;
    if (details.note) doc.note = details.note;
    if (details.meter) doc.meter = details.meter;
    const created = await Log.create(doc);
    return created.toObject();
  },

  async updateLog(_, { id, input }, { orgId }) {
    assertId(id, 'Log not found.');
    const details = detailsFromInput(input);
    const $set = { date: details.date, cost: details.cost, note: details.note };
    const update = { $set };
    if (details.meter) $set.meter = details.meter;
    else update.$unset = { meter: '' };
    const updated = await Log.findOneAndUpdate(
      { _id: id, orgId },
      update,
      { new: true }
    ).lean();
    if (!updated) throw new Error('Log not found.');
    return updated;
  },

  async deleteLog(_, { id }, { orgId }) {
    assertId(id, 'Log not found.');
    const res = await Log.deleteOne({ _id: id, orgId });
    return res.deletedCount === 1;
  },
};

export default { Query, Mutation };
