const dashboardGetQueries = {
    getDashboardStats: `SELECT 
  -- Drivers
  (SELECT COUNT(*) FROM drivers WHERE is_deleted = 0) AS total_drivers,
  (SELECT COUNT(*) FROM drivers WHERE status = 'approved' AND is_deleted = 0) AS approved_drivers,
  (SELECT COUNT(*) FROM drivers WHERE status = 'in_review' AND is_deleted = 0) AS pending_drivers,
  
  -- Fleet Companies
  (SELECT COUNT(*) FROM fleet_companies WHERE is_deleted = 0) AS total_fleet_companies,
  (SELECT COUNT(*) FROM fleet_companies WHERE status = 'approved' AND is_deleted = 0) AS approved_fleet_companies,
  (SELECT COUNT(*) FROM fleet_companies WHERE status = 'in_review' AND is_deleted = 0) AS pending_fleet_companies,
  
  -- Vehicles
  (SELECT COUNT(*) FROM vehicle WHERE is_deleted = 0) AS total_vehicles,
  (SELECT COUNT(*) FROM vehicle WHERE status = 'approved' AND is_deleted = 0) AS approved_vehicles,
  (SELECT COUNT(*) FROM vehicle WHERE status = 'in_review' AND is_deleted = 0) AS pending_vehicles,
  
  -- Trips
  (SELECT COUNT(*) FROM trips) AS total_trips,
  (SELECT COUNT(*) FROM trips WHERE trip_status = 'completed') AS completed_trips,
  (SELECT COUNT(*) FROM trips WHERE trip_status = 'upcoming') AS upcoming_trips,
  (SELECT COUNT(*) FROM trips WHERE trip_status = 'running') AS running_trips,
  (SELECT COUNT(*) FROM trips WHERE trip_status = 'canceled') AS canceled_trips,
  
  -- Revenue (Total)
  (SELECT COALESCE(SUM(total_price), 0) FROM trips WHERE payment_status = 'completed') AS total_revenue,
  
  -- This Month Revenue
  (SELECT COALESCE(SUM(total_price), 0) 
   FROM trips 
   WHERE payment_status = 'completed' 
   AND YEAR(created_at) = YEAR(CURDATE()) 
   AND MONTH(created_at) = MONTH(CURDATE())
  ) AS this_month_revenue,
  
  -- Last Month Revenue
  (SELECT COALESCE(SUM(total_price), 0) 
   FROM trips 
   WHERE payment_status = 'completed' 
   AND YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) 
   AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
  ) AS last_month_revenue,
  
  -- This Month Trips
  (SELECT COUNT(*) 
   FROM trips 
   WHERE YEAR(created_at) = YEAR(CURDATE()) 
   AND MONTH(created_at) = MONTH(CURDATE())
  ) AS this_month_trips,
  
  -- Last Month Trips
  (SELECT COUNT(*) 
   FROM trips 
   WHERE YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) 
   AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
  ) AS last_month_trips,
  
  -- This Month Completed Trips
  (SELECT COUNT(*) 
   FROM trips 
   WHERE trip_status = 'completed'
   AND YEAR(created_at) = YEAR(CURDATE()) 
   AND MONTH(created_at) = MONTH(CURDATE())
  ) AS this_month_completed_trips,
  
  -- Last Month Completed Trips
  (SELECT COUNT(*) 
   FROM trips 
   WHERE trip_status = 'completed'
   AND YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) 
   AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
  ) AS last_month_completed_trips,
  
  -- Average Trip Price
  (SELECT COALESCE(AVG(total_price), 0) FROM trips WHERE payment_status = 'completed') AS avg_trip_price,
  
  -- Total Tax Collected
  (SELECT COALESCE(SUM(tax_amount), 0) FROM trips WHERE payment_status = 'completed') AS total_tax_collected`
}

module.exports = dashboardGetQueries;
