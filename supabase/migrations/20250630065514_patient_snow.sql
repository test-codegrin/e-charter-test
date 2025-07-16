-- Sample Test Data for eCharter Database
-- This file contains sample data for testing purposes (excluding admin data)

-- Insert sample users (customers)
INSERT INTO users (firstName, lastName, email, password, address, cityName, zipCode, phoneNo, profileImage) VALUES
('John', 'Smith', 'john.smith@example.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '123 Main Street', 'Toronto', 'M5V3A8', '4161234567', 'https://example.com/profile1.jpg'),
('Sarah', 'Johnson', 'sarah.johnson@example.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '456 Queen Street', 'Vancouver', 'V6B1A1', '6041234567', 'https://example.com/profile2.jpg'),
('Michael', 'Brown', 'michael.brown@example.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '789 King Street', 'Montreal', 'H3A0G4', '5141234567', 'https://example.com/profile3.jpg'),
('Emily', 'Davis', 'emily.davis@example.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '321 Bay Street', 'Calgary', 'T2P2M5', '4031234567', 'https://example.com/profile4.jpg'),
('David', 'Wilson', 'david.wilson@example.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '654 Yonge Street', 'Ottawa', 'K1P5Z2', '6131234567', 'https://example.com/profile5.jpg');

-- Insert sample fleet companies
INSERT INTO fleet_companies (company_name, contact_person, email, phone, address, city, province, postal_code, business_license, insurance_info, status) VALUES
('Toronto Elite Transport', 'Robert Anderson', 'contact@torontoelite.com', '4165551234', '100 Adelaide Street West', 'Toronto', 'Ontario', 'M5H1S3', 'BL-2024-001', 'Policy #INS-001-2024', 1),
('Vancouver Luxury Cars', 'Lisa Chen', 'info@vancouverluxury.com', '6045552345', '200 Granville Street', 'Vancouver', 'British Columbia', 'V6C1S4', 'BL-2024-002', 'Policy #INS-002-2024', 1),
('Montreal Premier Service', 'Pierre Dubois', 'service@montrealpremiier.com', '5145553456', '300 Rue Saint-Jacques', 'Montreal', 'Quebec', 'H2Y1N9', 'BL-2024-003', 'Policy #INS-003-2024', 1),
('Calgary Charter Co', 'Jennifer Taylor', 'bookings@calgarycharterco.com', '4035554567', '400 Centre Street', 'Calgary', 'Alberta', 'T2G2B6', 'BL-2024-004', 'Policy #INS-004-2024', 1),
('Ottawa Executive Transport', 'Mark Thompson', 'exec@ottawaexecutive.com', '6135555678', '500 Sparks Street', 'Ottawa', 'Ontario', 'K1P5B4', 'BL-2024-005', 'Policy #INS-005-2024', 1);

-- Insert sample drivers
INSERT INTO drivers (driverName, email, password, address, cityName, status, zipCode, phoneNo, fleet_company_id, driver_license, insurance_info) VALUES
('James Wilson', 'james.wilson@torontoelite.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '150 Front Street', 'Toronto', 1, 'M5J2N2', '4165556789', 1, 'DL-ON-123456', 'Driver Policy #DP-001'),
('Maria Rodriguez', 'maria.rodriguez@vancouverluxury.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '250 Robson Street', 'Vancouver', 1, 'V6B0E7', '6045557890', 2, 'DL-BC-234567', 'Driver Policy #DP-002'),
('Antoine Leblanc', 'antoine.leblanc@montrealpremiier.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '350 Rue Notre-Dame', 'Montreal', 1, 'H2Y1C6', '5145558901', 3, 'DL-QC-345678', 'Driver Policy #DP-003'),
('Ryan Mitchell', 'ryan.mitchell@calgarycharterco.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '450 8th Avenue SW', 'Calgary', 1, 'T2P1G4', '4035559012', 4, 'DL-AB-456789', 'Driver Policy #DP-004'),
('Amanda Foster', 'amanda.foster@ottawaexecutive.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '550 Somerset Street', 'Ottawa', 1, 'K1R5K1', '6135550123', 5, 'DL-ON-567890', 'Driver Policy #DP-005'),
-- Independent drivers
('Kevin Park', 'kevin.park@gmail.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '600 Bloor Street', 'Toronto', 1, 'M4W1J1', '4165551234', NULL, 'DL-ON-678901', 'Independent Policy #IP-001'),
('Sophie Martin', 'sophie.martin@gmail.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '700 Davie Street', 'Vancouver', 1, 'V6Z1B5', '6045552345', NULL, 'DL-BC-789012', 'Independent Policy #IP-002'),
('Carlos Santos', 'carlos.santos@gmail.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW', '800 17th Avenue SW', 'Calgary', 1, 'T2S0B4', '4035553456', NULL, 'DL-AB-890123', 'Independent Policy #IP-003');

-- Insert sample vehicles
INSERT INTO car (driver_id, carName, carNumber, carSize, carType, status) VALUES
-- Fleet company vehicles
(1, 'Mercedes-Benz S-Class', 'ON-123-ABC', 'Large', 'Sedan', 1),
(1, 'BMW 7 Series', 'ON-234-DEF', 'Large', 'Sedan', 1),
(2, 'Audi Q7', 'BC-345-GHI', 'Large', 'SUV', 1),
(2, 'Lexus LX 570', 'BC-456-JKL', 'Large', 'SUV', 1),
(3, 'Cadillac Escalade', 'QC-567-MNO', 'Large', 'SUV', 1),
(3, 'Lincoln Navigator', 'QC-678-PQR', 'Large', 'SUV', 1),
(4, 'Mercedes Sprinter', 'AB-789-STU', 'Large', 'Van', 1),
(4, 'Ford Transit', 'AB-890-VWX', 'Medium', 'Van', 1),
(5, 'Chrysler Pacifica', 'ON-901-YZA', 'Medium', 'Van', 1),
(5, 'Honda Pilot', 'ON-012-BCD', 'Medium', 'SUV', 1),
-- Independent driver vehicles
(6, 'Tesla Model S', 'ON-123-EFG', 'Medium', 'Sedan', 1),
(6, 'BMW X5', 'ON-234-HIJ', 'Medium', 'SUV', 1),
(7, 'Audi A8', 'BC-345-KLM', 'Large', 'Sedan', 1),
(7, 'Range Rover', 'BC-456-NOP', 'Large', 'SUV', 1),
(8, 'Mercedes E-Class', 'AB-567-QRS', 'Medium', 'Sedan', 1),
(8, 'Volvo XC90', 'AB-678-TUV', 'Medium', 'SUV', 1);

-- Insert sample trips with various statuses
INSERT INTO trips (user_id, car_id, pickupLocation, pickupLatitude, pickupLongitude, dropLocation, dropLatitude, dropLongitude, tripStartDate, tripEndDate, tripTime, durationHours, distance_km, status, total_price, base_price, tax_amount, service_type) VALUES
-- Completed trips
(1, 1, 'Toronto Pearson Airport', 43.6777, -79.6248, 'CN Tower, Toronto', 43.6426, -79.3871, '2024-12-15', '2024-12-15', '14:30:00', 1.5, 35.2, 'completed', 125.50, 111.50, 14.00, 'one-way'),
(2, 3, 'Vancouver International Airport', 49.1967, -123.1815, 'Downtown Vancouver', 49.2827, -123.1207, '2024-12-18', '2024-12-18', '16:45:00', 1.2, 28.5, 'completed', 98.75, 87.50, 11.25, 'one-way'),
(3, 5, 'Montreal-Trudeau Airport', 45.4706, -73.7408, 'Old Montreal', 45.5088, -73.5878, '2024-12-20', '2024-12-20', '19:15:00', 1.8, 42.3, 'completed', 156.25, 138.50, 17.75, 'one-way'),

-- In progress trips
(4, 7, 'Calgary International Airport', 51.1315, -114.0106, 'Calgary Downtown', 51.0447, -114.0719, '2024-12-28', '2024-12-28', '10:30:00', 1.3, 31.8, 'in_progress', 108.90, 96.50, 12.40, 'one-way'),
(5, 9, 'Ottawa Macdonald-Cartier Airport', 45.3225, -75.6692, 'Parliament Hill', 45.4215, -75.7002, '2024-12-28', '2024-12-28', '15:20:00', 1.1, 26.4, 'in_progress', 89.65, 79.50, 10.15, 'one-way'),

-- Confirmed trips (upcoming)
(1, 2, 'Union Station, Toronto', 43.6452, -79.3806, 'Toronto Pearson Airport', 43.6777, -79.6248, '2024-12-30', '2024-12-30', '08:00:00', 1.5, 35.2, 'confirmed', 125.50, 111.50, 14.00, 'one-way'),
(2, 4, 'Hotel Vancouver', 49.2827, -123.1207, 'Vancouver International Airport', 49.1967, -123.1815, '2025-01-02', '2025-01-02', '12:30:00', 1.2, 28.5, 'confirmed', 98.75, 87.50, 11.25, 'one-way'),
(3, 6, 'Fairmont Le Château Frontenac', 46.8123, -71.2047, 'Quebec City Airport', 46.7911, -71.3933, '2025-01-05', '2025-01-05', '14:45:00', 2.2, 52.8, 'confirmed', 189.30, 167.50, 21.80, 'one-way'),

-- Multi-stop trips
(4, 8, 'Calgary Downtown', 51.0447, -114.0719, 'Banff National Park', 51.4968, -115.9281, '2025-01-08', '2025-01-10', '09:00:00', 8.5, 128.7, 'confirmed', 425.75, 377.50, 48.25, 'multi-stop'),
(5, 10, 'Ottawa Downtown', 45.4215, -75.7002, 'Montreal Downtown', 45.5088, -73.5878, '2025-01-12', '2025-01-12', '11:30:00', 3.2, 198.5, 'confirmed', 298.65, 264.50, 34.15, 'one-way');

-- Insert mid stops for multi-stop trip
INSERT INTO trip_midstops (trip_id, stopName, stopOrder, latitude, longitude, stayDuration) VALUES
(9, 'Canmore', 1, 51.0884, -115.3576, 2.0),
(9, 'Lake Louise', 2, 51.4254, -116.1773, 3.0);

-- Insert sample invoices
INSERT INTO invoices (trip_id, user_id, invoice_number, subtotal, tax_amount, total_amount, status, payment_method, payment_reference, paid_at) VALUES
(1, 1, 'INV-2024-001', 111.50, 14.00, 125.50, 'paid', 'credit_card', 'CC-2024-001', '2024-12-15 15:45:00'),
(2, 2, 'INV-2024-002', 87.50, 11.25, 98.75, 'paid', 'credit_card', 'CC-2024-002', '2024-12-18 17:30:00'),
(3, 3, 'INV-2024-003', 138.50, 17.75, 156.25, 'paid', 'debit_card', 'DC-2024-001', '2024-12-20 20:00:00'),
(4, 4, 'INV-2024-004', 96.50, 12.40, 108.90, 'pending', NULL, NULL, NULL),
(5, 5, 'INV-2024-005', 79.50, 10.15, 89.65, 'pending', NULL, NULL, NULL),
(6, 1, 'INV-2024-006', 111.50, 14.00, 125.50, 'pending', NULL, NULL, NULL),
(7, 2, 'INV-2024-007', 87.50, 11.25, 98.75, 'pending', NULL, NULL, NULL),
(8, 3, 'INV-2024-008', 167.50, 21.80, 189.30, 'pending', NULL, NULL, NULL),
(9, 4, 'INV-2024-009', 377.50, 48.25, 425.75, 'pending', NULL, NULL, NULL),
(10, 5, 'INV-2024-010', 264.50, 34.15, 298.65, 'pending', NULL, NULL, NULL);

-- Insert sample notifications
INSERT INTO notifications (user_id, driver_id, admin_id, trip_id, type, title, message, is_read) VALUES
-- User notifications
(1, NULL, NULL, 1, 'booking_confirmed', 'Booking Confirmed', 'Your trip booking #1 has been confirmed for Dec 15, 2024', 1),
(1, NULL, NULL, 1, 'trip_completed', 'Trip Completed', 'Your trip from Toronto Pearson Airport to CN Tower has been completed', 1),
(1, NULL, NULL, 6, 'booking_confirmed', 'Booking Confirmed', 'Your trip booking #6 has been confirmed for Dec 30, 2024', 0),
(2, NULL, NULL, 2, 'booking_confirmed', 'Booking Confirmed', 'Your trip booking #2 has been confirmed for Dec 18, 2024', 1),
(2, NULL, NULL, 2, 'trip_completed', 'Trip Completed', 'Your trip from Vancouver Airport to Downtown has been completed', 1),
(3, NULL, NULL, 3, 'booking_confirmed', 'Booking Confirmed', 'Your trip booking #3 has been confirmed for Dec 20, 2024', 1),
(4, NULL, NULL, 4, 'trip_started', 'Trip Started', 'Your driver has started your trip. Track your journey here.', 0),
(5, NULL, NULL, 5, 'trip_started', 'Trip Started', 'Your driver has started your trip. Track your journey here.', 0),

-- Driver notifications
(NULL, 1, NULL, 1, 'trip_assigned', 'New Trip Assignment', 'You have been assigned trip #1 for Dec 15, 2024', 1),
(NULL, 1, NULL, 6, 'trip_assigned', 'New Trip Assignment', 'You have been assigned trip #6 for Dec 30, 2024', 0),
(NULL, 3, NULL, 2, 'trip_assigned', 'New Trip Assignment', 'You have been assigned trip #2 for Dec 18, 2024', 1),
(NULL, 5, NULL, 3, 'trip_assigned', 'New Trip Assignment', 'You have been assigned trip #3 for Dec 20, 2024', 1),
(NULL, 7, NULL, 4, 'trip_assigned', 'New Trip Assignment', 'You have been assigned trip #4 for Dec 28, 2024', 1),
(NULL, 9, NULL, 5, 'trip_assigned', 'New Trip Assignment', 'You have been assigned trip #5 for Dec 28, 2024', 1);

-- Insert sample trip pricing details
INSERT INTO trip_pricing (trip_id, base_price, distance_price, time_price, midstop_price, tax_amount, total_price) VALUES
(1, 60.00, 35.20, 37.50, 0.00, 14.00, 125.50),
(2, 70.00, 28.50, 30.00, 0.00, 11.25, 98.75),
(3, 80.00, 42.30, 45.00, 0.00, 17.75, 156.25),
(4, 70.00, 31.80, 32.50, 0.00, 12.40, 108.90),
(5, 60.00, 26.40, 27.50, 0.00, 10.15, 89.65),
(6, 60.00, 35.20, 37.50, 0.00, 14.00, 125.50),
(7, 70.00, 28.50, 30.00, 0.00, 11.25, 98.75),
(8, 80.00, 52.80, 55.00, 0.00, 21.80, 189.30),
(9, 100.00, 128.70, 212.50, 80.00, 48.25, 425.75),
(10, 80.00, 198.50, 99.00, 0.00, 34.15, 298.65);

-- Insert sample driver locations (for tracking)
INSERT INTO driver_locations (driver_id, trip_id, latitude, longitude, speed, heading, accuracy) VALUES
-- Current locations for in-progress trips
(7, 4, 51.0892, -114.0654, 45.5, 180.0, 5.0),
(9, 5, 45.3567, -75.6234, 52.3, 90.0, 3.2),
-- Historical locations
(1, 1, 43.6777, -79.6248, 0.0, 0.0, 2.1),
(1, 1, 43.6426, -79.3871, 0.0, 0.0, 2.5),
(3, 2, 49.1967, -123.1815, 0.0, 0.0, 3.8),
(3, 2, 49.2827, -123.1207, 0.0, 0.0, 2.9);

-- Insert sample payment transactions
INSERT INTO payment_transactions (invoice_id, payment_gateway, gateway_transaction_id, amount, currency, status, gateway_response, processed_at) VALUES
(1, 'stripe', 'pi_1234567890abcdef', 125.50, 'CAD', 'completed', '{"status": "succeeded", "payment_method": "card_1234"}', '2024-12-15 15:45:00'),
(2, 'stripe', 'pi_2345678901bcdefg', 98.75, 'CAD', 'completed', '{"status": "succeeded", "payment_method": "card_2345"}', '2024-12-18 17:30:00'),
(3, 'stripe', 'pi_3456789012cdefgh', 156.25, 'CAD', 'completed', '{"status": "succeeded", "payment_method": "card_3456"}', '2024-12-20 20:00:00');

-- Insert sample trip status history
INSERT INTO trip_status_history (trip_id, old_status, new_status, changed_by_user_id, notes) VALUES
(1, 'pending', 'confirmed', NULL, 'Vehicle assigned automatically'),
(1, 'confirmed', 'in_progress', NULL, 'Driver started the trip'),
(1, 'in_progress', 'completed', NULL, 'Trip completed successfully'),
(2, 'pending', 'confirmed', NULL, 'Vehicle assigned automatically'),
(2, 'confirmed', 'in_progress', NULL, 'Driver started the trip'),
(2, 'in_progress', 'completed', NULL, 'Trip completed successfully'),
(3, 'pending', 'confirmed', NULL, 'Vehicle assigned automatically'),
(3, 'confirmed', 'in_progress', NULL, 'Driver started the trip'),
(3, 'in_progress', 'completed', NULL, 'Trip completed successfully'),
(4, 'pending', 'confirmed', NULL, 'Vehicle assigned automatically'),
(4, 'confirmed', 'in_progress', NULL, 'Driver started the trip'),
(5, 'pending', 'confirmed', NULL, 'Vehicle assigned automatically'),
(5, 'confirmed', 'in_progress', NULL, 'Driver started the trip');