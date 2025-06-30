const verificationQueries = {

      updateDriverStatus: `UPDATE drivers SET status = ? WHERE driver_id = ?`,

      updateCarStatus: `UPDATE car SET status = ? WHERE car_id = ?`


}

module.exports = verificationQueries;