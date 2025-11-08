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

// Apply rate limiting to all auth routes
router.use(authRateLimit);

// Apply input sanitization to all routes
router.use(sanitizeInput);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new client
 * @access  Public
 */
router.post('/register', validateRegistration, authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login client
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout client (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current client profile
 * @access  Private
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update client profile
 * @access  Private
 */
router.put('/profile', authenticateToken, validateProfileUpdate, authController.updateProfile);

/**
 * @route   PUT /api/v1/auth/password
 * @desc    Change client password
 * @access  Private
 */
router.put('/password', authenticateToken, validatePasswordChange, authController.changePassword);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Private (requires valid refresh token)
 */
router.post('/refresh', authenticateToken, authController.refreshToken);

export default router;