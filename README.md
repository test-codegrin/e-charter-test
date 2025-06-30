# eCharter Backend API

A comprehensive backend system for eCharter - a marketplace for ground passenger charter transportation services in Canada.

## 🚀 Features

### Core Functionality
- **User Management**: Customer, Driver, and Admin authentication and profiles
- **Vehicle Management**: Car registration, approval, and fleet management
- **Trip Booking**: Complete booking system with multi-stop support
- **Real-time Pricing**: Dynamic pricing based on distance, time, and vehicle type
- **Invoice Management**: Automated invoice generation and payment tracking
- **Live Tracking**: Real-time trip tracking and location updates
- **Notification System**: Email and SMS notifications for all stakeholders

### Service Types
- One-way trips
- Round-trip journeys
- Multi-stop itineraries
- Multi-day bookings (planned)

### Pricing System
- Base rates by vehicle type and size
- Distance-based pricing
- Time-based charges
- Mid-stop fees
- Canadian HST (13%) tax calculation
- Service type multipliers

### Communication
- **Email Notifications**:
  - Booking confirmations
  - Trip status updates
  - Invoice delivery
  - Driver assignments
  - Admin notifications
- **SMS Notifications**:
  - Booking confirmations
  - Trip start alerts
  - Completion notifications

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT
- **Email**: Nodemailer (Gmail)
- **SMS**: Twilio
- **File Upload**: ImageKit
- **Password Hashing**: bcrypt

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Gmail account (for email notifications)
- Twilio account (for SMS notifications)
- ImageKit account (for file uploads)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd echarter-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   # Import the main database schema
   mysql -u your_username -p echarter < db/echarter.sql
   
   # Import enhanced schema for new features
   mysql -u your_username -p echarter < db/enhanced_schema.sql
   ```

4. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual configuration values
   nano .env
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Main Endpoints

#### User Authentication
- `POST /user/register` - Register new customer
- `POST /user/login` - Customer login
- `POST /user/requestreset` - Request password reset
- `POST /user/verifyresetcode` - Verify reset code
- `POST /user/resetpassword` - Reset password

#### Driver Authentication
- `POST /driver/register` - Register new driver
- `POST /driver/login` - Driver login
- `POST /driver/addcar` - Add vehicle
- `GET /driver/getdrivercar` - Get driver's vehicles

#### Admin Functions
- `POST /admin/register` - Register admin
- `POST /admin/login` - Admin login
- `GET /admin/alldrivers` - Get all drivers
- `GET /admin/allcars` - Get all vehicles
- `POST /verification/approvedriver/:driver_id` - Approve/reject driver
- `POST /verification/approvecar/:car_id` - Approve/reject vehicle

#### Pricing & Booking
- `POST /pricing/quote` - Get trip quote
- `POST /trips/book` - Book trip with pricing
- `GET /trips/user-trips` - Get user's trips
- `GET /trips/:trip_id` - Get trip details

#### Trip Management (Driver)
- `POST /trips/:trip_id/start` - Start trip
- `PUT /trips/:trip_id/location` - Update location
- `POST /trips/:trip_id/complete` - Complete trip

#### Invoicing
- `GET /invoices/user-invoices` - Get user invoices
- `GET /invoices/:invoice_id` - Get invoice details
- `PUT /invoices/:invoice_id/status` - Update invoice status

#### Notifications
- `GET /notifications/user` - Get user notifications
- `GET /notifications/driver` - Get driver notifications
- `GET /notifications/admin` - Get admin notifications
- `PUT /notifications/:notification_id/read` - Mark as read

## 🗄 Database Schema

### Core Tables
- `users` - Customer information
- `drivers` - Driver profiles
- `admin` - Admin accounts
- `car` - Vehicle information
- `trips` - Trip bookings
- `trip_midstops` - Multi-stop details

### Enhanced Tables
- `vehicle_pricing` - Pricing configuration
- `trip_pricing` - Detailed pricing breakdown
- `invoices` - Invoice management
- `notifications` - System notifications
- `driver_locations` - Real-time tracking
- `payment_transactions` - Payment records
- `fleet_companies` - Fleet management

## 🔧 Configuration

### Required Environment Variables

```env
# Database
MYSQL_HOST=localhost
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=echarter

# Security
JWT_SECRET=your_jwt_secret

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=admin@echarter.co

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number

# File Upload (ImageKit)
IMAGEKIT_PUBLIC_KEY=your_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_endpoint

# Frontend URLs
FRONTEND_URL=https://echarter.co
ADMIN_URL=https://admin.echarter.co
FLEET_URL=https://fleet.echarter.co
```

## 🚦 API Flow

### Customer Booking Flow
1. Customer requests quote (`POST /pricing/quote`)
2. System calculates pricing and shows available vehicles
3. Customer selects vehicle and books trip (`POST /trips/book`)
4. System sends confirmations to all parties
5. Driver starts trip (`POST /trips/:id/start`)
6. Customer receives tracking link
7. Driver completes trip (`POST /trips/:id/complete`)
8. Invoice is finalized

### Notification Flow
- **Booking Confirmed**: Customer, Admin, Driver
- **Trip Started**: Customer (with tracking link)
- **Trip Completed**: Customer
- **No Vehicle Available**: Customer, Admin

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Rate limiting (recommended for production)

## 📱 Mobile Integration

The API is designed to support mobile applications with:
- RESTful endpoints
- JSON responses
- Real-time location updates
- Push notification support (via third-party services)

## 🚀 Deployment

### Production Considerations
1. Set `NODE_ENV=production`
2. Use environment variables for all secrets
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Implement rate limiting
6. Set up monitoring and logging
7. Configure database connection pooling

### Recommended Hosting
- **API**: AWS EC2, DigitalOcean, or Heroku
- **Database**: AWS RDS MySQL or managed MySQL service
- **File Storage**: AWS S3 or ImageKit CDN

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Health check
curl http://localhost:3000/health
```

## 📞 Support

For technical support or questions:
- Email: tech@echarter.co
- Documentation: [API Docs](https://docs.echarter.co)

## 📄 License

This project is proprietary software owned by eCharter Inc.

---

**eCharter** - Connecting Canada through reliable charter transportation services.