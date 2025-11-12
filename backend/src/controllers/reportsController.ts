import { Request, Response } from 'express';
import { BookingModel } from '../models/Booking';
import PDFDocument from 'pdfkit';

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

  exportCSV = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type = 'metrics', startDate, endDate, days = 30 } = req.query;

      let data: any[] = [];
      let headers: string[] = [];
      let filename = `report-${type}-${Date.now()}.csv`;

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
        let bookingsQuery = `
          SELECT 
            b.booking_id,
            b.booking_no,
            b.status,
            b.fasttrack,
            b.support,
            b.created_date,
            CONCAT(c.firstname, ' ', c.lastname) as client_name,
            c.email as client_email,
            f.flight_id,
            dep.iata_code as departure,
            arr.iata_code as arrival,
            f.depart_when,
            COUNT(p.passenger_id) as passenger_count
          FROM booking b
          LEFT JOIN client c ON b.client_id = c.client_id
          LEFT JOIN flight f ON b.flight_id = f.flight_id
          LEFT JOIN airport dep ON f.depart_airport_id = dep.airport_id
          LEFT JOIN airport arr ON f.arrive_airport_id = arr.airport_id
          LEFT JOIN passenger p ON b.booking_id = p.booking_id
        `;

        const params: any[] = [];
        if (startDate && endDate) {
          bookingsQuery += ' WHERE b.created_date BETWEEN ? AND ?';
          params.push(startDate, endDate);
        } else if (days) {
          bookingsQuery += ' WHERE b.created_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)';
          params.push(parseInt(days as string));
        }

        bookingsQuery += ' GROUP BY b.booking_id ORDER BY b.created_date DESC';
        data = await this.reportsModel.executeReportQuery(bookingsQuery, params);
        headers = ['Booking ID', 'Booking No', 'Status', 'Fast Track', 'Support', 'Created Date', 'Client Name', 'Client Email', 'Flight ID', 'Departure', 'Arrival', 'Departure Time', 'Passenger Count'];
      } else if (type === 'revenue') {
        let revenueQuery = `
          SELECT 
            DATE(p.payment_timestamp) as date,
            COUNT(p.payment_id) as transaction_count,
            SUM(p.amount) as total_revenue,
            AVG(p.amount) as avg_transaction,
            p.currency
          FROM payment p
          WHERE p.status = 'completed'
        `;

        const params: any[] = [];
        if (startDate && endDate) {
          revenueQuery += ' AND p.payment_timestamp BETWEEN ? AND ?';
          params.push(startDate, endDate);
        } else if (days) {
          revenueQuery += ' AND p.payment_timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)';
          params.push(parseInt(days as string));
        }

        revenueQuery += ' GROUP BY DATE(p.payment_timestamp), p.currency ORDER BY date DESC';
        data = await this.reportsModel.executeReportQuery(revenueQuery, params);
        headers = ['Date', 'Transaction Count', 'Total Revenue', 'Average Transaction', 'Currency'];
      } else if (type === 'flights') {
        let flightsQuery = `
          SELECT 
            f.flight_id,
            f.flight_no,
            f.status,
            f.depart_when,
            f.arrive_when,
            dep.airport_name as departure_airport,
            dep.iata_code as departure_iata,
            arr.airport_name as arrival_airport,
            arr.iata_code as arrival_iata,
            a.type as airplane_type,
            COUNT(DISTINCT b.booking_id) as booking_count,
            COUNT(DISTINCT pass.passenger_id) as passenger_count
          FROM flight f
          LEFT JOIN airport dep ON f.depart_airport_id = dep.airport_id
          LEFT JOIN airport arr ON f.arrive_airport_id = arr.airport_id
          LEFT JOIN airplane a ON f.airplane_id = a.airplane_id
          LEFT JOIN booking b ON f.flight_id = b.flight_id
          LEFT JOIN passenger pass ON f.flight_id = pass.flight_id
        `;

        const params: any[] = [];
        if (startDate && endDate) {
          flightsQuery += ' WHERE f.depart_when BETWEEN ? AND ?';
          params.push(startDate, endDate);
        } else if (days) {
          flightsQuery += ' WHERE f.depart_when >= DATE_SUB(CURDATE(), INTERVAL ? DAY)';
          params.push(parseInt(days as string));
        }

        flightsQuery += ' GROUP BY f.flight_id ORDER BY f.depart_when DESC';
        data = await this.reportsModel.executeReportQuery(flightsQuery, params);
        headers = ['Flight ID', 'Flight No', 'Status', 'Departure Time', 'Arrival Time', 'Departure Airport', 'Departure IATA', 'Arrival Airport', 'Arrival IATA', 'Airplane Type', 'Booking Count', 'Passenger Count'];
      }

      const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      let csv = headers.map(escapeCSV).join(',') + '\n';
      data.forEach((row: any) => {
        csv += Object.values(row).map(escapeCSV).join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
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

  exportPDF = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type = 'metrics', startDate, endDate, days = 30 } = req.query;

      const doc = new PDFDocument({ margin: 50 });
      const filename = `report-${type}-${Date.now()}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      doc.pipe(res);

      doc.fontSize(20).text('Jett3 Airlines Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Report Type: ${type}`, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      if (type === 'metrics') {
        const metricsQuery = `
          SELECT 
            (SELECT COUNT(*) FROM flight) as totalFlights,
            (SELECT COUNT(*) FROM booking) as totalBookings,
            (SELECT COALESCE(SUM(amount), 0) FROM payment WHERE status = 'completed') as totalRevenue,
            (SELECT COUNT(*) FROM booking WHERE status = 'cancelled') as totalCancellations
        `;
        const metrics = await this.reportsModel.executeReportQuery(metricsQuery);
        const data = metrics[0];

        doc.fontSize(16).text('Summary Metrics', { underline: true });
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Total Flights: ${data.totalFlights}`);
        doc.text(`Total Bookings: ${data.totalBookings}`);
        doc.text(`Total Revenue: $${parseFloat(data.totalRevenue).toFixed(2)}`);
        doc.text(`Total Cancellations: ${data.totalCancellations}`);
      } else if (type === 'bookings') {
        let bookingsQuery = `
          SELECT 
            b.booking_id,
            b.booking_no,
            b.status,
            b.created_date,
            CONCAT(c.firstname, ' ', c.lastname) as client_name,
            dep.iata_code as departure,
            arr.iata_code as arrival,
            COUNT(p.passenger_id) as passenger_count
          FROM booking b
          LEFT JOIN client c ON b.client_id = c.client_id
          LEFT JOIN flight f ON b.flight_id = f.flight_id
          LEFT JOIN airport dep ON f.depart_airport_id = dep.airport_id
          LEFT JOIN airport arr ON f.arrive_airport_id = arr.airport_id
          LEFT JOIN passenger p ON b.booking_id = p.booking_id
        `;

        const params: any[] = [];
        if (startDate && endDate) {
          bookingsQuery += ' WHERE b.created_date BETWEEN ? AND ?';
          params.push(startDate, endDate);
        } else if (days) {
          bookingsQuery += ' WHERE b.created_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)';
          params.push(parseInt(days as string));
        }

        bookingsQuery += ' GROUP BY b.booking_id ORDER BY b.created_date DESC LIMIT 50';
        const bookings = await this.reportsModel.executeReportQuery(bookingsQuery, params);

        doc.fontSize(16).text('Bookings Report', { underline: true });
        doc.moveDown();
        doc.fontSize(10);

        const tableTop = doc.y;
        const colWidths = [60, 80, 80, 100, 80, 80];
        const headers = ['Booking ID', 'Booking No', 'Status', 'Client', 'Route', 'Passengers'];

        let x = 50;
        headers.forEach((header, i) => {
          doc.text(header, x, tableTop, { width: colWidths[i], continued: false });
          x += colWidths[i];
        });

        doc.moveDown();
        let y = doc.y;

        bookings.slice(0, 30).forEach((booking: any) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
          }

          x = 50;
          const row = [
            booking.booking_id,
            booking.booking_no || 'N/A',
            booking.status,
            booking.client_name || 'N/A',
            `${booking.departure}-${booking.arrival}`,
            booking.passenger_count
          ];

          row.forEach((cell, i) => {
            doc.text(String(cell), x, y, { width: colWidths[i], continued: false });
            x += colWidths[i];
          });

          y += 20;
          doc.y = y;
        });

        if (bookings.length > 30) {
          doc.moveDown();
          doc.text(`... and ${bookings.length - 30} more bookings`, { align: 'center' });
        }
      } else if (type === 'revenue') {
        let revenueQuery = `
          SELECT 
            DATE(p.payment_timestamp) as date,
            COUNT(p.payment_id) as transaction_count,
            SUM(p.amount) as total_revenue,
            AVG(p.amount) as avg_transaction
          FROM payment p
          WHERE p.status = 'completed'
        `;

        const params: any[] = [];
        if (startDate && endDate) {
          revenueQuery += ' AND p.payment_timestamp BETWEEN ? AND ?';
          params.push(startDate, endDate);
        } else if (days) {
          revenueQuery += ' AND p.payment_timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)';
          params.push(parseInt(days as string));
        }

        revenueQuery += ' GROUP BY DATE(p.payment_timestamp) ORDER BY date DESC';
        const revenue = await this.reportsModel.executeReportQuery(revenueQuery, params);

        doc.fontSize(16).text('Revenue Report', { underline: true });
        doc.moveDown();
        doc.fontSize(10);

        const totalRevenue = revenue.reduce((sum: number, row: any) => sum + parseFloat(row.total_revenue), 0);
        const totalTransactions = revenue.reduce((sum: number, row: any) => sum + parseInt(row.transaction_count), 0);

        doc.fontSize(12);
        doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`);
        doc.text(`Total Transactions: ${totalTransactions}`);
        doc.text(`Average Transaction: $${(totalRevenue / totalTransactions).toFixed(2)}`);
        doc.moveDown(2);

        doc.fontSize(10);
        const tableTop = doc.y;
        const colWidths = [150, 150, 150];
        const headers = ['Date', 'Transactions', 'Revenue'];

        let x = 50;
        headers.forEach((header, i) => {
          doc.text(header, x, tableTop, { width: colWidths[i], continued: false });
          x += colWidths[i];
        });

        doc.moveDown();
        let y = doc.y;

        revenue.slice(0, 25).forEach((row: any) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
          }

          x = 50;
          const cells = [
            new Date(row.date).toLocaleDateString(),
            row.transaction_count,
            `$${parseFloat(row.total_revenue).toFixed(2)}`
          ];

          cells.forEach((cell, i) => {
            doc.text(String(cell), x, y, { width: colWidths[i], continued: false });
            x += colWidths[i];
          });

          y += 20;
          doc.y = y;
        });
      } else if (type === 'flights') {
        let flightsQuery = `
          SELECT 
            f.flight_id,
            f.flight_no,
            f.status,
            f.depart_when,
            dep.iata_code as departure,
            arr.iata_code as arrival,
            COUNT(DISTINCT b.booking_id) as booking_count,
            COUNT(DISTINCT pass.passenger_id) as passenger_count
          FROM flight f
          LEFT JOIN airport dep ON f.depart_airport_id = dep.airport_id
          LEFT JOIN airport arr ON f.arrive_airport_id = arr.airport_id
          LEFT JOIN booking b ON f.flight_id = b.flight_id
          LEFT JOIN passenger pass ON f.flight_id = pass.flight_id
        `;

        const params: any[] = [];
        if (startDate && endDate) {
          flightsQuery += ' WHERE f.depart_when BETWEEN ? AND ?';
          params.push(startDate, endDate);
        } else if (days) {
          flightsQuery += ' WHERE f.depart_when >= DATE_SUB(CURDATE(), INTERVAL ? DAY)';
          params.push(parseInt(days as string));
        }

        flightsQuery += ' GROUP BY f.flight_id ORDER BY f.depart_when DESC LIMIT 40';
        const flights = await this.reportsModel.executeReportQuery(flightsQuery, params);

        doc.fontSize(16).text('Flights Report', { underline: true });
        doc.moveDown();
        doc.fontSize(10);

        const tableTop = doc.y;
        const colWidths = [60, 80, 70, 100, 80, 80];
        const headers = ['Flight ID', 'Flight No', 'Status', 'Departure', 'Route', 'Passengers'];

        let x = 50;
        headers.forEach((header, i) => {
          doc.text(header, x, tableTop, { width: colWidths[i], continued: false });
          x += colWidths[i];
        });

        doc.moveDown();
        let y = doc.y;

        flights.forEach((flight: any) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
          }

          x = 50;
          const row = [
            flight.flight_id,
            flight.flight_no || 'N/A',
            flight.status,
            new Date(flight.depart_when).toLocaleDateString(),
            `${flight.departure}-${flight.arrival}`,
            flight.passenger_count
          ];

          row.forEach((cell, i) => {
            doc.text(String(cell), x, y, { width: colWidths[i], continued: false });
            x += colWidths[i];
          });

          y += 20;
          doc.y = y;
        });
      } else if (type === 'chart') {
        const chartQuery = `
          SELECT 
            DATE(created_date) as date,
            COUNT(*) as bookings
          FROM booking
          WHERE created_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
          GROUP BY DATE(created_date)
          ORDER BY date ASC
        `;
        const chartData = await this.reportsModel.executeReportQuery(chartQuery, [parseInt(days as string) || 30]);

        doc.fontSize(16).text('Bookings Trend Chart', { underline: true });
        doc.moveDown(2);

        const chartHeight = 200;
        const chartWidth = 400;
        const chartX = 100;
        const chartY = doc.y;
        const maxBookings = Math.max(...chartData.map((d: any) => parseInt(d.bookings)));

        doc.moveTo(chartX, chartY).lineTo(chartX, chartY + chartHeight).stroke();
        doc.moveTo(chartX, chartY + chartHeight).lineTo(chartX + chartWidth, chartY + chartHeight).stroke();

        const barWidth = chartWidth / chartData.length;
        chartData.forEach((data: any, index: number) => {
          const barHeight = (parseInt(data.bookings) / maxBookings) * chartHeight;
          const x = chartX + (index * barWidth);
          const y = chartY + chartHeight - barHeight;

          doc.rect(x + 2, y, barWidth - 4, barHeight).fill('#4A90E2');
        });

        doc.fillColor('black');
        doc.moveDown(15);
        doc.fontSize(10);
        doc.text('Daily Bookings Over Time', chartX, doc.y, { width: chartWidth, align: 'center' });
      }

      doc.end();
    } catch (error) {
      console.error('Export PDF error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error while exporting PDF'
          }
        });
      }
    }
  };
}
