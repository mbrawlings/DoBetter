// db/models/Interaction.js
import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const interactions = new Schema(
  {
    orgId: { type: Types.ObjectId, index: true, required: true },
    personId: { type: Types.ObjectId, ref: 'Person', index: true, required: true },
    date: { type: Date, index: true, default: () => new Date() },
    channel: { type: String, enum: ['irl','call','text','video','other'], default: 'irl' },
    location: String,
    summary: { type: String, required: true },
    talkingPoints: [String],
    sentiment: { type: Number, min: 1, max: 5 },
    followUps: [{ text: String, dueAt: Date, done: { type: Boolean, default: false } }],
    attachments: [{ type: { type: String, enum: ['photo','audio'] }, uri: String }],
  },
  { timestamps: true }
);

// fast queries per person, newest first
interactions.index({ orgId: 1, personId: 1, date: -1, _id: 1 });

const Interaction = mongoose.model('Interaction', interactions);

export default Interaction;