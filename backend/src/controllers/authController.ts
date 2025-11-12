import { Request, Response } from 'express';
import { ClientModel } from '../models/Client';
import { generateTokenPair, hashPassword, comparePassword, JWTPayload } from '../utils/auth';
import { ClientRegistrationRequest, ClientLoginRequest } from '../types/database';

export class AuthController {
  private clientModel: ClientModel;

  constructor() {
    this.clientModel = new ClientModel();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const registrationData: ClientRegistrationRequest = req.body;

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

      const clientId = await this.clientModel.createClient(registrationData);

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

      const tokenPayload: JWTPayload = {
        client_id: clientProfile.client_id,
        username: clientProfile.username,
        email: clientProfile.email,
        role: 'user'
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

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginData: ClientLoginRequest = req.body;

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

      const tokenPayload: JWTPayload = {
        client_id: client.client_id,
        username: client.username,
        email: client.email,
        role: client.role || 'user'
      };

      const tokens = generateTokenPair(tokenPayload);

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

      delete updateData.client_id;
      delete updateData.username;
      delete updateData.password;
      delete updateData.card_no;
      delete updateData.four_digit;
      delete updateData.payment_type;

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

      const hashedNewPassword = await hashPassword(newPassword);

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

  logout = async (req: Request, res: Response): Promise<void> => {
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  };

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