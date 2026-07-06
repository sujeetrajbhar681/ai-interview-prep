// routes/admin.js
import express from 'express';
import { protect }    from '../middleware/auth.js';
import { adminOnly }  from '../middleware/adminAuth.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPlatformStats,
  createUser,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require login + admin role
router.use(protect);
router.use(adminOnly);

router.get('/stats',        getPlatformStats);
router.get('/users',        getAllUsers);
router.post('/users',       createUser);
router.get('/users/:id',    getUserById);
router.put('/users/:id',    updateUser);
router.delete('/users/:id', deleteUser);

export default router;