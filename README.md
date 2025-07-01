# eCharter - Ground Transportation Charter Marketplace

A comprehensive platform for ground passenger charter transportation services in Canada, connecting customers with drivers and fleet partners.

## 🚀 Features

### Core Functionality
- **User Management**: Customer, Driver, Fleet Partner, and Admin roles with dedicated portals
- **Vehicle Management**: Comprehensive vehicle registration, approval, and fleet management
- **Trip Booking**: Complete booking system with multi-stop support and real-time pricing
- **Dynamic Pricing**: Sophisticated pricing based on distance, time, vehicle type, and service type
- **Invoice Management**: Automated invoice generation and payment tracking
- **Live Tracking**: Real-time trip tracking with location updates
- **Notification System**: Email, SMS, and in-app notifications for all stakeholders
- **Fleet Partner Portal**: Dedicated management system for transportation companies
- **Admin Dashboard**: Comprehensive admin panel with analytics and approval workflows

### Service Types
- One-way trips
- Round-trip journeys
- Multi-stop itineraries
- Multi-day bookings
- Corporate events
- Airport transfers
- Wedding transportation
- Tour services

### Pricing System
- Base rates by vehicle type and size
- Distance-based pricing
- Time-based charges
- Mid-stop fees
- Canadian HST (13%) tax calculation
- Service type multipliers
- Special rates for fleet partners

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
- **In-App Notifications**:
  - Real-time updates
  - Approval notifications
  - Payment confirmations

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT
- **Email**: Nodemailer
- **SMS**: Twilio
- **File Upload**: ImageKit
- **Password Hashing**: bcrypt

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Charts**: Recharts
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Email service account (for notifications)
- Twilio account (for SMS notifications)
- ImageKit account (for file uploads)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd echarter
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Database Setup**
   ```bash
   # Import the main database schema
   mysql -u your_username -p echarter < db/echarter.sql
   ```

5. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual configuration values
   nano .env
   ```

6. **Start the development servers**
   ```bash
   # Start backend server (from root directory)
   npm run dev
   
   # Start frontend server (from client directory)
   cd client
   npm run dev
   ```

## 🚀 Project Structure

```
echarter/
├── client/                  # Frontend React application
│   ├── public/              # Static assets
│   ├── src/                 # React source code
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (Auth, etc.)
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin portal pages
│   │   │   ├── driver/      # Driver portal pages
│   │   │   └── public/      # Public pages
│   │   └── services/        # API services
│   ├── index.html           # HTML entry point
│   └── vite.config.js       # Vite configuration
├── config/                  # Backend configuration
│   ├── adminQueries/        # Admin SQL queries
│   ├── driverQueries/       # Driver SQL queries
│   ├── userQueries/         # User SQL queries
│   └── db.js                # Database connection
├── controller/              # API controllers
├── middleware/              # Express middleware
├── routes/                  # API routes
├── services/                # Backend services
├── db/                      # Database scripts
└── server.js                # Express server entry point
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Main Endpoints

#### Authentication
- `POST /admin/login` - Admin login
- `POST /driver/login` - Driver login
- `POST /user/login` - Customer login

#### Admin Management
- `GET /admin/dashboard/stats` - Get admin dashboard statistics
- `GET /admin/alldrivers` - Get all drivers
- `GET /admin/allcars` - Get all vehicles
- `GET /admin/alltrips` - Get all trips
- `GET /admin/fleet-partners` - Get all fleet partners
- `GET /admin/payouts` - Get payout summary
- `GET /admin/settings` - Get system settings
- `PUT /admin/settings` - Update system settings

#### Driver Management
- `GET /driver/dashboard/stats` - Get driver dashboard statistics
- `GET /driver/trips` - Get driver trips
- `GET /driver/profile` - Get driver profile
- `PUT /driver/profile` - Update driver profile
- `GET /driver/getdrivercar` - Get driver vehicles
- `POST /driver/addcar` - Add new vehicle

#### Trip Management
- `POST /trips/book` - Book a new trip
- `GET /trips/user-trips` - Get user trips
- `GET /trips/:trip_id` - Get trip details
- `POST /trips/:trip_id/start` - Start trip
- `POST /trips/:trip_id/complete` - Complete trip

#### Pricing
- `POST /pricing/quote` - Get trip quote

#### Invoices
- `GET /invoices/admin/all` - Get all invoices
- `GET /invoices/user-invoices` - Get user invoices
- `PUT /invoices/:invoice_id/status` - Update invoice status

#### Notifications
- `GET /notifications/admin` - Get admin notifications
- `GET /notifications/driver` - Get driver notifications
- `GET /notifications/user` - Get user notifications

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

# Email
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
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Sensitive data protection

## 📱 Mobile Integration

The API is designed to support mobile applications with:
- RESTful endpoints
- JSON responses
- Real-time location updates
- Push notification support

## 🧪 Testing

The system includes test data for comprehensive testing:
- Sample customers, drivers, and fleet partners
- Test vehicles of various types and sizes
- Sample trips with different statuses
- Test invoices and payment records

For testing credentials and data, refer to:
- `docs/API_TESTING_GUIDE.md`
- `docs/CORRECTED_TEST_CREDENTIALS.md`

## 🚀 Deployment

### Production Considerations
1. Set `NODE_ENV=production`
2. Use environment variables for all secrets
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Implement rate limiting
6. Set up monitoring and logging
7. Configure database connection pooling

## 📞 Support

For technical support or questions:
- Email: support@echarter.co

## 🔄 Continuous Improvement

The eCharter platform is continuously being improved with:
- Enhanced fleet partner management
- Advanced booking features
- Improved real-time tracking
- Expanded payment options
- Mobile applications
- Business intelligence and reporting

---

**eCharter** - Connecting Canada through reliable charter transportation services.