-- Enhanced Fleet Partner Database Schema (FIXED)
-- This adds the missing fields for comprehensive fleet partner registration

-- Add missing columns to drivers table for fleet partners
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS legal_entity_type ENUM('corporation', 'partnership', 'sole_proprietorship', 'llc', 'other') DEFAULT NULL,
ADD COLUMN IF NOT EXISTS business_address TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contact_person_name VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contact_person_position VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fleet_size INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_areas TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS operating_hours VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS years_experience INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS safety_protocols TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS insurance_policy_number VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS business_license_number VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS certifications TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS client_references TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS additional_services TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sustainability_practices TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS special_offers TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS technology_agreement BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS communication_channels TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS registration_type ENUM('individual', 'fleet_partner') DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;

-- Enhanced car table for fleet vehicles
ALTER TABLE car 
ADD COLUMN IF NOT EXISTS bus_capacity INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS vehicle_age INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS vehicle_condition ENUM('excellent', 'good', 'fair', 'needs_maintenance') DEFAULT 'good',
ADD COLUMN IF NOT EXISTS specialized_services TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vehicle_features TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS maintenance_schedule TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS insurance_expiry DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS license_plate_expiry DATE DEFAULT NULL;

-- Fleet partner documents table
CREATE TABLE IF NOT EXISTS fleet_documents (
  document_id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  document_type ENUM('insurance', 'business_license', 'vehicle_permit', 'safety_certificate', 'other') NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_url TEXT NOT NULL,
  expiry_date DATE DEFAULT NULL,
  status ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP NULL,
  verified_by INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES admin(admin_id) ON DELETE SET NULL
);

-- Fleet partner service areas table
CREATE TABLE IF NOT EXISTS fleet_service_areas (
  area_id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(50) NOT NULL,
  coverage_radius INT DEFAULT 50, -- in kilometers
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE
);

-- Fleet partner certifications table
CREATE TABLE IF NOT EXISTS fleet_certifications (
  certification_id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  certification_name VARCHAR(255) NOT NULL,
  issuing_authority VARCHAR(255) NOT NULL,
  certification_number VARCHAR(255) DEFAULT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE DEFAULT NULL,
  status ENUM('active', 'expired', 'suspended') DEFAULT 'active',
  document_url TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE
);

-- Fleet partner references table
CREATE TABLE IF NOT EXISTS fleet_references (
  reference_id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_contact VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) DEFAULT NULL,
  client_phone VARCHAR(20) DEFAULT NULL,
  service_period VARCHAR(100) DEFAULT NULL,
  service_description TEXT DEFAULT NULL,
  reference_status ENUM('pending', 'verified', 'unverified') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE
);

-- Update vehicle pricing for bus types
INSERT IGNORE INTO vehicle_pricing (carType, carSize, base_rate, per_km_rate, per_hour_rate, midstop_rate) VALUES
('mini-bus', 'small', 120.00, 6.00, 60.00, 40.00),
('mini-bus', 'medium', 150.00, 7.50, 75.00, 50.00),
('coach', 'medium', 200.00, 10.00, 100.00, 75.00),
('coach', 'large', 250.00, 12.50, 125.00, 100.00),
('luxury-coach', 'large', 300.00, 15.00, 150.00, 125.00);