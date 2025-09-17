// db/models/Person.js
import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const persons = new Schema(
  {
    orgId: { type: Types.ObjectId, index: true, required: true }, // or userId for solo use
    firstName: { type: String, index: true, required: true },
    lastName: { type: String, index: true, required: true },
    birthDate: Date,
    contactIds: [String], // OS contact record ids
    relationship: { type: String, enum: ['spouse','sibling','parent','child','friend','colleague','other'] },
    howWeMet: String,
    anniversaryDate: Date,

    city: String,
    employer: String,
    workRole: String,

    interests: { type: [String], index: true },
    favorites: {
      foods: [String],
      musicArtists: [String],
      books: [String],
      sportsTeams: [String],
      coffeeOrder: String,
    },
    allergies: [String],
    dietaryRestrictions: [String],
    sizes: { shirt: String, pants: String, shoes: String },
    brandsLiked: [String],
    wishlistLinks: [String],

    currentEvents: [String],
    upcomingEvents: [{ title: String, date: Date, notes: String }],

    pinnedNotes: [String],
    lastContactedAt: Date,

    meta: {
      isDeleted: { type: Boolean, default: false, index: true },
    },
  },
  { timestamps: true }
);

// helpful for name search
persons.index({ firstName: 'text', lastName: 'text', interests: 'text', city: 'text', employer: 'text' });
// a “due for check-in” index
persons.index({ orgId: 1, lastContactedAt: 1, communicationCadenceDays: 1, importance: 1 });

const Person = mongoose.model('Person', persons);

export default Person;