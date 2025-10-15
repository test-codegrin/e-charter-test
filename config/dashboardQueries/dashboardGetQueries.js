const dashboardGetQueries = {
    getDashboardStats: `SELECT 
(SELECT COUNT(*) from drivers where is_deleted = 0) as total_drivers,
(SELECT COUNT(*) from vehicle where is_deleted = 0) as total_vehicles,
(SELECT COUNT(*) from drivers where status='approved' and is_deleted = 0) as approved_drivers,
(SELECT COUNT(*) from drivers where status='in_review' and is_deleted = 0) as pending_drivers,
(SELECT COUNT(*) from vehicle where status='approved' and is_deleted = 0) as approved_vehicles,
(SELECT COUNT(*) from vehicle where status='in_review' and is_deleted = 0) as pending_vehicles`,
}

module.exports = dashboardGetQueries;
