import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { authRateLimit } from '../middleware/security';
import { sanitizeInput } from '../middleware/validation';
import {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange
} from '../middleware/validation';

const router = Router();
const authController = new AuthController();

router.use(authRateLimit);

router.use(sanitizeInput);

router.post('/check-availability', authController.checkAvailability);

router.post('/register', validateRegistration, authController.register);

router.post('/login', validateLogin, authController.login);

router.post('/logout', authenticateToken, authController.logout);

router.get('/profile', authenticateToken, authController.getProfile);

router.put('/profile', authenticateToken, validateProfileUpdate, authController.updateProfile);

router.put('/password', authenticateToken, validatePasswordChange, authController.changePassword);

router.post('/refresh', authenticateToken, authController.refreshToken);

export default router;