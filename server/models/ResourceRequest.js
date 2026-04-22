import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: { type: String }
  },
  { _id: false }
);

const resourceRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      required: true,
      enum: ['Food', 'Water', 'Shelter', 'Medical', 'Other']
    },
    quantity: { type: Number, required: true, min: 1 },
    location: { type: pointSchema, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'InProgress', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priority: { type: Number, min: 1, max: 5, default: 3 }
  },
  { timestamps: true }
);

resourceRequestSchema.index({ location: '2dsphere' });

export const ResourceRequest = mongoose.model('ResourceRequest', resourceRequestSchema);
