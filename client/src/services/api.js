import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
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
  getAllDrivers: () => api.get('/admin/alldrivers'),
  approveDriver: (driverId, status) => api.post(`/verification/approvedriver/${driverId}`, { status }),
  
  // Vehicles
  getAllVehicles: () => api.get('/admin/allcars'),
  approveVehicle: (carId, status) => api.post(`/verification/approvecar/${carId}`, { status }),
  
  // Trips
  getAllTrips: () => api.get('/admin/alltrips'),
  getTripDetails: (tripId) => api.get(`/trips/${tripId}`),
  updateTripStatus: (tripId, status) => api.put(`/trips/${tripId}/status`, { status }),
  
  // Invoices
  getAllInvoices: () => api.get('/invoices/admin/all'),
  updateInvoiceStatus: (invoiceId, status) => api.put(`/invoices/${invoiceId}/status`, { status }),
  
  // Notifications
  getNotifications: () => api.get('/notifications/admin'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read')
}

// Driver API - Updated with correct endpoints
export const driverAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/driver/dashboard/stats'),
  
  // Trips
  getTrips: () => api.get('/driver/trips'),
  getTripDetails: (tripId) => api.get(`/trips/${tripId}`),
  startTrip: (tripId) => api.post(`/trips/${tripId}/start`),
  completeTrip: (tripId) => api.post(`/trips/${tripId}/complete`),
  updateLocation: (tripId, location) => api.put(`/trips/${tripId}/location`, location),
  
  // Vehicles
  getVehicles: () => api.get('/driver/getdrivercar'),
  addVehicle: (vehicleData) => api.post('/driver/addcar', vehicleData),
  
  // Profile
  getProfile: () => api.get('/driver/profile'),
  updateProfile: (profileData) => api.put('/driver/profile', profileData),
  
  // Notifications
  getNotifications: () => api.get('/notifications/driver'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`)
}

export default api