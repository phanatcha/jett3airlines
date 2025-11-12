import express, { Request, Response } from 'express';
import bookingsController from '../controllers/bookingsController';
import { authenticateToken } from '../middleware/auth';
import { validateBookingCreation, validateBookingUpdate, sanitizeInput } from '../middleware/validation';

const router = express.Router();

router.use(authenticateToken);

router.use(sanitizeInput);

router.post('/', validateBookingCreation, (req: Request, res: Response) => bookingsController.createBooking(req, res));

router.get('/', (req: Request, res: Response) => bookingsController.getBookingHistory(req, res));

router.get('/:bookingId', (req: Request, res: Response) => bookingsController.getBookingDetails(req, res));

router.put('/:bookingId', validateBookingUpdate, (req: Request, res: Response) => bookingsController.updateBooking(req, res));

router.patch('/:id/status', (req: Request, res: Response) => bookingsController.updateBookingStatus(req, res));

router.delete('/:bookingId', (req: Request, res: Response) => bookingsController.cancelBooking(req, res));

export default router;