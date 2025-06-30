const nodemailer = require("nodemailer");
require("dotenv").config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Customer emails
  async sendBookingConfirmation(customerData, tripData, invoiceData) {
    const subject = `Booking Confirmation - Trip #${tripData.trip_id}`;
    const html = this.generateBookingConfirmationHTML(customerData, tripData, invoiceData);

    await this.transporter.sendMail({
      from: `"eCharter" <${process.env.EMAIL_USER}>`,
      to: customerData.email,
      subject,
      html
    });
  }

  async sendNoVehicleAvailable(customerData, tripData) {
    const subject = `Booking Request Received - Trip Inquiry`;
    const html = this.generateNoVehicleHTML(customerData, tripData);

    await this.transporter.sendMail({
      from: `"eCharter" <${process.env.EMAIL_USER}>`,
      to: customerData.email,
      subject,
      html
    });
  }

  async sendInvoice(customerData, invoiceData) {
    const subject = `Invoice #${invoiceData.invoice_number} - eCharter`;
    const html = this.generateInvoiceHTML(customerData, invoiceData);

    await this.transporter.sendMail({
      from: `"eCharter" <${process.env.EMAIL_USER}>`,
      to: customerData.email,
      subject,
      html
    });
  }

  async sendTrackingLink(customerData, tripData, trackingUrl) {
    const subject = `Your Trip Has Started - Track Your Journey`;
    const html = this.generateTrackingHTML(customerData, tripData, trackingUrl);

    await this.transporter.sendMail({
      from: `"eCharter" <${process.env.EMAIL_USER}>`,
      to: customerData.email,
      subject,
      html
    });
  }

  // Admin emails
  async sendAdminBookingNotification(tripData, customerData, vehicleData) {
    const subject = `New Booking - Trip #${tripData.trip_id}`;
    const html = this.generateAdminBookingHTML(tripData, customerData, vehicleData);

    await this.transporter.sendMail({
      from: `"eCharter" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject,
      html
    });
  }

  async sendAdminNoVehicleNotification(tripData, customerData) {
    const subject = `No Vehicle Available - Trip Inquiry`;
    const html = this.generateAdminNoVehicleHTML(tripData, customerData);

    await this.transporter.sendMail({
      from: `"eCharter" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject,
      html
    });
  }

  // Driver/Fleet emails
  async sendDriverBookingNotification(driverData, tripData, customerData) {
    const subject = `New Booking Assignment - Trip #${tripData.trip_id}`;
    const html = this.generateDriverBookingHTML(driverData, tripData, customerData);

    await this.transporter.sendMail({
      from: `"eCharter" <${process.env.EMAIL_USER}>`,
      to: driverData.email,
      subject,
      html
    });
  }

  // HTML Templates
  generateBookingConfirmationHTML(customer, trip, invoice) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5aa0;">Booking Confirmation</h2>
        <p>Dear ${customer.firstName} ${customer.lastName},</p>
        <p>Thank you for choosing eCharter! Your booking has been confirmed.</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Trip Details</h3>
          <p><strong>Trip ID:</strong> ${trip.trip_id}</p>
          <p><strong>From:</strong> ${trip.pickupLocation}</p>
          <p><strong>To:</strong> ${trip.dropLocation}</p>
          <p><strong>Date:</strong> ${trip.tripStartDate}</p>
          <p><strong>Time:</strong> ${trip.tripTime}</p>
          <p><strong>Total Amount:</strong> $${invoice.total_amount}</p>
        </div>

        <p>You can track your booking and manage your trips by logging into your dashboard:</p>
        <a href="${process.env.FRONTEND_URL}/login" style="background: #2c5aa0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Dashboard</a>
        
        <p>Best regards,<br>eCharter Team</p>
      </div>
    `;
  }

  generateNoVehicleHTML(customer, trip) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5aa0;">Booking Request Received</h2>
        <p>Dear ${customer.firstName} ${customer.lastName},</p>
        <p>Thank you for your interest in eCharter. We have received your booking request.</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Trip Details</h3>
          <p><strong>From:</strong> ${trip.pickupLocation}</p>
          <p><strong>To:</strong> ${trip.dropLocation}</p>
          <p><strong>Date:</strong> ${trip.tripStartDate}</p>
          <p><strong>Time:</strong> ${trip.tripTime}</p>
        </div>

        <p>Unfortunately, no vehicles are currently available for your requested itinerary. One of our customer representatives will contact you soon to discuss alternative options and confirm your booking.</p>
        
        <a href="${process.env.FRONTEND_URL}/login" style="background: #2c5aa0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Create Account</a>
        
        <p>Best regards,<br>eCharter Team</p>
      </div>
    `;
  }

  generateInvoiceHTML(customer, invoice) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5aa0;">Invoice #${invoice.invoice_number}</h2>
        <p>Dear ${customer.firstName} ${customer.lastName},</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Invoice Details</h3>
          <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
          <p><strong>Trip ID:</strong> ${invoice.trip_id}</p>
          <p><strong>Subtotal:</strong> $${invoice.subtotal}</p>
          <p><strong>Tax:</strong> $${invoice.tax_amount}</p>
          <p><strong>Total Amount:</strong> $${invoice.total_amount}</p>
          <p><strong>Status:</strong> ${invoice.status}</p>
        </div>
        
        <p>Best regards,<br>eCharter Team</p>
      </div>
    `;
  }

  generateTrackingHTML(customer, trip, trackingUrl) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5aa0;">Your Trip Has Started!</h2>
        <p>Dear ${customer.firstName} ${customer.lastName},</p>
        <p>Your driver has started the trip. You can now track your journey in real-time.</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Trip Details</h3>
          <p><strong>Trip ID:</strong> ${trip.trip_id}</p>
          <p><strong>From:</strong> ${trip.pickupLocation}</p>
          <p><strong>To:</strong> ${trip.dropLocation}</p>
        </div>

        <a href="${trackingUrl}" style="background: #2c5aa0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Your Trip</a>
        
        <p>Best regards,<br>eCharter Team</p>
      </div>
    `;
  }

  generateAdminBookingHTML(trip, customer, vehicle) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5aa0;">New Booking Received</h2>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Booking Information</h3>
          <p><strong>Trip ID:</strong> ${trip.trip_id}</p>
          <p><strong>Customer:</strong> ${customer.firstName} ${customer.lastName}</p>
          <p><strong>Email:</strong> ${customer.email}</p>
          <p><strong>Phone:</strong> ${customer.phoneNo}</p>
          <p><strong>From:</strong> ${trip.pickupLocation}</p>
          <p><strong>To:</strong> ${trip.dropLocation}</p>
          <p><strong>Date:</strong> ${trip.tripStartDate}</p>
          <p><strong>Time:</strong> ${trip.tripTime}</p>
          ${vehicle ? `<p><strong>Vehicle:</strong> ${vehicle.carName} (${vehicle.carType})</p>` : ''}
          <p><strong>Total Amount:</strong> $${trip.total_price}</p>
        </div>
        
        <p>Please review and assign a driver if needed.</p>
      </div>
    `;
  }

  generateAdminNoVehicleHTML(trip, customer) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b6b;">No Vehicle Available - Action Required</h2>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Booking Request</h3>
          <p><strong>Customer:</strong> ${customer.firstName} ${customer.lastName}</p>
          <p><strong>Email:</strong> ${customer.email}</p>
          <p><strong>Phone:</strong> ${customer.phoneNo}</p>
          <p><strong>From:</strong> ${trip.pickupLocation}</p>
          <p><strong>To:</strong> ${trip.dropLocation}</p>
          <p><strong>Date:</strong> ${trip.tripStartDate}</p>
          <p><strong>Time:</strong> ${trip.tripTime}</p>
        </div>
        
        <p>Please contact the customer to discuss alternative options.</p>
      </div>
    `;
  }

  generateDriverBookingHTML(driver, trip, customer) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5aa0;">New Trip Assignment</h2>
        <p>Dear ${driver.driverName},</p>
        <p>You have been assigned a new trip.</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Trip Details</h3>
          <p><strong>Trip ID:</strong> ${trip.trip_id}</p>
          <p><strong>Customer:</strong> ${customer.firstName} ${customer.lastName}</p>
          <p><strong>Phone:</strong> ${customer.phoneNo}</p>
          <p><strong>From:</strong> ${trip.pickupLocation}</p>
          <p><strong>To:</strong> ${trip.dropLocation}</p>
          <p><strong>Date:</strong> ${trip.tripStartDate}</p>
          <p><strong>Time:</strong> ${trip.tripTime}</p>
        </div>
        
        <p>Please log into your dashboard to view full trip details and accept the assignment.</p>
        <a href="${process.env.FLEET_URL}/login" style="background: #2c5aa0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Trip</a>
        
        <p>Best regards,<br>eCharter Team</p>
      </div>
    `;
  }
}

module.exports = new EmailService();