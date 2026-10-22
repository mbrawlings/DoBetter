import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

const notificationDeliveries = new Schema(
  {
    userId: { type: Types.ObjectId, required: true },
    // personId:kind:occurrenceDate so each event sends once and next year is a new key.
    dedupeKey: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

notificationDeliveries.index({ userId: 1, dedupeKey: 1 }, { unique: true });
notificationDeliveries.index({ sentAt: 1 }, { expireAfterSeconds: 400 * 24 * 60 * 60 });

const NotificationDelivery = mongoose.model('NotificationDelivery', notificationDeliveries);

export default NotificationDelivery;
