import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminDrivers from './pages/admin/Drivers'
import AdminVehicles from './pages/admin/Vehicles'
import AdminTrips from './pages/admin/Trips'
import AdminInvoices from './pages/admin/Invoices'
import AdminNotifications from './pages/admin/Notifications'

// Driver Pages
import DriverDashboard from './pages/driver/Dashboard'
import DriverTrips from './pages/driver/Trips'
import DriverVehicles from './pages/driver/Vehicles'
import DriverProfile from './pages/driver/Profile'

function App() {
  const { user, loading } = useAuth()

  console.log('App render - User:', user, 'Loading:', loading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    console.log('No user found, showing login')
    return <Login />
  }

  console.log('User authenticated, role:', user.role)

  return (
    <Layout>
      <Routes>
        {/* Admin Routes */}
        {user.role === 'admin' && (
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/drivers" element={<AdminDrivers />} />
            <Route path="/admin/vehicles" element={<AdminVehicles />} />
            <Route path="/admin/trips" element={<AdminTrips />} />
            <Route path="/admin/invoices" element={<AdminInvoices />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
          </>
        )}

        {/* Driver Routes */}
        {user.role === 'driver' && (
          <>
            <Route path="/" element={<DriverDashboard />} />
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
            <Route path="/driver/trips" element={<DriverTrips />} />
            <Route path="/driver/vehicles" element={<DriverVehicles />} />
            <Route path="/driver/profile" element={<DriverProfile />} />
          </>
        )}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App