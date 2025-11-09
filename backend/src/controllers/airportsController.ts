import { Request, Response } from 'express';
import { AirportModel } from '../models/Airport';

const airportModel = new AirportModel();

/**
 * Get all airports with optional filtering
 * @route GET /api/v1/airports
 * @access Public
 */
export const getAirports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { country, search } = req.query;
    
    let airports;
    
    // If country filter is provided
    if (country && typeof country === 'string') {
      airports = await airportModel.getAirportsByCountry(country);
    }
    // If search term is provided
    else if (search && typeof search === 'string') {
      airports = await airportModel.searchAirports(search, 100);
    }
    // Otherwise get all airports
    else {
      airports = await airportModel.getAllAirports();
    }
    
    res.json({
      success: true,
      data: airports,
      count: airports.length
    });
  } catch (error) {
    console.error('Error fetching airports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch airports',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
