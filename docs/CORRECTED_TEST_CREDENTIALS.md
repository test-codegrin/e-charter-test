# eCharter Test Credentials (Corrected)

## 🔐 Test Account Credentials

All accounts use password: `test123`

### Customer Accounts
```
Existing Customer:
- Email: asdf@gmail.com (user_id: 4)
- Name: John asd
- City: Mumbai

New Test Customers:
- Email: sarah.johnson@example.com (user_id: 5)
- Name: Sarah Johnson
- City: Vancouver

- Email: michael.brown@example.com (user_id: 6)
- Name: Michael Brown  
- City: Montreal

- Email: emily.davis@example.com (user_id: 7)
- Name: Emily Davis
- City: Calgary

- Email: david.wilson@example.com (user_id: 8)
- Name: David Wilson
- City: Ottawa
```

### Driver Accounts
```
Existing Drivers:
- Email: asdf@gmail.com (driver_id: 1) - Status: Approved
- Email: test@gmail.com (driver_id: 2) - Status: Approved

New Test Drivers:
- Email: james.wilson@torontoelite.com (driver_id: 3)
- Email: maria.rodriguez@vancouverluxury.com (driver_id: 4)
- Email: antoine.leblanc@montrealpremiier.com (driver_id: 5)
- Email: ryan.mitchell@calgarycharterco.com (driver_id: 6)
- Email: amanda.foster@ottawaexecutive.com (driver_id: 7)
- Email: kevin.park@gmail.com (driver_id: 8) - Independent
- Email: sophie.martin@gmail.com (driver_id: 9) - Independent
- Email: carlos.santos@gmail.com (driver_id: 10) - Independent
```

### Admin Account
```
- Email: asdf@gmail.com (admin_id: 1)
- Name: test
```

## 🚗 Available Vehicles

### Existing Vehicles
- Honda City (car_id: 1) - Medium Sedan - Status: Pending
- Honda City (car_id: 2) - Medium Sedan - Status: Approved

### New Test Vehicles (All Approved)
- Mercedes-Benz S-Class (car_id: 3) - Large Sedan
- BMW 7 Series (car_id: 4) - Large Sedan  
- Audi Q7 (car_id: 5) - Large SUV
- Lexus LX 570 (car_id: 6) - Large SUV
- Cadillac Escalade (car_id: 7) - Large SUV
- Lincoln Navigator (car_id: 8) - Large SUV
- Mercedes Sprinter (car_id: 9) - Large Van
- Ford Transit (car_id: 10) - Medium Van
- Chrysler Pacifica (car_id: 11) - Medium Van
- Honda Pilot (car_id: 12) - Medium SUV
- Tesla Model S (car_id: 13) - Medium Sedan
- BMW X5 (car_id: 14) - Medium SUV
- Audi A8 (car_id: 15) - Large Sedan
- Range Rover (car_id: 16) - Large SUV

## 🧪 Sample Trip Data

### Completed Trips
1. **Toronto Airport Transfer** (trip_id: varies)
   - Customer: John (user_id: 4)
   - Route: Toronto Pearson → CN Tower
   - Vehicle: Mercedes S-Class
   - Price: $125.50

2. **Vancouver Airport Transfer**
   - Customer: Sarah (user_id: 5)
   - Route: Vancouver Airport → Downtown
   - Vehicle: Cadillac Escalade
   - Price: $98.75

3. **Montreal Airport Transfer**
   - Customer: Michael (user_id: 6)
   - Route: Montreal Airport → Old Montreal
   - Vehicle: Mercedes Sprinter
   - Price: $156.25

### In Progress Trips
4. **Calgary Airport Transfer**
   - Customer: Emily (user_id: 7)
   - Route: Calgary Airport → Downtown
   - Vehicle: Chrysler Pacifica
   - Price: $108.90

5. **Ottawa Airport Transfer**
   - Customer: David (user_id: 8)
   - Route: Ottawa Airport → Parliament Hill
   - Vehicle: Tesla Model S
   - Price: $89.65

### Upcoming Trips
6. **Toronto Return Trip**
   - Customer: John (user_id: 4)
   - Route: Union Station → Toronto Pearson
   - Vehicle: BMW 7 Series

7. **Multi-Stop Calgary Tour**
   - Customer: Emily (user_id: 7)
   - Route: Calgary → Canmore → Lake Louise → Banff
   - Vehicle: Honda Pilot
   - Price: $425.75

## 🚀 Quick Testing Steps

1. **Load the corrected data**:
   ```sql
   mysql -u username -p echarter < db/corrected_sample_data.sql
   ```

2. **Test customer login**:
   ```bash
   POST /api/user/login
   {
     "email": "asdf@gmail.com",
     "password": "test123"
   }
   ```

3. **Test driver login**:
   ```bash
   POST /api/driver/login
   {
     "email": "test@gmail.com", 
     "password": "test123"
   }
   ```

4. **Get user trips**:
   ```bash
   GET /api/trips/user-trips
   Authorization: Bearer <customer_token>
   ```

5. **Get approved vehicles**:
   ```bash
   GET /api/user/getapprovecars
   Authorization: Bearer <customer_token>
   ```

This corrected data works with your existing database structure and provides comprehensive test scenarios!