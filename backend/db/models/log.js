import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const METER_UNITS = ['miles', 'hours'];

const meterSchema = new Schema(
  {
    unit: { type: String, enum: METER_UNITS, required: true },
    value: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const logs = new Schema(
  {
    orgId: { type: Types.ObjectId, index: true, required: true },
    procedureId: { type: Types.ObjectId, ref: 'Procedure', required: true },
    assetId: { type: Types.ObjectId, ref: 'Asset', required: true },
    date: { type: String, required: true },
    cost: { type: Number, default: null },
    note: { type: String, maxlength: 4000, default: null },
    meter: { type: meterSchema, default: null },
    title: { type: String, required: true, maxlength: 200 },
    steps: { type: [String], default: [] },
    parts: {
      type: [
        {
          _id: false,
          name: { type: String, required: true, maxlength: 500 },
          quantity: { type: String, maxlength: 500 },
        },
      ],
      default: [],
    },
    tools: { type: [String], default: [] },
    specs: {
      type: [
        {
          _id: false,
          label: { type: String, required: true, maxlength: 500 },
          value: { type: String, required: true, maxlength: 500 },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

logs.index({ orgId: 1, procedureId: 1, date: -1, _id: -1 });
logs.index({ orgId: 1, assetId: 1, date: -1, _id: -1 });

const Log = mongoose.model('Log', logs);

export default Log;
