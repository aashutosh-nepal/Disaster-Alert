import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import { HttpError } from '../utils/httpError.js';

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ users });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findById(id);
  if (!user) throw new HttpError(404, 'User not found');

  user.role = role;
  await user.save();

  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) throw new HttpError(404, 'User not found');

  await user.deleteOne();
  res.json({ message: 'User deleted' });
});
