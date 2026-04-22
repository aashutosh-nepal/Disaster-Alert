import { asyncHandler } from '../utils/asyncHandler.js';
import { ResourceRequest } from '../models/ResourceRequest.js';
import { Task } from '../models/Task.js';
import { HttpError } from '../utils/httpError.js';
import { emitToRole, emitToUser } from '../config/socket.js';

export const createResourceRequest = asyncHandler(async (req, res) => {
  const { type, quantity, location } = req.body;
  if (!type || !quantity || !location?.coordinates) throw new HttpError(400, 'Missing required fields');

  const request = await ResourceRequest.create({
    userId: req.user._id,
    type,
    quantity,
    location
  });

  // Spec events
  emitToRole(req.app.get('io'), 'Volunteer', 'new_request', { request });
  emitToRole(req.app.get('io'), 'Admin', 'new_request', { request });

  // Back-compat (existing client listeners)
  emitToRole(req.app.get('io'), 'Volunteer', 'request:created', { request });
  emitToRole(req.app.get('io'), 'Admin', 'request:created', { request });

  res.status(201).json({ request });
});

export const listResourceRequests = asyncHandler(async (req, res) => {
  const { lng, lat, radiusKm } = req.query;
  const query = {};

  if (req.user.role === 'Citizen') query.userId = req.user._id;
  if (req.user.role === 'Volunteer') {
    // Volunteers: show unassigned/pending by default and optionally geo filtered.
    query.status = { $in: ['Pending', 'Accepted', 'InProgress'] };
  }

  if (lng && lat && radiusKm) {
    query.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(radiusKm) * 1000
      }
    };
  }

  const requests = await ResourceRequest.find(query)
    .populate('userId', 'name email role')
    .populate('assignedVolunteer', 'name email role')
    .sort({ priority: -1, createdAt: -1 });

  res.json({ requests });
});

export const volunteerAcceptRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await ResourceRequest.findById(id);
  if (!request) throw new HttpError(404, 'Request not found');
  if (request.assignedVolunteer) throw new HttpError(409, 'Request already assigned');

  request.assignedVolunteer = req.user._id;
  request.status = 'Accepted';
  await request.save();

  const task = await Task.create({ requestId: request._id, volunteerId: req.user._id, status: 'Accepted' });

  // Spec events
  emitToUser(req.app.get('io'), request.userId.toString(), 'request_accepted', {
    requestId: request._id,
    volunteerId: req.user._id,
    status: request.status
  });
  emitToUser(req.app.get('io'), request.userId.toString(), 'status_updated', {
    requestId: request._id,
    status: request.status
  });
  emitToRole(req.app.get('io'), 'Admin', 'request_accepted', { request });
  emitToRole(req.app.get('io'), 'Volunteer', 'request_accepted', { request });
  emitToRole(req.app.get('io'), 'Admin', 'status_updated', { requestId: request._id, status: request.status });

  // Back-compat
  emitToUser(req.app.get('io'), request.userId.toString(), 'request:statusChanged', {
    requestId: request._id,
    status: request.status
  });
  emitToRole(req.app.get('io'), 'Admin', 'request:updated', { request });

  res.json({ request, task });
});

export const updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const request = await ResourceRequest.findById(id);
  if (!request) throw new HttpError(404, 'Request not found');

  // Volunteer can update only assigned requests; admin can update any.
  if (req.user.role === 'Volunteer') {
    if (!request.assignedVolunteer || request.assignedVolunteer.toString() !== req.user._id.toString()) {
      throw new HttpError(403, 'Forbidden');
    }
  }

  request.status = status;
  await request.save();

  if (req.user.role === 'Volunteer') {
    await Task.findOneAndUpdate(
      { requestId: request._id, volunteerId: req.user._id },
      { status },
      { upsert: true, new: true }
    );
  }

  // Spec events
  emitToUser(req.app.get('io'), request.userId.toString(), 'request_accepted', {
    requestId: request._id,
    volunteerId: req.user._id,
    status: request.status
  });
  emitToUser(req.app.get('io'), request.userId.toString(), 'status_updated', {
    requestId: request._id,
    status: request.status
  });
  emitToRole(req.app.get('io'), 'Admin', 'request_accepted', { request });
  emitToRole(req.app.get('io'), 'Volunteer', 'request_accepted', { request });
  emitToRole(req.app.get('io'), 'Admin', 'status_updated', { requestId: request._id, status: request.status });

  // Back-compat
  emitToUser(req.app.get('io'), request.userId.toString(), 'request:statusChanged', {
    requestId: request._id,
    status: request.status
  });
  emitToRole(req.app.get('io'), 'Admin', 'request:updated', { request });

  res.json({ request });
});

export const adminSetPriority = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { priority } = req.body;

  const request = await ResourceRequest.findById(id);
  if (!request) throw new HttpError(404, 'Request not found');

  request.priority = priority;
  await request.save();

  emitToRole(req.app.get('io'), 'Admin', 'request:updated', { request });
  emitToRole(req.app.get('io'), 'Volunteer', 'request:updated', { request });

  res.json({ request });
});
