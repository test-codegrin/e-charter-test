const driverPostQueries = {

   insertCarQuery :  `
    INSERT INTO car (driver_id, carName, carNumber, carSize, carType)
    VALUES (?, ?, ?, ?, ?)`,
}

module.exports = driverPostQueries;