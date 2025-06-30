const twilio = require('twilio');
require("dotenv").config();

class SMSService {
  constructor() {
    // Only initialize Twilio if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    } else {
      console.warn('Twilio credentials not provided. SMS service will be disabled.');
      this.client = null;
    }
  }

  async sendBookingConfirmation(phoneNumber, tripId, pickupLocation, tripDate) {
    if (!this.client) {
      console.log('SMS disabled - would send booking confirmation to:', phoneNumber);
      return;
    }

    const message = `eCharter: Your booking #${tripId} is confirmed! Pickup from ${pickupLocation} on ${tripDate}. Track your trip at ${process.env.FRONTEND_URL}/track/${tripId}`;
    
    try {
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });
    } catch (error) {
      console.error('SMS sending failed:', error);
    }
  }

  async sendTripStarted(phoneNumber, tripId, trackingUrl) {
    if (!this.client) {
      console.log('SMS disabled - would send trip started to:', phoneNumber);
      return;
    }

    const message = `eCharter: Your trip #${tripId} has started! Track your journey: ${trackingUrl}`;
    
    try {
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });
    } catch (error) {
      console.error('SMS sending failed:', error);
    }
  }

  async sendTripCompleted(phoneNumber, tripId) {
    if (!this.client) {
      console.log('SMS disabled - would send trip completed to:', phoneNumber);
      return;
    }

    const message = `eCharter: Your trip #${tripId} has been completed. Thank you for choosing eCharter!`;
    
    try {
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });
    } catch (error) {
      console.error('SMS sending failed:', error);
    }
  }

  async sendDriverAssignment(phoneNumber, tripId, customerName, pickupLocation) {
    if (!this.client) {
      console.log('SMS disabled - would send driver assignment to:', phoneNumber);
      return;
    }

    const message = `eCharter: New trip assignment #${tripId}. Customer: ${customerName}, Pickup: ${pickupLocation}. Check your dashboard for details.`;
    
    try {
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });
    } catch (error) {
      console.error('SMS sending failed:', error);
    }
  }
}

module.exports = new SMSService();