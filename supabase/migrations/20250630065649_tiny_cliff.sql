-- Load Sample Data Script
-- Run this after setting up the main database and enhanced schema

-- First, ensure the enhanced schema is loaded
SOURCE enhanced_schema.sql;

-- Then load the sample data
SOURCE sample_data.sql;

-- Verify data loading
SELECT 'Users loaded:' as info, COUNT(*) as count FROM users;
SELECT 'Drivers loaded:' as info, COUNT(*) as count FROM drivers;
SELECT 'Fleet companies loaded:' as info, COUNT(*) as count FROM fleet_companies;
SELECT 'Vehicles loaded:' as info, COUNT(*) as count FROM car;
SELECT 'Trips loaded:' as info, COUNT(*) as count FROM trips;
SELECT 'Invoices loaded:' as info, COUNT(*) as count FROM invoices;
SELECT 'Notifications loaded:' as info, COUNT(*) as count FROM notifications;

-- Show sample data overview
SELECT 
    'Sample Overview' as section,
    (SELECT COUNT(*) FROM users) as customers,
    (SELECT COUNT(*) FROM drivers) as drivers,
    (SELECT COUNT(*) FROM fleet_companies) as fleet_companies,
    (SELECT COUNT(*) FROM car WHERE status = 1) as active_vehicles,
    (SELECT COUNT(*) FROM trips) as total_trips,
    (SELECT COUNT(*) FROM trips WHERE status = 'completed') as completed_trips,
    (SELECT COUNT(*) FROM trips WHERE status = 'in_progress') as active_trips,
    (SELECT COUNT(*) FROM invoices WHERE status = 'paid') as paid_invoices;