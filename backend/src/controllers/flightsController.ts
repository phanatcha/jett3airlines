import { Request, Response } from 'express';
import { FlightModel } from '../models/Flight';
import { AirportModel } from '../models/Airport';
import { AirplaneModel } from '../models/Airplane';
import { SeatModel } from '../models/Seat';
import { FlightSearchRequest, ApiResponse } from '../types/database';

const flightModel = new FlightModel();
const airportModel = new AirportModel();
const airplaneModel = new AirplaneModel();
const seatModel = new SeatModel();

const createErrorResponse = (code: string, message: string, details?: string[]): ApiResponse => ({
  success: false,
  message,
  error: details ? `${code}: ${message} - Details: ${details.join(', ')}` : `${code}: ${message}`
});

export const searchFlights = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchParams: FlightSearchRequest = {
      depart_airport_id: req.query.depart_airport_id ? parseInt(req.query.depart_airport_id as string) : undefined,
      arrive_airport_id: req.query.arrive_airport_id ? parseInt(req.query.arrive_airport_id as string) : undefined,
      depart_date: req.query.depart_date as string,
      passengers: req.query.passengers ? parseInt(req.query.passengers as string) : 1,
      class: req.query.class as string
    };

    if (!searchParams.depart_airport_id || !searchParams.arrive_airport_id) {
      res.status(400).json(createErrorResponse('MISSING_PARAMETERS', 'Departure and arrival airport IDs are required'));
      return;
    }

    if (!searchParams.depart_date) {
      res.status(400).json(createErrorResponse('MISSING_PARAMETERS', 'Departure date is required'));
      return;
    }

    if (searchParams.depart_airport_id === searchParams.arrive_airport_id) {
      res.status(400).json(createErrorResponse('INVALID_ROUTE', 'Departure and arrival airports must be different'));
      return;
    }

    const [departureAirport, arrivalAirport] = await Promise.all([
      airportModel.findAirportById(searchParams.depart_airport_id),
      airportModel.findAirportById(searchParams.arrive_airport_id)
    ]);

    if (!departureAirport) {
      res.status(404).json(createErrorResponse('AIRPORT_NOT_FOUND', 'Departure airport not found'));
      return;
    }

    if (!arrivalAirport) {
      res.status(404).json(createErrorResponse('AIRPORT_NOT_FOUND', 'Arrival airport not found'));
      return;
    }

    const flights = await flightModel.searchFlights(searchParams);

    const filteredFlights = searchParams.passengers && searchParams.passengers > 1 
      ? flights.filter(flight => flight.available_seats >= searchParams.passengers!)
      : flights;

    const transformedFlights = filteredFlights.map((flight: any) => ({
      ...flight,
      depart_iata_code: flight.departure_iata,
      arrive_iata_code: flight.arrival_iata,
      depart_airport_name: flight.departure_airport,
      arrive_airport_name: flight.arrival_airport,
      depart_city_name: flight.departure_city,
      arrive_city_name: flight.arrival_city,
      airplane_model: flight.airplane_type
    }));

    res.json({
      success: true,
      data: transformedFlights,
      message: `Found ${transformedFlights.length} flights`,
      search_criteria: {
        departure_airport: departureAirport.airport_name,
        arrival_airport: arrivalAirport.airport_name,
        departure_date: searchParams.depart_date,
        passengers: searchParams.passengers
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Error searching flights:', error);
    res.status(500).json(createErrorResponse('SEARCH_ERROR', 'Failed to search flights'));
  }
};

export const getFlightDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const flightId = parseInt(req.params.id);

    if (isNaN(flightId) || flightId <= 0) {
      res.status(400).json(createErrorResponse('INVALID_FLIGHT_ID', 'Valid flight ID is required'));
      return;
    }

    const flightDetails = await flightModel.getFlightDetails(flightId);

    if (!flightDetails) {
      res.status(404).json(createErrorResponse('FLIGHT_NOT_FOUND', 'Flight not found'));
      return;
    }

    const transformedFlight = {
      ...flightDetails,
      depart_iata_code: (flightDetails as any).departure_iata,
      arrive_iata_code: (flightDetails as any).arrival_iata,
      depart_airport_name: (flightDetails as any).departure_airport,
      arrive_airport_name: (flightDetails as any).arrival_airport,
      depart_city_name: (flightDetails as any).departure_city,
      arrive_city_name: (flightDetails as any).arrival_city,
      airplane_model: (flightDetails as any).airplane_type
    };

    res.json({
      success: true,
      data: transformedFlight,
      message: 'Flight details retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error getting flight details:', error);
    res.status(500).json(createErrorResponse('FETCH_ERROR', 'Failed to retrieve flight details'));
  }
};

export const getFlightSeats = async (req: Request, res: Response): Promise<void> => {
  try {
    const flightId = parseInt(req.params.id);
    const seatClass = req.query.class as string;

    if (isNaN(flightId) || flightId <= 0) {
      res.status(400).json(createErrorResponse('INVALID_FLIGHT_ID', 'Valid flight ID is required'));
      return;
    }

    const flight = await flightModel.findFlightById(flightId);
    if (!flight) {
      res.status(404).json(createErrorResponse('FLIGHT_NOT_FOUND', 'Flight not found'));
      return;
    }

    const seats = await flightModel.getAvailableSeats(flightId, seatClass);

    const seatMap: Record<string, { available: any[]; booked: any[] }> = seats.reduce((acc: Record<string, { available: any[]; booked: any[] }>, seat: any) => {
      if (!acc[seat.class]) {
        acc[seat.class] = {
          available: [],
          booked: []
        };
      }
      
      if (seat.availability === 'available') {
        acc[seat.class].available.push(seat);
      } else {
        acc[seat.class].booked.push(seat);
      }
      
      return acc;
    }, {});

    const summary = Object.keys(seatMap).map(seatClass => ({
      class: seatClass,
      total_seats: seatMap[seatClass].available.length + seatMap[seatClass].booked.length,
      available_seats: seatMap[seatClass].available.length,
      booked_seats: seatMap[seatClass].booked.length,
      min_price: seatMap[seatClass].available.length > 0 ? Math.min(...seatMap[seatClass].available.map((s: any) => s.price)) : 0,
      max_price: seatMap[seatClass].available.length > 0 ? Math.max(...seatMap[seatClass].available.map((s: any) => s.price)) : 0
    }));

    res.json({
      success: true,
      data: {
        flight_id: flightId,
        seat_map: seatMap,
        summary: summary,
        total_available: seats.filter((s: any) => s.availability === 'available').length,
        total_booked: seats.filter((s: any) => s.availability === 'booked').length
      },
      message: 'Flight seats retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error getting flight seats:', error);
    res.status(500).json(createErrorResponse('FETCH_ERROR', 'Failed to retrieve flight seats'));
  }
};

export const checkSeatAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const flightId = parseInt(req.params.id);
    const { seat_ids } = req.body;

    if (isNaN(flightId) || flightId <= 0) {
      res.status(400).json(createErrorResponse('INVALID_FLIGHT_ID', 'Valid flight ID is required'));
      return;
    }

    if (!Array.isArray(seat_ids) || seat_ids.length === 0) {
      res.status(400).json(createErrorResponse('INVALID_SEAT_IDS', 'Seat IDs array is required'));
      return;
    }

    const flight = await flightModel.findFlightById(flightId);
    if (!flight) {
      res.status(404).json(createErrorResponse('FLIGHT_NOT_FOUND', 'Flight not found'));
      return;
    }

    const isAvailable = await flightModel.checkSeatAvailability(flightId, seat_ids);

    res.json({
      success: true,
      data: {
        flight_id: flightId,
        seat_ids: seat_ids,
        available: isAvailable
      },
      message: isAvailable ? 'All seats are available' : 'One or more seats are not available'
    } as ApiResponse);

  } catch (error) {
    console.error('Error checking seat availability:', error);
    res.status(500).json(createErrorResponse('CHECK_ERROR', 'Failed to check seat availability'));
  }
};


export const getAllFlights = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const airportId = req.query.airport_id ? parseInt(req.query.airport_id as string) : undefined;

    const offset = (page - 1) * limit;

    let flights;
    if (status) {
      flights = await flightModel.findAll({ status }, limit, offset, 'depart_when ASC');
    } else if (airportId) {
      flights = await flightModel.getFlightsByAirport(airportId, true);
    } else {
      flights = await flightModel.findAll({}, limit, offset, 'depart_when ASC');
    }

    const detailedFlights = await Promise.all(
      flights.map(async (flight: any) => {
        return await flightModel.getFlightDetails(flight.flight_id);
      })
    );

    const totalCount = await flightModel.count(status ? { status } : {});
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: detailedFlights,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages
      },
      message: `Retrieved ${detailedFlights.length} flights`
    } as ApiResponse);

  } catch (error) {
    console.error('Error getting all flights:', error);
    res.status(500).json(createErrorResponse('FETCH_ERROR', 'Failed to retrieve flights'));
  }
};

export const createFlight = async (req: Request, res: Response): Promise<void> => {
  try {
    const generateFlightNumber = () => {
      const prefix = 'JT';
      const randomNum = Math.floor(Math.random() * 9000) + 1000;
      return `${prefix}${randomNum}`;
    };

    const flightData = {
      flight_no: req.body.flight_no || generateFlightNumber(),
      depart_when: req.body.depart_when,
      arrive_when: req.body.arrive_when,
      status: req.body.status || 'Scheduled',
      airplane_id: req.body.airplane_id,
      depart_airport_id: req.body.depart_airport_id,
      arrive_airport_id: req.body.arrive_airport_id
    };

    const validationErrors = flightModel.validateFlightData(flightData);
    if (validationErrors.length > 0) {
      res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Flight data validation failed', validationErrors));
      return;
    }

    const airplane = await airplaneModel.findAirplaneById(flightData.airplane_id);
    if (!airplane) {
      res.status(404).json(createErrorResponse('AIRPLANE_NOT_FOUND', 'Airplane not found'));
      return;
    }

    const [departureAirport, arrivalAirport] = await Promise.all([
      airportModel.findAirportById(flightData.depart_airport_id),
      airportModel.findAirportById(flightData.arrive_airport_id)
    ]);

    if (!departureAirport || !arrivalAirport) {
      res.status(404).json(createErrorResponse('AIRPORT_NOT_FOUND', 'One or both airports not found'));
      return;
    }

    const availableAirplanes = await airplaneModel.getAvailableAirplanes(
      flightData.depart_when,
      flightData.arrive_when
    );

    const isAirplaneAvailable = availableAirplanes.some(
      (plane: any) => plane.airplane_id === flightData.airplane_id
    );

    if (!isAirplaneAvailable) {
      res.status(409).json(createErrorResponse('AIRPLANE_UNAVAILABLE', 'Airplane is not available for the specified time period'));
      return;
    }

    const flightId = await flightModel.createFlight(flightData);

    const createdFlight = await flightModel.getFlightDetails(flightId);

    res.status(201).json({
      success: true,
      data: createdFlight,
      message: 'Flight created successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error creating flight:', error);
    res.status(500).json(createErrorResponse('CREATION_ERROR', 'Failed to create flight'));
  }
};

export const updateFlight = async (req: Request, res: Response): Promise<void> => {
  try {
    const flightId = parseInt(req.params.id);
    const updateData = req.body;

    console.log(`Updating flight ${flightId} with data:`, updateData);

    if (isNaN(flightId) || flightId <= 0) {
      res.status(400).json(createErrorResponse('INVALID_FLIGHT_ID', 'Valid flight ID is required'));
      return;
    }

    const existingFlight = await flightModel.findFlightById(flightId);
    if (!existingFlight) {
      res.status(404).json(createErrorResponse('FLIGHT_NOT_FOUND', 'Flight not found'));
      return;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json(createErrorResponse('NO_DATA', 'No update data provided'));
      return;
    }

    if (updateData.airplane_id && updateData.airplane_id !== existingFlight.airplane_id) {
      const airplane = await airplaneModel.findAirplaneById(updateData.airplane_id);
      if (!airplane) {
        res.status(404).json(createErrorResponse('AIRPLANE_NOT_FOUND', 'Airplane not found'));
        return;
      }
    }

    if (updateData.depart_airport_id || updateData.arrive_airport_id) {
      const departAirportId = updateData.depart_airport_id || existingFlight.depart_airport_id;
      const arriveAirportId = updateData.arrive_airport_id || existingFlight.arrive_airport_id;

      const [departureAirport, arrivalAirport] = await Promise.all([
        airportModel.findAirportById(departAirportId),
        airportModel.findAirportById(arriveAirportId)
      ]);

      if (!departureAirport || !arrivalAirport) {
        res.status(404).json(createErrorResponse('AIRPORT_NOT_FOUND', 'One or both airports not found'));
        return;
      }
    }

    console.log('Updating flight with data:', JSON.stringify(updateData, null, 2));
    const success = await flightModel.updateFlight(flightId, updateData);
    console.log('Update result:', success);

    if (!success) {
      console.error('Flight update returned false - no rows affected');
      res.status(500).json(createErrorResponse('UPDATE_ERROR', 'Failed to update flight - no changes detected'));
      return;
    }

    const updatedFlight = await flightModel.getFlightDetails(flightId);

    res.json({
      success: true,
      data: updatedFlight,
      message: 'Flight updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error updating flight:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update flight';
    res.status(500).json(createErrorResponse('UPDATE_ERROR', errorMessage));
  }
};

export const deleteFlight = async (req: Request, res: Response): Promise<void> => {
  try {
    const flightId = parseInt(req.params.id);

    if (isNaN(flightId) || flightId <= 0) {
      res.status(400).json(createErrorResponse('INVALID_FLIGHT_ID', 'Valid flight ID is required'));
      return;
    }

    const existingFlight = await flightModel.findFlightById(flightId);
    if (!existingFlight) {
      res.status(404).json(createErrorResponse('FLIGHT_NOT_FOUND', 'Flight not found'));
      return;
    }

    const success = await flightModel.deleteFlight(flightId);

    if (!success) {
      res.status(500).json(createErrorResponse('DELETE_ERROR', 'Failed to delete flight'));
      return;
    }

    res.json({
      success: true,
      message: 'Flight deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error deleting flight:', error);
    
    if (error instanceof Error && error.message.includes('existing bookings')) {
      res.status(409).json(createErrorResponse('FLIGHT_HAS_BOOKINGS', 'Cannot delete flight with existing bookings'));
      return;
    }

    res.status(500).json(createErrorResponse('DELETE_ERROR', 'Failed to delete flight'));
  }
};

export const updateFlightStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const flightId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(flightId) || flightId <= 0) {
      res.status(400).json(createErrorResponse('INVALID_FLIGHT_ID', 'Valid flight ID is required'));
      return;
    }

    if (!status) {
      res.status(400).json(createErrorResponse('MISSING_STATUS', 'Flight status is required'));
      return;
    }

    const existingFlight = await flightModel.findFlightById(flightId);
    if (!existingFlight) {
      res.status(404).json(createErrorResponse('FLIGHT_NOT_FOUND', 'Flight not found'));
      return;
    }

    const success = await flightModel.updateFlightStatus(flightId, status);

    if (!success) {
      res.status(500).json(createErrorResponse('UPDATE_ERROR', 'Failed to update flight status'));
      return;
    }

    const updatedFlight = await flightModel.getFlightDetails(flightId);

    res.json({
      success: true,
      data: updatedFlight,
      message: `Flight status updated to ${status}`
    } as ApiResponse);

  } catch (error) {
    console.error('Error updating flight status:', error);
    res.status(500).json(createErrorResponse('UPDATE_ERROR', 'Failed to update flight status'));
  }
};

export const getFlightStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await flightModel.getFlightStats();

    res.json({
      success: true,
      data: stats,
      message: 'Flight statistics retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error getting flight statistics:', error);
    res.status(500).json(createErrorResponse('FETCH_ERROR', 'Failed to retrieve flight statistics'));
  }
};


export const getAllAirplanes = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;

    const offset = (page - 1) * limit;

    let airplanes;
    if (type) {
      airplanes = await airplaneModel.getAirplanesByType(type);
    } else {
      airplanes = await airplaneModel.getAllAirplanes(limit, offset);
    }

    const detailedAirplanes = await Promise.all(
      airplanes.map(async (airplane: any) => {
        return await airplaneModel.getAirplaneDetails(airplane.airplane_id);
      })
    );

    const totalCount = await airplaneModel.count({});
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: detailedAirplanes,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages
      },
      message: `Retrieved ${detailedAirplanes.length} airplanes`
    } as ApiResponse);

  } catch (error) {
    console.error('Error getting all airplanes:', error);
    res.status(500).json(createErrorResponse('FETCH_ERROR', 'Failed to retrieve airplanes'));
  }
};

export const getAirplaneDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const airplaneId = parseInt(req.params.id);

    if (isNaN(airplaneId) || airplaneId <= 0) {
      res.status(400).json(createErrorResponse('INVALID_AIRPLANE_ID', 'Valid airplane ID is required'));
      return;
    }

    const airplaneDetails = await airplaneModel.getAirplaneDetails(airplaneId);

    if (!airplaneDetails) {
      res.status(404).json(createErrorResponse('AIRPLANE_NOT_FOUND', 'Airplane not found'));
      return;
    }

    res.json({
      success: true,
      data: airplaneDetails,
      message: 'Airplane details retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error getting airplane details:', error);
    res.status(500).json(createErrorResponse('FETCH_ERROR', 'Failed to retrieve airplane details'));
  }
};

export const createAirplane = async (req: Request, res: Response): Promise<void> => {
  try {
    const airplaneData = req.body;

    const validationErrors = airplaneModel.validateAirplaneData(airplaneData);
    if (validationErrors.length > 0) {
      res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Airplane data validation failed', validationErrors
        ));
      return;
    }

    const existingAirplane = await airplaneModel.findByRegistration(airplaneData.registration);
    if (existingAirplane) {
      res.status(409).json(createErrorResponse('REGISTRATION_EXISTS', 'Airplane with this registration already exists'));
      return;
    }

    const airplaneId = await airplaneModel.createAirplane(airplaneData);

    const createdAirplane = await airplaneModel.getAirplaneDetails(airplaneId);

    res.status(201).json({
      success: true,
      data: createdAirplane,
      message: 'Airplane created successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error creating airplane:', error);
    res.status(500).json(createErrorResponse('CREATION_ERROR', 'Failed to create airplane'));
  }
};

export const updateAirplane = async (req: Request, res: Response): Promise<void> => {
  try {
    const airplaneId = parseInt(req.params.id);
    const updateData = req.body;

    if (isNaN(airplaneId) || airplaneId <= 0) {
      res.status(400).json(createErrorResponse('INVALID_AIRPLANE_ID', 'Valid airplane ID is required'));
      return;
    }

    const existingAirplane = await airplaneModel.findAirplaneById(airplaneId);
    if (!existingAirplane) {
      res.status(404).json(createErrorResponse('AIRPLANE_NOT_FOUND', 'Airplane not found'));
      return;
    }

    if (Object.keys(updateData).length > 0) {
      const validationErrors = airplaneModel.validateAirplaneData({
        ...existingAirplane,
        ...updateData
      });
      
      if (validationErrors.length > 0) {
        res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Airplane data validation failed', validationErrors
          ));
        return;
      }
    }

    if (updateData.registration && updateData.registration !== existingAirplane.registration) {
      const registrationExists = await airplaneModel.registrationExists(updateData.registration, airplaneId);
      if (registrationExists) {
        res.status(409).json(createErrorResponse('REGISTRATION_EXISTS', 'Airplane with this registration already exists'));
        return;
      }
    }

    const success = await airplaneModel.updateAirplane(airplaneId, updateData);

    if (!success) {
      res.status(500).json(createErrorResponse('UPDATE_ERROR', 'Failed to update airplane'));
      return;
    }

    const updatedAirplane = await airplaneModel.getAirplaneDetails(airplaneId);

    res.json({
      success: true,
      data: updatedAirplane,
      message: 'Airplane updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error updating airplane:', error);
    res.status(500).json(createErrorResponse('UPDATE_ERROR', 'Failed to update airplane'));
  }
};

export const deleteAirplane = async (req: Request, res: Response): Promise<void> => {
  try {
    const airplaneId = parseInt(req.params.id);

    if (isNaN(airplaneId) || airplaneId <= 0) {
      res.status(400).json(createErrorResponse('INVALID_AIRPLANE_ID', 'Valid airplane ID is required'));
      return;
    }

    const existingAirplane = await airplaneModel.findAirplaneById(airplaneId);
    if (!existingAirplane) {
      res.status(404).json(createErrorResponse('AIRPLANE_NOT_FOUND', 'Airplane not found'));
      return;
    }

    const success = await airplaneModel.deleteAirplane(airplaneId);

    if (!success) {
      res.status(500).json(createErrorResponse('DELETE_ERROR', 'Failed to delete airplane'));
      return;
    }

    res.json({
      success: true,
      message: 'Airplane deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error deleting airplane:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('existing flights')) {
        res.status(409).json(createErrorResponse('AIRPLANE_HAS_FLIGHTS', 'Cannot delete airplane with existing flights'));
        return;
      }
      
      if (error.message.includes('existing seat configuration')) {
        res.status(409).json(createErrorResponse('AIRPLANE_HAS_SEATS', 'Cannot delete airplane with existing seat configuration'));
        return;
      }
    }

    res.status(500).json(createErrorResponse('DELETE_ERROR', 'Failed to delete airplane'));
  }
};


export const getAirplaneSeatConfiguration = async (req: Request, res: Response): Promise<void> => {
  try {
    const airplaneId = parseInt(req.params.id);

    if (isNaN(airplaneId) || airplaneId <= 0) {
      res.status(400).json(createErrorResponse('INVALID_AIRPLANE_ID', 'Valid airplane ID is required'));
      return;
    }

    const airplane = await airplaneModel.findAirplaneById(airplaneId);
    if (!airplane) {
      res.status(404).json(createErrorResponse('AIRPLANE_NOT_FOUND', 'Airplane not found'));
      return;
    }

    const seats = await seatModel.getSeatsByAirplane(airplaneId);
    const seatPricing = await seatModel.getSeatPricing(airplaneId);

    res.json({
      success: true,
      data: {
        airplane: airplane,
        seats: seats,
        pricing_by_class: seatPricing,
        total_seats: seats.length
      },
      message: 'Airplane seat configuration retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error getting airplane seat configuration:', error);
    res.status(500).json(createErrorResponse('FETCH_ERROR', 'Failed to retrieve seat configuration'));
  }
};

export const createSeat = async (req: Request, res: Response): Promise<void> => {
  try {
    const airplaneId = parseInt(req.params.id);
    const seatData = {
      ...req.body,
      airplane_id: airplaneId
    };

    if (isNaN(airplaneId) || airplaneId <= 0) {
      res.status(400).json(createErrorResponse('INVALID_AIRPLANE_ID', 'Valid airplane ID is required'));
      return;
    }

    const airplane = await airplaneModel.findAirplaneById(airplaneId);
    if (!airplane) {
      res.status(404).json(createErrorResponse('AIRPLANE_NOT_FOUND', 'Airplane not found'));
      return;
    }

    const validationErrors = seatModel.validateSeatData(seatData);
    if (validationErrors.length > 0) {
      res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Seat data validation failed', validationErrors
        ));
      return;
    }

    const existingSeats = await seatModel.getSeatsByAirplane(airplaneId);
    const seatExists = existingSeats.some((seat: any) => seat.seat_no === seatData.seat_no);
    
    if (seatExists) {
      res.status(409).json(createErrorResponse('SEAT_EXISTS', 'Seat number already exists for this airplane'));
      return;
    }

    const seatId = await seatModel.createSeat(seatData);

    const createdSeat = await seatModel.findSeatById(seatId);

    res.status(201).json({
      success: true,
      data: createdSeat,
      message: 'Seat created successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error creating seat:', error);
    res.status(500).json(createErrorResponse('CREATION_ERROR', 'Failed to create seat'));
  }
};

export const updateSeat = async (req: Request, res: Response): Promise<void> => {
  try {
    const seatId = parseInt(req.params.seatId);
    const updateData = req.body;

    if (isNaN(seatId) || seatId <= 0) {
      res.status(400).json(createErrorResponse('INVALID_SEAT_ID', 'Valid seat ID is required'));
      return;
    }

    const existingSeat = await seatModel.findSeatById(seatId);
    if (!existingSeat) {
      res.status(404).json(createErrorResponse('SEAT_NOT_FOUND', 'Seat not found'));
      return;
    }

    if (Object.keys(updateData).length > 0) {
      const validationErrors = seatModel.validateSeatData({
        ...existingSeat,
        ...updateData
      });
      
      if (validationErrors.length > 0) {
        res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Seat data validation failed', validationErrors
          ));
        return;
      }
    }

    if (updateData.seat_no && updateData.seat_no !== existingSeat.seat_no) {
      const existingSeats = await seatModel.getSeatsByAirplane(existingSeat.airplane_id);
      const seatExists = existingSeats.some((seat: any) => 
        seat.seat_no === updateData.seat_no && seat.seat_id !== seatId
      );
      
      if (seatExists) {
        res.status(409).json(createErrorResponse('SEAT_EXISTS', 'Seat number already exists for this airplane'));
        return;
      }
    }

    const success = await seatModel.updateSeat(seatId, updateData);

    if (!success) {
      res.status(500).json(createErrorResponse('UPDATE_ERROR', 'Failed to update seat'));
      return;
    }

    const updatedSeat = await seatModel.findSeatById(seatId);

    res.json({
      success: true,
      data: updatedSeat,
      message: 'Seat updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error updating seat:', error);
    res.status(500).json(createErrorResponse('UPDATE_ERROR', 'Failed to update seat'));
  }
};

export const deleteSeat = async (req: Request, res: Response): Promise<void> => {
  try {
    const seatId = parseInt(req.params.seatId);

    if (isNaN(seatId) || seatId <= 0) {
      res.status(400).json(createErrorResponse('INVALID_SEAT_ID', 'Valid seat ID is required'));
      return;
    }

    const existingSeat = await seatModel.findSeatById(seatId);
    if (!existingSeat) {
      res.status(404).json(createErrorResponse('SEAT_NOT_FOUND', 'Seat not found'));
      return;
    }

    const success = await seatModel.deleteSeat(seatId);

    if (!success) {
      res.status(500).json(createErrorResponse('DELETE_ERROR', 'Failed to delete seat'));
      return;
    }

    res.json({
      success: true,
      message: 'Seat deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error deleting seat:', error);
    
    if (error instanceof Error && error.message.includes('existing bookings')) {
      res.status(409).json(createErrorResponse('SEAT_HAS_BOOKINGS', 'Cannot delete seat with existing bookings'));
      return;
    }

    res.status(500).json(createErrorResponse('DELETE_ERROR', 'Failed to delete seat'));
  }
};
