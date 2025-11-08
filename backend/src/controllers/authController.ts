import { Request, Response } from 'express';
import { ClientModel } from '../models/Client';
import { generateTokenPair, hashPassword, comparePassword, JWTPayload } from '../utils/auth';
import { ClientRegistrationRequest, ClientLoginRequest } from '../types/database';

export class AuthController {
  private clientModel: ClientModel;

  constructor() {
    this.clientModel = new ClientModel();
  }

  /**
   * Register a new client
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const registrationData: ClientRegistrationRequest = req.body;

      // Check if username already exists
      const existingUsername = await this.clientModel.usernameExists(registrationData.username);
      if (existingUsername) {
        res.status(409).json({
          success: false,
          error: {
            code: 'USERNAME_EXISTS',
            message: 'Username already exists'
          }
        });
        return;
      }

      // Check if email already exists
      const existingEmail = await this.clientModel.emailExists(registrationData.email);
      if (existingEmail) {
        res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already exists'
          }
        });
        return;
      }

      // Create new client
      const clientId = await this.clientModel.createClient(registrationData);

      // Get the created client (without sensitive data)
      const clientProfile = await this.clientModel.getClientProfile(clientId);
      
      if (!clientProfile) {
        res.status(500).json({
          success: false,
          error: {
            code: 'REGISTRATION_FAILED',
            message: 'Failed to create client account'
          }
        });
        return;
      }

      // Generate tokens
      const tokenPayload: JWTPayload = {
        client_id: clientProfile.client_id,
        username: clientProfile.username,
        email: clientProfile.email,
        role: 'user' // New registrations are always regular users
      };

      const tokens = generateTokenPair(tokenPayload);

      res.status(201).json({
        success: true,
        message: 'Client registered successfully',
        data: {
          client: {
            ...clientProfile,
            role: 'user'
          },
          tokens
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error during registration'
        }
      });
    }
  };

  /**
   * Login client
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginData: ClientLoginRequest = req.body;

      // Validate login credentials
      const client = await this.clientModel.validateLogin(loginData);
      
      if (!client) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          }
        });
        return;
      }

      // Generate tokens with role
      const tokenPayload: JWTPayload = {
        client_id: client.client_id,
        username: client.username,
        email: client.email,
        role: client.role || 'user'
      };

      const tokens = generateTokenPair(tokenPayload);

      // Get client profile (without sensitive data)
      const clientProfile = await this.clientModel.getClientProfile(client.client_id);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          client: {
            ...clientProfile,
            role: client.role || 'user'
          },
          tokens,
          isAdmin: client.role === 'admin'
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error during login'
        }
      });
    }
  };

  /**
   * Get current client profile
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const clientProfile = await this.clientModel.getClientProfile(req.user.client_id);
      
      if (!clientProfile) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CLIENT_NOT_FOUND',
            message: 'Client profile not found'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          client: clientProfile
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while retrieving profile'
        }
      });
    }
  };

  /**
   * Update client profile
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const updateData = req.body;
      const clientId = req.user.client_id;

      // Remove fields that shouldn't be updated via this endpoint
      delete updateData.client_id;
      delete updateData.username;
      delete updateData.password;
      delete updateData.card_no;
      delete updateData.four_digit;
      delete updateData.payment_type;

      // Check if email is being updated and if it already exists
      if (updateData.email) {
        const existingClient = await this.clientModel.findByEmail(updateData.email);
        if (existingClient && existingClient.client_id !== clientId) {
          res.status(409).json({
            success: false,
            error: {
              code: 'EMAIL_EXISTS',
              message: 'Email already exists'
            }
          });
          return;
        }
      }

      // Update client profile
      const updateSuccess = await this.clientModel.updateClient(clientId, updateData);
      
      if (!updateSuccess) {
        res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update profile'
          }
        });
        return;
      }

      // Get updated profile
      const updatedProfile = await this.clientModel.getClientProfile(clientId);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          client: updatedProfile
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while updating profile'
        }
      });
    }
  };

  /**
   * Change password
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      const clientId = req.user.client_id;

      // Get current client data
      const client = await this.clientModel.findClientById(clientId);
      if (!client) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CLIENT_NOT_FOUND',
            message: 'Client not found'
          }
        });
        return;
      }

      // Verify current password
      const storedPassword = client.password.toString('utf8');
      const isCurrentPasswordValid = await comparePassword(currentPassword, storedPassword);
      
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CURRENT_PASSWORD',
            message: 'Current password is incorrect'
          }
        });
        return;
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      const updateSuccess = await this.clientModel.updateClient(clientId, {
        password: Buffer.from(hashedNewPassword, 'utf8')
      });

      if (!updateSuccess) {
        res.status(500).json({
          success: false,
          error: {
            code: 'PASSWORD_UPDATE_FAILED',
            message: 'Failed to update password'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while changing password'
        }
      });
    }
  };

  /**
   * Logout (client-side token invalidation)
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    // Since we're using stateless JWT tokens, logout is handled client-side
    // by removing the token from storage. This endpoint exists for consistency
    // and could be extended to implement token blacklisting if needed.
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  };

  /**
   * Refresh access token
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Valid refresh token required'
          }
        });
        return;
      }

      // Verify client still exists
      const client = await this.clientModel.findClientById(req.user.client_id);
      if (!client) {
        res.status(401).json({
          success: false,
          error: {
            code: 'CLIENT_NOT_FOUND',
            message: 'Client account no longer exists'
          }
        });
        return;
      }

      // Generate new tokens
      const tokenPayload: JWTPayload = {
        client_id: client.client_id,
        username: client.username,
        email: client.email,
        role: client.role || 'user'
      };

      const tokens = generateTokenPair(tokenPayload);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens
        }
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while refreshing token'
        }
      });
    }
  };
}