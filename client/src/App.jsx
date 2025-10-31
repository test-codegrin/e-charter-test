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
import FleetPartners from './pages/admin/FleetPartners'
import Payouts from './pages/admin/Payouts'
import Settings from './pages/admin/Settings'
import AddDriver from './pages/admin/AddDriver'

// Driver Pages
import DriverDashboard from './pages/driver/Dashboard'
import DriverTrips from './pages/driver/Trips'
import DriverVehicles from './pages/driver/Vehicles'
import DriverProfile from './pages/driver/Profile'
import DriverSettings from './pages/driver/Settings'

// Public Pages
import FleetPartnerRegistration from './pages/FleetPartnerRegistration'
import ViewDriver from './pages/admin/ViewDriver'
import ViewVehicle from './pages/admin/ViewVehicle'
import ViewFleetPartner from './pages/admin/ViewFleetPartner'
import ViewTripDetails from './pages/admin/ViewTripDetails'
import { ADMIN_ROUTES, DRIVER_ROUTES } from './constants/routes'
import Loader from './components/Loader'
import DriverViewTripDetails from './pages/driver/ViewTripDetails'
import DriverViewVehicle from './pages/driver/ViewVehicle'

function App() {
  const { user, loading } = useAuth()

  console.log('App render - User:', user, 'Loading:', loading)

  // Show loading spinner while checking authentication
  if (loading) {
    return (
     <Loader/>
    )
  }

  // Show login if no user is authenticated
  if (!user) {
    console.log('No user found, showing login')
    return (
      <Routes>
        <Route path="/fleet-partner-registration" element={<FleetPartnerRegistration />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  console.log('User authenticated, role:', user.role)

  return (
    <Layout>
      <Routes>
        {/* Admin Routes */}
        {user.role === 'admin' && (
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path={ADMIN_ROUTES.DASHBOARD} element={<AdminDashboard />} />
            +
            <Route path={ADMIN_ROUTES.DRIVERS.ALL_DRIVERS} element={<AdminDrivers />} />
            <Route path={ADMIN_ROUTES.DRIVERS.ADD_DRIVER} element={<AddDriver />} />
            <Route path={ADMIN_ROUTES.DRIVERS.VIEW_DRIVER+":driver_id"} element={<ViewDriver />} />

            <Route path={ADMIN_ROUTES.VEHICLES.ALL_VEHICLES} element={<AdminVehicles />} />
            <Route path={ADMIN_ROUTES.VEHICLES.VIEW_VEHICLE+":vehicle_id"} element={<ViewVehicle />} />

            <Route path={ADMIN_ROUTES.TRIPS.ALL_TRIPS} element={<AdminTrips />} />
            <Route path={ADMIN_ROUTES.TRIPS.VIEW_TRIP+":trip_id"} element={<ViewTripDetails />} />
            
            <Route path={ADMIN_ROUTES.FLEET_PARTNER.ALL_FLEET_PARTNER} element={<FleetPartners />} />
            <Route path={ADMIN_ROUTES.FLEET_PARTNER.VIEW_FLEET_PARTNER+":fleet_company_id"} element={<ViewFleetPartner />} />

            <Route path={ADMIN_ROUTES.INVOICES} element={<AdminInvoices />} />
            <Route path={ADMIN_ROUTES.NOTIFICATIONS} element={<AdminNotifications />} />
            <Route path={ADMIN_ROUTES.PAYOUTS} element={<Payouts />} />
            <Route path={ADMIN_ROUTES.SETTINGS} element={<Settings />} />
          </>
        )}

        {/* Driver Routes */}
        {user.role === 'driver' && (
          <>
            <Route path="/" element={<DriverDashboard />} />
            <Route path={DRIVER_ROUTES.DASHBOARD} element={<DriverDashboard />} />
            <Route path={DRIVER_ROUTES.TRIPS} element={<DriverTrips />} />
            <Route path={DRIVER_ROUTES.VIEW_TRIP+":trip_id"} element={<DriverViewTripDetails />} />
            <Route path={DRIVER_ROUTES.VEHICLES} element={<DriverVehicles />} />
            <Route path={DRIVER_ROUTES.VIEW_VEHICLE+":vehicle_id"} element={<DriverViewVehicle />} />
            <Route path={DRIVER_ROUTES.PROFILE} element={<DriverProfile />} />
            <Route path={DRIVER_ROUTES.SETTINGS} element={<DriverSettings />} />
          </>
        )}

        {/* Customer Routes - Add when needed */}
        {user.role === 'customer' && (
          <>
            <Route path="/" element={<div className="p-6"><h1>Customer Dashboard Coming Soon</h1></div>} />
          </>
        )}

        {/* Fallback - redirect to home based on role */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App