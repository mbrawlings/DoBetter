// db/models/GiftIdea.js
import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const giftIdeas = new Schema(
  {
    orgId: { type: Types.ObjectId, index: true, required: true },
    personId: { type: Types.ObjectId, ref: 'Person', index: true, required: true },
    title: { type: String, required: true },
    notes: String,
    url: String,
    priceRange: String,
    occasion: { type: String, enum: ['birthday','holiday','anniversary','other'] },
    priority: { type: Number, min: 1, max: 3, default: 2 },
    status: { type: String, enum: ['idea','shortlist','purchased','gifted'], default: 'idea' },
    secret: { type: Boolean, default: false },
  },
  { timestamps: true }
);

giftIdeas.index({ orgId: 1, personId: 1, status: 1, priority: -1, createdAt: -1 });

const GiftIdea = mongoose.model('GiftIdea', giftIdeas);

export default GiftIdea;
