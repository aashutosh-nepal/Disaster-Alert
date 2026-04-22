import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    },
    address: { type: String }
  },
  { _id: false }
);

const disasterReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: pointSchema, required: true },
    disasterType: {
      type: String,
      required: true,
      enum: ['Flood', 'Fire', 'Earthquake', 'Storm', 'Landslide', 'Other']
    },
    description: { type: String, required: true },
    severity: { type: Number, min: 1, max: 5, required: true },
    status: {
      type: String,
      enum: ['Open', 'Acknowledged', 'Resolved'],
      default: 'Open'
    },
    imageUrl: { type: String }
  },
  { timestamps: true }
);

disasterReportSchema.index({ location: '2dsphere' });

export const DisasterReport = mongoose.model('DisasterReport', disasterReportSchema);
