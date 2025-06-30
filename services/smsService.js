const twilio = require('twilio');
require("dotenv").config();

class SMSService {
  constructor() {
    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendBookingConfirmation(phoneNumber, tripId, pickupLocation, tripDate) {
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