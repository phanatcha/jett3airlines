import { Request, Response } from 'express';
import { BookingModel } from '../models/Booking';

// Helper class for reports queries
class ReportsModel extends BookingModel {
  async executeReportQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
    return await this.executeQuery<T>(query, params);
  }
}

export class ReportsController {
  private reportsModel: ReportsModel;

  constructor() {
    this.reportsModel = new ReportsModel();
  }

  /**
   * Get summary metrics for admin dashboard
   */
  getMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const metricsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM flight) as totalFlights,
          (SELECT COUNT(*) FROM booking) as totalBookings,
          (SELECT COALESCE(SUM(amount), 0) FROM payment WHERE status = 'completed') as totalRevenue,
          (SELECT COUNT(*) FROM booking WHERE status = 'cancelled') as totalCancellations
      `;

      const metrics = await this.reportsModel.executeReportQuery(metricsQuery);

      res.status(200).json({
        success: true,
        message: 'Metrics retrieved successfully',
        data: {
          totalFlights: metrics[0].totalFlights || 0,
          totalBookings: metrics[0].totalBookings || 0,
          totalRevenue: metrics[0].totalRevenue || 0,
          totalCancellations: metrics[0].totalCancellations || 0
        }
      });
    } catch (error) {
      console.error('Get metrics error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while retrieving metrics'
        }
      });
    }
  };

  /**
   * Get bookings per day data for charts
   */
  getBookingsPerDay = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, days = 30 } = req.query;

      let query = `
        SELECT 
          DATE(created_date) as date,
          COUNT(*) as bookings
        FROM booking
      `;

      const params: any[] = [];

      if (startDate && endDate) {
        query += ' WHERE created_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else {
        // Default to last N days
        query += ' WHERE created_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)';
        params.push(parseInt(days as string) || 30);
      }

      query += ' GROUP BY DATE(created_date) ORDER BY date ASC';

      const data = await this.reportsModel.executeReportQuery(query, params);

      res.status(200).json({
        success: true,
        message: 'Bookings per day data retrieved successfully',
        data: data.map((row: any) => ({
          date: row.date,
          bookings: parseInt(row.bookings)
        }))
      });
    } catch (error) {
      console.error('Get bookings per day error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while retrieving bookings data'
        }
      });
    }
  };

  /**
   * Get revenue per day data for charts
   */
  getRevenuePerDay = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, days = 30 } = req.query;

      let query = `
        SELECT 
          DATE(payment_timestamp) as date,
          SUM(amount) as revenue
        FROM payment
        WHERE status = 'completed'
      `;

      const params: any[] = [];

      if (startDate && endDate) {
        query += ' AND payment_timestamp BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else {
        query += ' AND payment_timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)';
        params.push(parseInt(days as string) || 30);
      }

      query += ' GROUP BY DATE(payment_timestamp) ORDER BY date ASC';

      const data = await this.reportsModel.executeReportQuery(query, params);

      res.status(200).json({
        success: true,
        message: 'Revenue per day data retrieved successfully',
        data: data.map((row: any) => ({
          date: row.date,
          revenue: parseFloat(row.revenue) || 0
        }))
      });
    } catch (error) {
      console.error('Get revenue per day error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while retrieving revenue data'
        }
      });
    }
  };

  /**
   * Get flight statistics
   */
  getFlightStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as totalFlights,
          COUNT(CASE WHEN status = 'Scheduled' THEN 1 END) as scheduledFlights,
          COUNT(CASE WHEN status = 'Delayed' THEN 1 END) as delayedFlights,
          COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelledFlights,
          COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completedFlights
        FROM flight
      `;

      const stats = await this.reportsModel.executeReportQuery(statsQuery);

      res.status(200).json({
        success: true,
        message: 'Flight statistics retrieved successfully',
        data: stats[0]
      });
    } catch (error) {
      console.error('Get flight stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while retrieving flight statistics'
        }
      });
    }
  };

  /**
   * Get booking statistics
   */
  getBookingStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as totalBookings,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingBookings,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmedBookings,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelledBookings,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedBookings,
          COUNT(CASE WHEN fasttrack = 'Yes' THEN 1 END) as fasttrackBookings
        FROM booking
      `;

      const stats = await this.reportsModel.executeReportQuery(statsQuery);

      res.status(200).json({
        success: true,
        message: 'Booking statistics retrieved successfully',
        data: stats[0]
      });
    } catch (error) {
      console.error('Get booking stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while retrieving booking statistics'
        }
      });
    }
  };

  /**
   * Export reports as CSV
   */
  exportCSV = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type = 'metrics' } = req.query;

      let data: any[] = [];
      let headers: string[] = [];

      if (type === 'metrics') {
        const metricsQuery = `
          SELECT 
            (SELECT COUNT(*) FROM flight) as totalFlights,
            (SELECT COUNT(*) FROM booking) as totalBookings,
            (SELECT COALESCE(SUM(amount), 0) FROM payment WHERE status = 'completed') as totalRevenue,
            (SELECT COUNT(*) FROM booking WHERE status = 'cancelled') as totalCancellations
        `;
        const metrics = await this.reportsModel.executeReportQuery(metricsQuery);
        data = metrics;
        headers = ['Total Flights', 'Total Bookings', 'Total Revenue', 'Total Cancellations'];
      } else if (type === 'bookings') {
        const bookingsQuery = `
          SELECT 
            booking_no,
            flight_id,
            status,
            fasttrack,
            created_date
          FROM booking
          ORDER BY created_date DESC
        `;
        data = await this.reportsModel.executeReportQuery(bookingsQuery);
        headers = ['Booking No', 'Flight ID', 'Status', 'Fast Track', 'Created Date'];
      }

      // Generate CSV
      let csv = headers.join(',') + '\n';
      data.forEach((row: any) => {
        csv += Object.values(row).join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=report-${type}-${Date.now()}.csv`);
      res.status(200).send(csv);
    } catch (error) {
      console.error('Export CSV error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while exporting CSV'
        }
      });
    }
  };

  /**
   * Export reports as PDF (placeholder - requires PDF library)
   */
  exportPDF = async (req: Request, res: Response): Promise<void> => {
    try {
      // This is a placeholder. In production, you would use a library like pdfkit or puppeteer
      res.status(501).json({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'PDF export functionality not yet implemented. Please use CSV export.'
        }
      });
    } catch (error) {
      console.error('Export PDF error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while exporting PDF'
        }
      });
    }
  };
}
