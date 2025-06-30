-- Corrected Sample Test Data for eCharter Database
-- This file works with existing database structure and avoids foreign key conflicts

-- First, let's add more users to work with (starting from user_id 5 to avoid conflicts)
INSERT INTO users (firstName, lastName, email, password, address, cityName, zipCord, phoneNo, profileImage) VALUES
('Sarah', 'Johnson', 'sarah.johnson@example.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '456 Queen Street', 'Vancouver', 'V6B1A1', '6041234567', 'https://example.com/profile2.jpg'),
('Michael', 'Brown', 'michael.brown@example.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '789 King Street', 'Montreal', 'H3A0G4', '5141234567', 'https://example.com/profile3.jpg'),
('Emily', 'Davis', 'emily.davis@example.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '321 Bay Street', 'Calgary', 'T2P2M5', '4031234567', 'https://example.com/profile4.jpg'),
('David', 'Wilson', 'david.wilson@example.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '654 Yonge Street', 'Ottawa', 'K1P5Z2', '6131234567', 'https://example.com/profile5.jpg');

-- Add more drivers (starting from driver_id 3 to avoid conflicts)
INSERT INTO drivers (driverName, email, password, address, cityName, status, zipCord, phoneNo) VALUES
('James Wilson', 'james.wilson@torontoelite.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '150 Front Street', 'Toronto', 1, 'M5J2N2', '4165556789'),
('Maria Rodriguez', 'maria.rodriguez@vancouverluxury.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '250 Robson Street', 'Vancouver', 1, 'V6B0E7', '6045557890'),
('Antoine Leblanc', 'antoine.leblanc@montrealpremiier.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '350 Rue Notre-Dame', 'Montreal', 1, 'H2Y1C6', '5145558901'),
('Ryan Mitchell', 'ryan.mitchell@calgarycharterco.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '450 8th Avenue SW', 'Calgary', 1, 'T2P1G4', '4035559012'),
('Amanda Foster', 'amanda.foster@ottawaexecutive.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '550 Somerset Street', 'Ottawa', 1, 'K1R5K1', '6135550123'),
('Kevin Park', 'kevin.park@gmail.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '600 Bloor Street', 'Toronto', 1, 'M4W1J1', '4165551234'),
('Sophie Martin', 'sophie.martin@gmail.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '700 Davie Street', 'Vancouver', 1, 'V6Z1B5', '6045552345'),
('Carlos Santos', 'carlos.santos@gmail.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '800 17th Avenue SW', 'Calgary', 1, 'T2S0B4', '4035553456');

-- Add more vehicles (starting from car_id 3 to avoid conflicts with existing cars)
INSERT INTO car (driver_id, carName, carNumber, carSize, carType, status) VALUES
-- Using existing approved driver (driver_id = 2) and new drivers
(2, 'Mercedes-Benz S-Class', 'ON-123-ABC', 'Large', 'Sedan', 1),
(2, 'BMW 7 Series', 'ON-234-DEF', 'Large', 'Sedan', 1),
(3, 'Audi Q7', 'BC-345-GHI', 'Large', 'SUV', 1),
(4, 'Lexus LX 570', 'BC-456-JKL', 'Large', 'SUV', 1),
(5, 'Cadillac Escalade', 'QC-567-MNO', 'Large', 'SUV', 1),
(6, 'Lincoln Navigator', 'QC-678-PQR', 'Large', 'SUV', 1),
(7, 'Mercedes Sprinter', 'AB-789-STU', 'Large', 'Van', 1),
(8, 'Ford Transit', 'AB-890-VWX', 'Medium', 'Van', 1),
(9, 'Chrysler Pacifica', 'ON-901-YZA', 'Medium', 'Van', 1),
(10, 'Honda Pilot', 'ON-012-BCD', 'Medium', 'SUV', 1),
(3, 'Tesla Model S', 'ON-123-EFG', 'Medium', 'Sedan', 1),
(4, 'BMW X5', 'ON-234-HIJ', 'Medium', 'SUV', 1),
(5, 'Audi A8', 'BC-345-KLM', 'Large', 'Sedan', 1),
(6, 'Range Rover', 'BC-456-NOP', 'Large', 'SUV', 1);

-- Now insert trips using existing user_id = 4 and new user IDs (5, 6, 7, 8)
INSERT INTO trips (user_id, car_id, pickupLocation, pickupLatitude, pickupLongitude, dropLocation, dropLatitude, dropLongitude, tripStartDate, tripEndDate, tripTime, durationHours, distance_km, status, total_price, base_price, tax_amount, service_type) VALUES
-- Completed trips
(4, 3, 'Toronto Pearson Airport', 43.6777, -79.6248, 'CN Tower, Toronto', 43.6426, -79.3871, '2024-12-15', '2024-12-15', '14:30:00', 1.5, 35.2, 'completed', 125.50, 111.50, 14.00, 'one-way'),
(5, 5, 'Vancouver International Airport', 49.1967, -123.1815, 'Downtown Vancouver', 49.2827, -123.1207, '2024-12-18', '2024-12-18', '16:45:00', 1.2, 28.5, 'completed', 98.75, 87.50, 11.25, 'one-way'),
(6, 7, 'Montreal-Trudeau Airport', 45.4706, -73.7408, 'Old Montreal', 45.5088, -73.5878, '2024-12-20', '2024-12-20', '19:15:00', 1.8, 42.3, 'completed', 156.25, 138.50, 17.75, 'one-way'),

-- In progress trips
(7, 9, 'Calgary International Airport', 51.1315, -114.0106, 'Calgary Downtown', 51.0447, -114.0719, '2024-12-28', '2024-12-28', '10:30:00', 1.3, 31.8, 'in_progress', 108.90, 96.50, 12.40, 'one-way'),
(8, 11, 'Ottawa Macdonald-Cartier Airport', 45.3225, -75.6692, 'Parliament Hill', 45.4215, -75.7002, '2024-12-28', '2024-12-28', '15:20:00', 1.1, 26.4, 'in_progress', 89.65, 79.50, 10.15, 'one-way'),

-- Confirmed trips (upcoming)
(4, 4, 'Union Station, Toronto', 43.6452, -79.3806, 'Toronto Pearson Airport', 43.6777, -79.6248, '2024-12-30', '2024-12-30', '08:00:00', 1.5, 35.2, 'confirmed', 125.50, 111.50, 14.00, 'one-way'),
(5, 6, 'Hotel Vancouver', 49.2827, -123.1207, 'Vancouver International Airport', 49.1967, -123.1815, '2025-01-02', '2025-01-02', '12:30:00', 1.2, 28.5, 'confirmed', 98.75, 87.50, 11.25, 'one-way'),
(6, 8, 'Fairmont Le Château Frontenac', 46.8123, -71.2047, 'Quebec City Airport', 46.7911, -71.3933, '2025-01-05', '2025-01-05', '14:45:00', 2.2, 52.8, 'confirmed', 189.30, 167.50, 21.80, 'one-way'),

-- Multi-stop trips
(7, 10, 'Calgary Downtown', 51.0447, -114.0719, 'Banff National Park', 51.4968, -115.9281, '2025-01-08', '2025-01-10', '09:00:00', 8.5, 128.7, 'confirmed', 425.75, 377.50, 48.25, 'multi-stop'),
(8, 12, 'Ottawa Downtown', 45.4215, -75.7002, 'Montreal Downtown', 45.5088, -73.5878, '2025-01-12', '2025-01-12', '11:30:00', 3.2, 198.5, 'confirmed', 298.65, 264.50, 34.15, 'one-way');

-- Insert mid stops for multi-stop trip (trip_id will be auto-generated, so we need to get the last inserted trip)
-- For the Calgary to Banff trip
INSERT INTO trip_midstops (trip_id, stopName, stopOrder, latitude, longitude, stayDuration) VALUES
((SELECT trip_id FROM trips WHERE pickupLocation = 'Calgary Downtown' AND dropLocation = 'Banff National Park' LIMIT 1), 'Canmore', 1, 51.0884, -115.3576, 2.0),
((SELECT trip_id FROM trips WHERE pickupLocation = 'Calgary Downtown' AND dropLocation = 'Banff National Park' LIMIT 1), 'Lake Louise', 2, 51.4254, -116.1773, 3.0);

-- Insert sample fleet companies (if the table exists)
INSERT IGNORE INTO fleet_companies (company_name, contact_person, email, phone, address, city, province, postal_code, business_license, insurance_info, status) VALUES
('Toronto Elite Transport', 'Robert Anderson', 'contact@torontoelite.com', '4165551234', '100 Adelaide Street West', 'Toronto', 'Ontario', 'M5H1S3', 'BL-2024-001', 'Policy #INS-001-2024', 1),
('Vancouver Luxury Cars', 'Lisa Chen', 'info@vancouverluxury.com', '6045552345', '200 Granville Street', 'Vancouver', 'British Columbia', 'V6C1S4', 'BL-2024-002', 'Policy #INS-002-2024', 1),
('Montreal Premier Service', 'Pierre Dubois', 'service@montrealpremiier.com', '5145553456', '300 Rue Saint-Jacques', 'Montreal', 'Quebec', 'H2Y1N9', 'BL-2024-003', 'Policy #INS-003-2024', 1),
('Calgary Charter Co', 'Jennifer Taylor', 'bookings@calgarycharterco.com', '4035554567', '400 Centre Street', 'Calgary', 'Alberta', 'T2G2B6', 'BL-2024-004', 'Policy #INS-004-2024', 1),
('Ottawa Executive Transport', 'Mark Thompson', 'exec@ottawaexecutive.com', '6135555678', '500 Sparks Street', 'Ottawa', 'Ontario', 'K1P5B4', 'BL-2024-005', 'Policy #INS-005-2024', 1);

-- Insert sample invoices (if the table exists)
INSERT IGNORE INTO invoices (trip_id, user_id, invoice_number, subtotal, tax_amount, total_amount, status, payment_method, payment_reference, paid_at) VALUES
((SELECT trip_id FROM trips WHERE user_id = 4 AND pickupLocation = 'Toronto Pearson Airport' LIMIT 1), 4, 'INV-2024-001', 111.50, 14.00, 125.50, 'paid', 'credit_card', 'CC-2024-001', '2024-12-15 15:45:00'),
((SELECT trip_id FROM trips WHERE user_id = 5 AND pickupLocation = 'Vancouver International Airport' LIMIT 1), 5, 'INV-2024-002', 87.50, 11.25, 98.75, 'paid', 'credit_card', 'CC-2024-002', '2024-12-18 17:30:00'),
((SELECT trip_id FROM trips WHERE user_id = 6 AND pickupLocation = 'Montreal-Trudeau Airport' LIMIT 1), 6, 'INV-2024-003', 138.50, 17.75, 156.25, 'paid', 'debit_card', 'DC-2024-001', '2024-12-20 20:00:00');

-- Insert sample notifications (if the table exists)
INSERT IGNORE INTO notifications (user_id, driver_id, admin_id, trip_id, type, title, message, is_read) VALUES
-- User notifications
(4, NULL, NULL, (SELECT trip_id FROM trips WHERE user_id = 4 AND pickupLocation = 'Toronto Pearson Airport' LIMIT 1), 'booking_confirmed', 'Booking Confirmed', 'Your trip booking has been confirmed for Dec 15, 2024', 1),
(4, NULL, NULL, (SELECT trip_id FROM trips WHERE user_id = 4 AND pickupLocation = 'Toronto Pearson Airport' LIMIT 1), 'trip_completed', 'Trip Completed', 'Your trip from Toronto Pearson Airport to CN Tower has been completed', 1),
(5, NULL, NULL, (SELECT trip_id FROM trips WHERE user_id = 5 AND pickupLocation = 'Vancouver International Airport' LIMIT 1), 'booking_confirmed', 'Booking Confirmed', 'Your trip booking has been confirmed for Dec 18, 2024', 1),
(6, NULL, NULL, (SELECT trip_id FROM trips WHERE user_id = 6 AND pickupLocation = 'Montreal-Trudeau Airport' LIMIT 1), 'booking_confirmed', 'Booking Confirmed', 'Your trip booking has been confirmed for Dec 20, 2024', 1),
(7, NULL, NULL, (SELECT trip_id FROM trips WHERE user_id = 7 AND pickupLocation = 'Calgary International Airport' LIMIT 1), 'trip_started', 'Trip Started', 'Your driver has started your trip. Track your journey here.', 0),
(8, NULL, NULL, (SELECT trip_id FROM trips WHERE user_id = 8 AND pickupLocation = 'Ottawa Macdonald-Cartier Airport' LIMIT 1), 'trip_started', 'Trip Started', 'Your driver has started your trip. Track your journey here.', 0);

-- Insert vehicle pricing data (if the table exists)
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

-- Show summary of loaded data
SELECT 'Data Loading Summary' as info;
SELECT 'Total Users:' as metric, COUNT(*) as count FROM users;
SELECT 'Total Drivers:' as metric, COUNT(*) as count FROM drivers;
SELECT 'Total Vehicles:' as metric, COUNT(*) as count FROM car;
SELECT 'Approved Vehicles:' as metric, COUNT(*) as count FROM car WHERE status = 1;
SELECT 'Total Trips:' as metric, COUNT(*) as count FROM trips;
SELECT 'Completed Trips:' as metric, COUNT(*) as count FROM trips WHERE status = 'completed';
SELECT 'In Progress Trips:' as metric, COUNT(*) as count FROM trips WHERE status = 'in_progress';
SELECT 'Confirmed Trips:' as metric, COUNT(*) as count FROM trips WHERE status = 'confirmed';