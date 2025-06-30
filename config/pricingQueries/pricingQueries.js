const pricingQueries = {
  insertPricing: `
    INSERT INTO trip_pricing (
      trip_id, base_price, distance_price, time_price, 
      midstop_price, tax_amount, total_price
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `,

  getPricingByTripId: `
    SELECT * FROM trip_pricing WHERE trip_id = ?
  `,

  getVehiclePricing: `
    SELECT * FROM vehicle_pricing 
    WHERE carType = ? AND carSize = ?
  `,

  insertVehiclePricing: `
    INSERT INTO vehicle_pricing (
      carType, carSize, base_rate, per_km_rate, 
      per_hour_rate, midstop_rate
    ) VALUES (?, ?, ?, ?, ?, ?)
  `,

  updateVehiclePricing: `
    UPDATE vehicle_pricing 
    SET base_rate = ?, per_km_rate = ?, per_hour_rate = ?, midstop_rate = ?
    WHERE pricing_id = ?
  `
};

module.exports = pricingQueries;