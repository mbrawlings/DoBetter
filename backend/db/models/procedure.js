import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const procedures = new Schema(
  {
    orgId: { type: Types.ObjectId, index: true, required: true },
    assetId: { type: Types.ObjectId, ref: 'Asset', required: true },
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

procedures.index({ orgId: 1, assetId: 1 });

const Procedure = mongoose.model('Procedure', procedures);

export default Procedure;
