class PricingService {
  constructor() {
    // Base pricing configuration
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

    this.taxRate = 0.13; // 13% HST for Canada
  }

  calculateTripPrice(tripData) {
    const { carType, carSize, distance_km, durationHours, midStopsCount, serviceType } = tripData;
    
    // Get base pricing for vehicle type and size
    const vehiclePricing = this.basePricing[carType.toLowerCase()]?.[carSize.toLowerCase()];
    if (!vehiclePricing) {
      throw new Error('Invalid vehicle type or size');
    }

    // Calculate base components
    let basePrice = vehiclePricing.base;
    let distancePrice = distance_km * vehiclePricing.perKm;
    let timePrice = durationHours * vehiclePricing.perHour;
    let midstopPrice = midStopsCount * vehiclePricing.midstop;

    // Apply service type multipliers
    const serviceMultipliers = {
      'one-way': 1.0,
      'round-trip': 1.8, // Slight discount for round trip
      'multi-stop': 1.1,
      'multi-day': 1.2
    };

    const multiplier = serviceMultipliers[serviceType] || 1.0;
    
    // Calculate subtotal
    const subtotal = (basePrice + distancePrice + timePrice + midstopPrice) * multiplier;
    
    // Calculate tax
    const taxAmount = subtotal * this.taxRate;
    
    // Calculate total
    const totalPrice = subtotal + taxAmount;

    return {
      basePrice: parseFloat(basePrice.toFixed(2)),
      distancePrice: parseFloat(distancePrice.toFixed(2)),
      timePrice: parseFloat(timePrice.toFixed(2)),
      midstopPrice: parseFloat(midstopPrice.toFixed(2)),
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      breakdown: {
        distance_km,
        durationHours,
        midStopsCount,
        serviceType,
        multiplier
      }
    };
  }

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