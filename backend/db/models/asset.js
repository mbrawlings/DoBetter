import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const REALMS = ['home', 'vehicle', 'trailer'];

const assets = new Schema(
  {
    orgId: { type: Types.ObjectId, index: true, required: true },
    name: { type: String, required: true },
    realm: { type: String, enum: REALMS, required: true },
    parentId: { type: Types.ObjectId, ref: 'Asset', default: null },
    note: { type: String, maxlength: 4000 },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

assets.index({ orgId: 1, parentId: 1 });
assets.index({ orgId: 1, realm: 1 });
assets.index({ orgId: 1, favorite: 1 });

const Asset = mongoose.model('Asset', assets);

export default Asset;
