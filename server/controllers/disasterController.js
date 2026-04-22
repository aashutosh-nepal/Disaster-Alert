import { asyncHandler } from '../utils/asyncHandler.js';
import { DisasterReport } from '../models/DisasterReport.js';
import { HttpError } from '../utils/httpError.js';
import { emitToRole } from '../config/socket.js';

export const createDisasterReport = asyncHandler(async (req, res) => {
  let { disasterType, description, severity, location } = req.body;

  // multipart/form-data sends nested objects as strings
  if (typeof location === 'string') {
    try {
      location = JSON.parse(location);
    } catch {
      throw new HttpError(400, 'Invalid location JSON');
    }
  }

  if (!disasterType || !description || !severity || !location?.coordinates) {
    throw new HttpError(400, 'Missing required fields');
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  const report = await DisasterReport.create({
    userId: req.user._id,
    disasterType,
    description,
    severity: Number(severity),
    location,
    imageUrl
  });

  emitToRole(req.app.get('io'), 'Volunteer', 'disaster:created', { report });
  emitToRole(req.app.get('io'), 'Admin', 'disaster:created', { report });

  res.status(201).json({ report });
});

export const listDisasterReports = asyncHandler(async (req, res) => {
  const { lng, lat, radiusKm } = req.query;
  const query = {};
  if (req.user.role === 'Citizen') query.userId = req.user._id;

  if (lng && lat && radiusKm) {
    query.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(radiusKm) * 1000
      }
    };
  }

  const reports = await DisasterReport.find(query)
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 });

  res.json({ reports });
});

export const updateDisasterStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const report = await DisasterReport.findById(id);
  if (!report) throw new HttpError(404, 'Report not found');

  report.status = status;
  await report.save();

  emitToRole(req.app.get('io'), 'Admin', 'disaster:updated', { report });
  res.json({ report });
});
