import React, { useState } from 'react'
import { Car, Eye, EyeOff, User, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await login(formData.email, formData.password, formData.role)
      
      if (result.success) {
        toast.success('Login successful!')
      } else {
        toast.error(result.error || 'Login failed')
      }
    } catch (error) {
      toast.error('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const fillTestCredentials = (role) => {
    if (role === 'admin') {
      setFormData({
        email: 'asdf@gmail.com',
        password: 'test123',
        role: 'admin'
      })
    } else {
      setFormData({
        email: 'test@gmail.com',
        password: 'test123',
        role: 'driver'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900">eCharter</h1>
          <p className="text-secondary-600 mt-2">Admin & Fleet Management Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Login as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors duration-200 ${
                    formData.role === 'admin'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'driver' })}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors duration-200 ${
                    formData.role === 'driver'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Driver</span>
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-6 pt-6 border-t border-secondary-200">
            <p className="text-sm text-secondary-600 mb-3 text-center">Quick Test Login:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillTestCredentials('admin')}
                className="text-xs bg-secondary-100 hover:bg-secondary-200 text-secondary-700 py-2 px-3 rounded-lg transition-colors duration-200"
              >
                Admin Test
              </button>
              <button
                type="button"
                onClick={() => fillTestCredentials('driver')}
                className="text-xs bg-secondary-100 hover:bg-secondary-200 text-secondary-700 py-2 px-3 rounded-lg transition-colors duration-200"
              >
                Driver Test
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-secondary-500">
            © 2024 eCharter. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login