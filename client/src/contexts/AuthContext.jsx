import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        // Add role to user object if not present
        if (!parsedUser.role) {
          // Determine role based on user properties
          if (parsedUser.admin_id || parsedUser.adminName) {
            parsedUser.role = 'admin'
          } else if (parsedUser.driver_id || parsedUser.driverName) {
            parsedUser.role = 'driver'
          } else {
            parsedUser.role = 'customer'
          }
        }
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password, role) => {
    try {
      console.log('Attempting login with:', { email, role })
      
      const response = await authAPI.login(email, password, role)
      console.log('Login response:', response.data)
      
      const { token, user: userData } = response.data
      
      if (!token) {
        throw new Error('No token received from server')
      }

      // Ensure user object has role
      const userWithRole = {
        ...userData,
        role: role,
        // Map different user types to consistent format
        name: userData.adminName || userData.driverName || `${userData.firstName} ${userData.lastName}` || userData.name,
        email: userData.email
      }
      
      console.log('Storing user data:', userWithRole)
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userWithRole))
      setUser(userWithRole)
      
      return { success: true, user: userWithRole }
    } catch (error) {
      console.error('Login error:', error)
      
      // Clear any existing auth data on error
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    // Force page reload to clear any cached state
    window.location.href = '/login'
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}