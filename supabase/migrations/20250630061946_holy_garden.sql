-- Enhanced eCharter Database Schema
-- This file contains additional tables needed for the complete system

-- Add missing columns to existing trips table
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_type VARCHAR(50) DEFAULT 'one-way',
ADD COLUMN IF NOT EXISTS current_latitude DECIMAL(10,8) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS current_longitude DECIMAL(11,8) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Vehicle Pricing Table
CREATE TABLE IF NOT EXISTS vehicle_pricing (
  pricing_id INT AUTO_INCREMENT PRIMARY KEY,
  carType VARCHAR(50) NOT NULL,
  carSize VARCHAR(50) NOT NULL,
  base_rate DECIMAL(8,2) NOT NULL DEFAULT 0,
  per_km_rate DECIMAL(8,2) NOT NULL DEFAULT 0,
  per_hour_rate DECIMAL(8,2) NOT NULL DEFAULT 0,
  midstop_rate DECIMAL(8,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_vehicle_type (carType, carSize)
);

-- Trip Pricing Table (for detailed pricing breakdown)
CREATE TABLE IF NOT EXISTS trip_pricing (
  pricing_id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  distance_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  time_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  midstop_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  invoice_id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  user_id INT NOT NULL,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('pending', 'paid', 'cancelled', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT NULL,
  payment_reference VARCHAR(255) DEFAULT NULL,
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  driver_id INT DEFAULT NULL,
  admin_id INT DEFAULT NULL,
  trip_id INT DEFAULT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES admin(admin_id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

-- Trip Status History Table (for tracking status changes)
CREATE TABLE IF NOT EXISTS trip_status_history (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by_user_id INT DEFAULT NULL,
  changed_by_driver_id INT DEFAULT NULL,
  changed_by_admin_id INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (changed_by_driver_id) REFERENCES drivers(driver_id) ON DELETE SET NULL,
  FOREIGN KEY (changed_by_admin_id) REFERENCES admin(admin_id) ON DELETE SET NULL
);

-- Driver Locations Table (for real-time tracking)
CREATE TABLE IF NOT EXISTS driver_locations (
  location_id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  trip_id INT DEFAULT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  speed DECIMAL(5,2) DEFAULT NULL,
  heading DECIMAL(5,2) DEFAULT NULL,
  accuracy DECIMAL(8,2) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE SET NULL,
  INDEX idx_driver_trip (driver_id, trip_id),
  INDEX idx_created_at (created_at)
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  payment_gateway VARCHAR(50) NOT NULL,
  gateway_transaction_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CAD',
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  gateway_response TEXT DEFAULT NULL,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE
);

-- Fleet Companies Table (for managing fleet operators)
CREATE TABLE IF NOT EXISTS fleet_companies (
  company_id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(50) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  business_license VARCHAR(255) DEFAULT NULL,
  insurance_info TEXT DEFAULT NULL,
  status TINYINT DEFAULT 0, -- 0: pending, 1: approved, 2: suspended
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Link drivers to fleet companies
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS fleet_company_id INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS driver_license VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS insurance_info TEXT DEFAULT NULL,
ADD FOREIGN KEY (fleet_company_id) REFERENCES fleet_companies(company_id) ON DELETE SET NULL;

-- Insert default vehicle pricing
INSERT IGNORE INTO vehicle_pricing (carType, carSize, base_rate, per_km_rate, per_hour_rate, midstop_rate) VALUES
('sedan', 'small', 50.00, 2.50, 25.00, 15.00),
('sedan', 'medium', 60.00, 3.00, 30.00, 20.00),
('sedan', 'large', 70.00, 3.50, 35.00, 25.00),
('suv', 'small', 70.00, 3.50, 35.00, 25.00),
('suv', 'medium', 80.00, 4.00, 40.00, 30.00),
('suv', 'large', 90.00, 4.50, 45.00, 35.00),
('van', 'small', 80.00, 4.00, 40.00, 30.00),
('van', 'medium', 100.00, 5.00, 50.00, 40.00),
('van', 'large', 120.00, 6.00, 60.00, 50.00),
('bus', 'small', 150.00, 7.50, 75.00, 60.00),
('bus', 'medium', 200.00, 10.00, 100.00, 80.00),
('bus', 'large', 250.00, 12.50, 125.00, 100.00);

-- Update trip status values to be more descriptive
ALTER TABLE trips MODIFY COLUMN status ENUM(
  'pending', 
  'confirmed', 
  'assigned', 
  'in_progress', 
  'completed', 
  'cancelled', 
  'no_vehicle_available'
) DEFAULT 'pending';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_user_status ON trips(user_id, status);
CREATE INDEX IF NOT EXISTS idx_trips_car_status ON trips(car_id, status);
CREATE INDEX IF NOT EXISTS idx_trips_date_status ON trips(tripStartDate, status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_driver_read ON notifications(driver_id, is_read);