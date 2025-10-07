class PricingService {
  constructor() {
    // 🚗 Base pricing configuration by car type and size
    this.basePricing = {
      sedan: {
        small: { base: 50, perKm: 2.5, perHour: 25, midstop: 15 },
        medium: { base: 60, perKm: 3.0, perHour: 30, midstop: 20 },
        large: { base: 70, perKm: 3.5, perHour: 35, midstop: 25 }
      },
      suv: {
        small: { base: 70, perKm: 3.5, perHour: 35, midstop: 25 },
        medium: { base: 80, perKm: 4.0, perHour: 40, midstop: 30 },
        large: { base: 90, perKm: 4.5, perHour: 45, midstop: 35 }
      },
      van: {
        small: { base: 80, perKm: 4.0, perHour: 40, midstop: 30 },
        medium: { base: 100, perKm: 5.0, perHour: 50, midstop: 40 },
        large: { base: 120, perKm: 6.0, perHour: 60, midstop: 50 }
      },
      bus: {
        small: { base: 150, perKm: 7.5, perHour: 75, midstop: 60 },
        medium: { base: 200, perKm: 10.0, perHour: 100, midstop: 80 },
        large: { base: 250, perKm: 12.5, perHour: 125, midstop: 100 }
      }
    };

    this.taxRate = 0.13; // 13% HST (or can be adapted for other regions)
  }

  calculateTripPrice(tripData) {
    const {
      carType,
      carSize,
      distance_km,
      durationHours, // derived from travel_time / 3600
      midStopsCount = 0,
      serviceType = 'Single Trip'
    } = tripData;

    // ✅ Get base rate config
    const vehiclePricing = this.basePricing[carType?.toLowerCase()]?.[carSize?.toLowerCase()];
    if (!vehiclePricing) {
      throw new Error('Invalid carType or carSize');
    }

    // 🧮 Basic cost components
    const basePrice = vehiclePricing.base;
    const distancePrice = distance_km * vehiclePricing.perKm;
    const timePrice = durationHours * vehiclePricing.perHour;
    const midstopPrice = midStopsCount * vehiclePricing.midstop;

    // 🔄 Updated multipliers for your 3 service types
    const serviceMultipliers = {
      'single trip': 1.0,
      'round trip': 1.8,
      'multi stop': 1.3
    };

    const multiplier = serviceMultipliers[serviceType.toLowerCase()] || 1.0;

    // 💰 Subtotal + tax calculation
    const subtotal = (basePrice + distancePrice + timePrice + midstopPrice) * multiplier;
    const taxAmount = subtotal * this.taxRate;
    const totalPrice = subtotal + taxAmount;

    // ✅ Return detailed breakdown
    return {
      basePrice: +basePrice.toFixed(2),
      distancePrice: +distancePrice.toFixed(2),
      timePrice: +timePrice.toFixed(2),
      midstopPrice: +midstopPrice.toFixed(2),
      subtotal: +subtotal.toFixed(2),
      taxAmount: +taxAmount.toFixed(2),
      totalPrice: +totalPrice.toFixed(2),
      breakdown: {
        distance_km,
        durationHours,
        midStopsCount,
        serviceType,
        multiplier
      }
    };
  }

  // 🔁 Quote for multiple vehicles
  getVehicleQuote(vehicles, tripData) {
    return vehicles.map(vehicle => {
      const pricing = this.calculateTripPrice({
        ...tripData,
        carType: vehicle.carType,
        carSize: vehicle.carSize
      });

      return {
        ...vehicle,
        pricing
      };
    });
  }
}

module.exports = new PricingService();
