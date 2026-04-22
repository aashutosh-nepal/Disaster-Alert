import express from 'express';
import { deleteUser, getMe, listUsers, updateUserRole } from '../controllers/userController.js';
import { protect, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMe);

router.get('/', protect, requireRole('Admin'), listUsers);
router.patch('/:id/role', protect, requireRole('Admin'), updateUserRole);
router.delete('/:id', protect, requireRole('Admin'), deleteUser);

export default router;
