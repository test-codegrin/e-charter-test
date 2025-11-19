import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000,
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle auth errors - FIXED to prevent redirect loops
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)

    // Only handle 401 errors if:
    // 1. Not on login page
    // 2. Not during login request
    // 3. User is actually logged in (has token)

    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/' || window.location.pathname.includes('/login')
      const isLoginRequest = error.config?.url?.includes('/login')
      const hasToken = localStorage.getItem('token')

      // Only redirect if user was logged in and this isn't a login-related request
      if (!isLoginPage && !isLoginRequest && hasToken) {
        console.log('401 error - clearing auth and redirecting to login')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password, role) => {
    console.log('Making login request to:', role === 'admin' ? '/admin/login' : '/driver/login')
    const endpoint = role === 'admin' ? '/admin/login' : '/driver/login'
    return api.post(endpoint, { email, password })
  }
}

// Admin API - Updated with correct endpoints
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),

  // Drivers
  getAllDrivers: (params = {}) => {
  const { page = 1, limit = 10 } = params;
  return api.get(`/admin/all-drivers?page=${page}&limit=${limit}`);
},
  addDriver: (driverData) => api.post('/driver/register', driverData),
  getDriverById: (driverId) => api.get(`/admin/driver/${driverId}`),
  approveDriver: (driverId, status, reason) => api.put(`/verification/approve-driver/${driverId}`, { status, reason }),
  deleteDriver: (driverId) => api.delete(`/admin/driver/${driverId}`),
  getVehicleByDriverId: (driverId) => api.get(`/admin/driver-vehicles/${driverId}`),
  getTripByDriverId: (driverId) => api.get(`/admin/driver-trips/${driverId}`),


  // Fleet Partners
  getAllFleetPartners: () => api.get('/admin/fleet-companies'),
  getFleetPartnerById: (fleetCompanyId) => api.get(`/admin/fleet-company/${fleetCompanyId}`),
  getAllFleetPartnersVehicles: (fleetCompanyId) => api.get(`/admin/fleet-company-vehicles/${fleetCompanyId}`),
  getAllFleetPartnersDrivers: (fleetCompanyId) => api.get(`/admin/fleet-company-drivers/${fleetCompanyId}`),
  updateFleetPartnerStatus: (companyId, status, reason) => api.put(`/verification/approve-fleet-company/${companyId}`, { status, reason }),

  // Vehicles
  getAllVehicles: () => api.get('/admin/all-vehicles'),
  getVehicleById: (vehicleId) => api.get(`/admin/vehicle/${vehicleId}`),  
  approveVehicle: (vehicleId, status, reason) => api.put(`/verification/approve-vehicle/${vehicleId}`, { status, reason }),
  deleteVehicle: (vehicleId) => api.delete(`/admin/vehicle/${vehicleId}`),

  // Trips
  getAllTrips: () => api.get('/admin/all-trips'),
  getTripById: (tripId) => api.get(`/admin/trip/${tripId}`),
  getTripDetails: (tripId) => api.get(`/trips/${tripId}`),
  updateTripStatus: (tripId, status) => api.put(`/trips/${tripId}/status`, { status }),

  // Invoices
  getAllInvoices: () => api.get('/invoices/admin/all'),
  updateInvoiceStatus: (invoiceId, status) => api.put(`/invoices/${invoiceId}/status`, { status }),

  // Notifications
  getNotifications: () => api.get('/notifications/admin'),
  markNotificationAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),

  // Payouts
  getPayoutSummary: () => api.get('/admin/payouts'),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (category, settings) => api.put('/admin/settings', { category, settings }),
  getSettingsByCategory: (category) => api.get(`/admin/settings/category/${category}`),
  getSettingsAuditLog: (params) => api.get('/admin/settings/audit/log', { params })
}

// Driver API - Updated with correct endpoints and vehicle CRUD
export const driverAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/driver/dashboard/stats'),

  // Trips
  getTrips: () => api.get('/driver/trips'),
  getTripById: (tripId) => api.get(`/driver/trip/${tripId}`),



  // Vehicles - ENHANCED CRUD operations
  getVehicles: () => api.get('/driver/vehicles'),
  getVehicleByDriverId: (driverId) => api.get(`/driver/vehicles/${driverId}`),
  getVehicleById: (vehicleId) => api.get(`/driver/vehicle/${vehicleId}`),
  uploadVehicleDocument : (documentData) => api.post(`/driver/vehicle/document/upload`, documentData),
  updateVehicleFeatures: (vehicleId, features) => api.put(`/driver/vehicle/features/${vehicleId}`, features),
  updateVehicleImage: (image) => api.put(`/driver/vehicle/image/upload`, image),
  

  // Profile
  getProfile: () => api.get('/driver/profile'),
  updateProfile: (profileData) => api.put('/driver/profile', profileData),
  updateProfilePhoto: (profilePhoto) => api.put('/driver/profile/photo', profilePhoto),
  uploadDocument: (documentData) => api.post('/driver/document/upload', documentData),

  // Settings
  getNotificationSettings: () => api.get('/driver/settings/notifications'),
  updateNotificationSettings: (settings) => api.put('/driver/settings/notifications', settings),
  getFleetSettings: () => api.get('/driver/settings/fleet'),
  updateFleetSettings: (settings) => api.put('/driver/settings/fleet', settings),
  getPaymentSettings: () => api.get('/driver/settings/payment'),
  updatePaymentSettings: (settings) => api.put('/driver/settings/payment', settings),

  // Notifications
  getNotifications: () => api.get('/notifications/driver'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`)
}

export default api