import { Response } from 'express';
import { BaggageModel } from '../models/Baggage';
import { PassengerModel } from '../models/Passenger';
import { CreateBaggage, BaggageStatus } from '../types/database';
import { AuthenticatedRequest } from '../middleware/auth';

const baggageModel = new BaggageModel();
const passengerModel = new PassengerModel();

export class BaggageController {
  async createBaggage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const baggageData: CreateBaggage = req.body;

      const validationErrors = baggageModel.validateBaggageData(baggageData);
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid baggage data',
            details: validationErrors
          }
        });
        return;
      }

      const passenger = await passengerModel.findPassengerById(baggageData.passenger_id);
      if (!passenger) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PASSENGER_NOT_FOUND',
            message: 'Passenger not found'
          }
        });
        return;
      }

      if (baggageData.tracking_no) {
        const exists = await baggageModel.trackingNumberExists(baggageData.tracking_no);
        if (exists) {
          res.status(409).json({
            success: false,
            error: {
              code: 'TRACKING_NUMBER_EXISTS',
              message: 'Tracking number already exists'
            }
          });
          return;
        }
      }

      const baggageId = await baggageModel.createBaggage(baggageData);

      const baggageDetails = await baggageModel.getBaggageDetails(baggageId);

      res.status(201).json({
        success: true,
        data: baggageDetails,
        message: 'Baggage record created successfully'
      });

    } catch (error) {
      console.error('Error creating baggage:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create baggage record'
        }
      });
    }
  }

  async updateBaggageStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const baggageId = parseInt(req.params.baggageId);
      const { status } = req.body;

      if (!baggageId || baggageId <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_BAGGAGE_ID',
            message: 'Valid baggage ID is required'
          }
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Status is required'
          }
        });
        return;
      }

      const validStatuses = Object.values(BaggageStatus);
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Status must be one of: ${validStatuses.join(', ')}`
          }
        });
        return;
      }

      const baggage = await baggageModel.findBaggageById(baggageId);
      if (!baggage) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BAGGAGE_NOT_FOUND',
            message: 'Baggage not found'
          }
        });
        return;
      }

      const updateSuccess = await baggageModel.updateBaggageStatus(baggageId, status);

      if (!updateSuccess) {
        res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update baggage status'
          }
        });
        return;
      }

      const updatedBaggage = await baggageModel.getBaggageDetails(baggageId);

      res.json({
        success: true,
        data: updatedBaggage,
        message: 'Baggage status updated successfully'
      });

    } catch (error) {
      console.error('Error updating baggage status:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update baggage status'
        }
      });
    }
  }

  async trackBaggage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { trackingNo } = req.params;

      if (!trackingNo || trackingNo.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TRACKING_NUMBER',
            message: 'Valid tracking number is required'
          }
        });
        return;
      }

      const baggageInfo = await baggageModel.trackBaggage(trackingNo);

      if (!baggageInfo) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BAGGAGE_NOT_FOUND',
            message: 'Baggage not found with the provided tracking number'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: baggageInfo,
        message: 'Baggage tracking information retrieved successfully'
      });

    } catch (error) {
      console.error('Error tracking baggage:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to track baggage'
        }
      });
    }
  }

  async getBaggageDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const baggageId = parseInt(req.params.baggageId);

      if (!baggageId || baggageId <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_BAGGAGE_ID',
            message: 'Valid baggage ID is required'
          }
        });
        return;
      }

      const baggageDetails = await baggageModel.getBaggageDetails(baggageId);

      if (!baggageDetails) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BAGGAGE_NOT_FOUND',
            message: 'Baggage not found'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: baggageDetails,
        message: 'Baggage details retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting baggage details:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve baggage details'
        }
      });
    }
  }

  async getBaggageByPassenger(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const passengerId = parseInt(req.params.passengerId);

      if (!passengerId || passengerId <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PASSENGER_ID',
            message: 'Valid passenger ID is required'
          }
        });
        return;
      }

      const passenger = await passengerModel.findPassengerById(passengerId);
      if (!passenger) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PASSENGER_NOT_FOUND',
            message: 'Passenger not found'
          }
        });
        return;
      }

      const baggageList = await baggageModel.getBaggageByPassenger(passengerId);

      res.json({
        success: true,
        data: baggageList,
        message: 'Passenger baggage retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting baggage by passenger:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve passenger baggage'
        }
      });
    }
  }

  async getBaggageByFlight(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const flightId = parseInt(req.params.flightId);

      if (!flightId || flightId <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FLIGHT_ID',
            message: 'Valid flight ID is required'
          }
        });
        return;
      }

      const baggageList = await baggageModel.getBaggageByFlight(flightId);

      res.json({
        success: true,
        data: baggageList,
        message: 'Flight baggage retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting baggage by flight:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve flight baggage'
        }
      });
    }
  }

  async getBaggageByStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const validStatuses = Object.values(BaggageStatus);
      if (!validStatuses.includes(status as BaggageStatus)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Status must be one of: ${validStatuses.join(', ')}`
          }
        });
        return;
      }

      const baggageList = await baggageModel.getBaggageByStatus(status as BaggageStatus, limit, offset);

      res.json({
        success: true,
        data: baggageList,
        pagination: {
          page,
          limit,
          total: baggageList.length
        },
        message: 'Baggage list retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting baggage by status:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve baggage by status'
        }
      });
    }
  }

  async searchBaggage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { query } = req.query;

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SEARCH_QUERY',
            message: 'Valid search query is required'
          }
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const baggageList = await baggageModel.searchBaggage(query, limit);

      res.json({
        success: true,
        data: baggageList,
        message: 'Baggage search completed successfully'
      });

    } catch (error) {
      console.error('Error searching baggage:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to search baggage'
        }
      });
    }
  }

  async getBaggageStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await baggageModel.getBaggageStats();

      res.json({
        success: true,
        data: stats,
        message: 'Baggage statistics retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting baggage statistics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve baggage statistics'
        }
      });
    }
  }

  async getLostBaggageReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 30;

      if (days <= 0 || days > 365) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DAYS_PARAMETER',
            message: 'Days parameter must be between 1 and 365'
          }
        });
        return;
      }

      const lostBaggage = await baggageModel.getLostBaggageReport(days);

      res.json({
        success: true,
        data: lostBaggage,
        message: 'Lost baggage report retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting lost baggage report:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve lost baggage report'
        }
      });
    }
  }

  async updateBaggageStatusByTracking(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { trackingNo } = req.params;
      const { status } = req.body;

      if (!trackingNo || trackingNo.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TRACKING_NUMBER',
            message: 'Valid tracking number is required'
          }
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Status is required'
          }
        });
        return;
      }

      const validStatuses = Object.values(BaggageStatus);
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Status must be one of: ${validStatuses.join(', ')}`
          }
        });
        return;
      }

      const baggage = await baggageModel.findByTrackingNumber(trackingNo);
      if (!baggage) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BAGGAGE_NOT_FOUND',
            message: 'Baggage not found with the provided tracking number'
          }
        });
        return;
      }

      const updateSuccess = await baggageModel.updateBaggageStatusByTracking(trackingNo, status);

      if (!updateSuccess) {
        res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update baggage status'
          }
        });
        return;
      }

      const updatedBaggage = await baggageModel.trackBaggage(trackingNo);

      res.json({
        success: true,
        data: updatedBaggage,
        message: 'Baggage status updated successfully'
      });

    } catch (error) {
      console.error('Error updating baggage status by tracking:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update baggage status'
        }
      });
    }
  }

  async deleteBaggage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const baggageId = parseInt(req.params.baggageId);

      if (!baggageId || baggageId <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_BAGGAGE_ID',
            message: 'Valid baggage ID is required'
          }
        });
        return;
      }

      const baggage = await baggageModel.findBaggageById(baggageId);
      if (!baggage) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BAGGAGE_NOT_FOUND',
            message: 'Baggage not found'
          }
        });
        return;
      }

      const deleteSuccess = await baggageModel.deleteBaggage(baggageId);

      if (!deleteSuccess) {
        res.status(500).json({
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: 'Failed to delete baggage record'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Baggage record deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting baggage:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete baggage record'
        }
      });
    }
  }
}

export default new BaggageController();
