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
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        
        console.log('AuthProvider init - Token exists:', !!token, 'UserData exists:', !!userData)
        
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData)
            console.log('Parsed user from localStorage:', parsedUser)
            
            // Validate the user object has required fields
            if (parsedUser && (parsedUser.admin_id || parsedUser.driver_id || parsedUser.user_id)) {
              // Ensure user object has proper structure
              const userWithRole = {
                ...parsedUser,
                // Ensure role is set correctly
                role: parsedUser.role || (parsedUser.admin_id ? 'admin' : parsedUser.driver_id ? 'driver' : 'customer'),
                // Ensure name is set correctly
                name: parsedUser.name || parsedUser.adminName || parsedUser.driverName || `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim() || 'User'
              }
              
              setUser(userWithRole)
              console.log('User set from localStorage:', userWithRole)
            } else {
              console.log('Invalid user data in localStorage, clearing...')
              localStorage.removeItem('token')
              localStorage.removeItem('user')
            }
          } catch (error) {
            console.error('Error parsing user data:', error)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        } else {
          console.log('No token or user data found in localStorage')
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        // Add a small delay to prevent flash
        setTimeout(() => {
          setLoading(false)
        }, 200)
      }
    }

    initializeAuth()
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

      if (!userData) {
        throw new Error('No user data received from server')
      }

      // Ensure user object has role and consistent format
      const userWithRole = {
        ...userData,
        role: role, // Use the role from login form
        // Map different user types to consistent format
        name: userData.adminName || userData.driverName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.name || 'User',
        email: userData.email
      }
      
      console.log('Storing user data:', userWithRole)
      
      // Store data in localStorage first
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userWithRole))
      
      // Verify storage worked
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      console.log('Verification - Token stored:', !!storedToken, 'User stored:', !!storedUser)
      
      // Set user state immediately
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
    console.log('Logging out user')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
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