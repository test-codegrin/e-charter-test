# eCharter API Testing Guide

## 🧪 Sample Test Data Overview

The sample data includes:
- **5 Customers** with different profiles
- **8 Drivers** (5 fleet-based, 3 independent)
- **5 Fleet Companies** across major Canadian cities
- **16 Vehicles** of various types and sizes
- **10 Sample Trips** with different statuses
- **10 Invoices** with various payment states
- **Multiple Notifications** for testing

## 🔐 Test Credentials

### Customer Accounts
```
Email: john.smith@example.com
Email: sarah.johnson@example.com  
Email: michael.brown@example.com
Email: emily.davis@example.com
Email: david.wilson@example.com
Password: test123 (for all accounts)
```

### Driver Accounts
```
Fleet Drivers:
- james.wilson@torontoelite.com
- maria.rodriguez@vancouverluxury.com
- antoine.leblanc@montrealpremiier.com
- ryan.mitchell@calgarycharterco.com
- amanda.foster@ottawaexecutive.com

Independent Drivers:
- kevin.park@gmail.com
- sophie.martin@gmail.com
- carlos.santos@gmail.com

Password: test123 (for all accounts)
```

## 🧪 API Testing Scenarios

### 1. Customer Registration & Login
```bash
# Register new customer
POST /api/user/register
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "test123",
  "address": "123 Test Street",
  "cityName": "Toronto",
  "zipCord": "M5V3A8",
  "phoneNo": "4161234567"
}

# Login customer
POST /api/user/login
{
  "email": "john.smith@example.com",
  "password": "test123"
}
```

### 2. Get Quote for Trip
```bash
POST /api/pricing/quote
{
  "pickupLocation": "Toronto Pearson Airport",
  "pickupLatitude": 43.6777,
  "pickupLongitude": -79.6248,
  "dropLocation": "CN Tower, Toronto",
  "dropLatitude": 43.6426,
  "dropLongitude": -79.3871,
  "tripStartDate": "2025-01-15",
  "serviceType": "one-way",
  "mid_stops": []
}
```

### 3. Book Trip with Selected Vehicle
```bash
POST /api/trips/book
Authorization: Bearer <customer_token>
{
  "pickupLocation": "Toronto Pearson Airport",
  "pickupLatitude": 43.6777,
  "pickupLongitude": -79.6248,
  "dropLocation": "CN Tower, Toronto",
  "dropLatitude": 43.6426,
  "dropLongitude": -79.3871,
  "tripStartDate": "2025-01-15",
  "tripTime": "14:30:00",
  "selectedCarId": 1,
  "serviceType": "one-way",
  "mid_stops": []
}
```

### 4. Driver Operations
```bash
# Driver login
POST /api/driver/login
{
  "email": "james.wilson@torontoelite.com",
  "password": "test123"
}

# Start trip
POST /api/trips/4/start
Authorization: Bearer <driver_token>

# Update location
PUT /api/trips/4/location
Authorization: Bearer <driver_token>
{
  "latitude": 43.6500,
  "longitude": -79.4000
}

# Complete trip
POST /api/trips/4/complete
Authorization: Bearer <driver_token>
```

### 5. Customer Dashboard Data
```bash
# Get user trips
GET /api/trips/user-trips
Authorization: Bearer <customer_token>

# Get user invoices
GET /api/invoices/user-invoices
Authorization: Bearer <customer_token>

# Get notifications
GET /api/notifications/user
Authorization: Bearer <customer_token>
```

### 6. Admin Operations
```bash
# Get all drivers
GET /api/admin/alldrivers
Authorization: Bearer <admin_token>

# Get all vehicles
GET /api/admin/allcars
Authorization: Bearer <admin_token>

# Approve driver
POST /api/verification/approvedriver/1
Authorization: Bearer <admin_token>
{
  "status": 1
}

# Get all invoices
GET /api/invoices/admin/all
Authorization: Bearer <admin_token>
```

## 📊 Sample Trip Scenarios

### Scenario 1: Airport Transfer
- **Customer**: John Smith
- **Route**: Toronto Pearson → CN Tower
- **Vehicle**: Mercedes S-Class
- **Status**: Completed
- **Price**: $125.50

### Scenario 2: Multi-Stop Tour
- **Customer**: Emily Davis  
- **Route**: Calgary → Canmore → Lake Louise → Banff
- **Vehicle**: Mercedes Sprinter
- **Status**: Confirmed (upcoming)
- **Price**: $425.75

### Scenario 3: City Transfer
- **Customer**: Sarah Johnson
- **Route**: Vancouver Airport → Downtown
- **Vehicle**: Audi Q7
- **Status**: Completed
- **Price**: $98.75

## 🔍 Testing Checklist

### Customer Flow
- [ ] Registration with profile image
- [ ] Login and JWT token generation
- [ ] Get quote for different trip types
- [ ] Book trip with vehicle selection
- [ ] View trip history with filters
- [ ] Access invoices and billing
- [ ] Receive notifications

### Driver Flow  
- [ ] Driver registration and approval
- [ ] Add vehicles for approval
- [ ] Login and access assigned trips
- [ ] Start trip and update location
- [ ] Complete trip
- [ ] View earnings and trip history

### Admin Flow
- [ ] View all drivers and vehicles
- [ ] Approve/reject drivers and vehicles
- [ ] Monitor all trips and bookings
- [ ] Manage invoices and payments
- [ ] Access system notifications

### Notification Testing
- [ ] Email notifications sent correctly
- [ ] SMS notifications delivered
- [ ] In-app notifications created
- [ ] Notification read/unread status

### Pricing Testing
- [ ] Accurate distance calculation
- [ ] Correct pricing by vehicle type
- [ ] Tax calculation (13% HST)
- [ ] Multi-stop pricing
- [ ] Service type multipliers

## 🚀 Quick Start Testing

1. **Load sample data**:
   ```sql
   mysql -u username -p echarter < db/load_sample_data.sql
   ```

2. **Start the server**:
   ```bash
   npm run dev
   ```

3. **Test basic flow**:
   - Login as customer: `john.smith@example.com`
   - Get quote for Toronto airport transfer
   - Book trip with available vehicle
   - Login as driver: `james.wilson@torontoelite.com`
   - Start and complete the trip

4. **Verify notifications**:
   - Check email logs for notifications
   - Verify SMS delivery (if Twilio configured)
   - Check notification endpoints

This comprehensive test data allows you to test all aspects of the eCharter system without needing to create data manually.