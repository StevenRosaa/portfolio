import React, { useState, useEffect } from 'react'
import {useAuth} from '../hooks/useAuth.ts'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle
} from 'lucide-react'

export const SignIn: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, isAuthenticated, isLocked, remainingAttempts, getRemainingLockoutTime } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [lockoutTime, setLockoutTime] = useState(0)

  // Redirect se già autenticato
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/') // o la tua pagina admin
    }
  }, [isAuthenticated, navigate])

  // Timer per il countdown del lockout
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 60000) // Aggiorna ogni minuto

      return () => clearInterval(timer)
    }
  }, [isLocked, lockoutTime])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      return
    }

    const result = await login(formData.email, formData.password)
    
    if (result.isLocked) {
      // Ottieni il tempo di lockout rimanente
      const remaining = await getRemainingLockoutTime(formData.email)
      setLockoutTime(remaining)
    }
  }

  const isAccountLocked = () => isLocked || lockoutTime > 0

  const getRemainingLockoutTimeDisplay = (): string => {
    if (lockoutTime > 0) {
      return `${lockoutTime}min`
    }
    return ''
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Gradient Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20"></div>
      <div className="absolute inset-0 opacity-30 animate-pulse"
           style={{
             background: `radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)`
           }}>
      </div>

      {/* Header */}
      <header className="relative z-10 py-4 sm:py-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center space-x-1 sm:space-x-2">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base"><a href='/'>Back to Home</a></span>
            </button>
          </div>
          <div className="text-white text-lg sm:text-xl font-semibold hover:text-purple-400 transition-colors cursor-pointer">
            GP
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mt-8 sm:mt-12 lg:mt-16 mb-4 sm:mb-8 relative z-10 flex items-center justify-center min-h-[calc(100vh-160px)] sm:min-h-[calc(100vh-200px)] px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-md">
          {/* Login Card */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:bg-gray-800/50 transition-all duration-500 transform hover:scale-[1.02] sm:hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-thin mb-2 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-sm sm:text-base text-gray-400 hover:text-gray-300 transition-colors duration-300">
                Sign in to access the admin panel
              </p>
            </div>

            {/* Error Messages */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start sm:items-center space-x-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                <p className="text-red-300 text-xs sm:text-sm leading-relaxed">{error}</p>
              </div>
            )}

            {/* Demo credentials info - solo per sviluppo */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-xs sm:text-sm font-medium mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-blue-200">
                <p className="break-all"><strong>Email:</strong> admin@portfolio.com</p>
                <p><strong>Password:</strong> SecureP@ssw0rd123!</p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-800/50 border border-white/10 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                    placeholder="admin@portfolio.com"
                    required
                    disabled={isAccountLocked() || isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-gray-800/50 border border-white/10 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                    placeholder="Enter your password"
                    required
                    disabled={isAccountLocked() || isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300 p-1"
                    disabled={isAccountLocked() || isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-800 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-purple-500"
                    disabled={isAccountLocked() || isLoading}
                  />
                  <span className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors duration-300">
                    Remember me
                  </span>
                </label>
                {!isLocked && remainingAttempts < 5 && remainingAttempts > 0 && (
                  <span className="text-xs sm:text-sm text-orange-400 text-center sm:text-right">
                    {remainingAttempts} attempts remaining
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isAccountLocked()}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-[1.02] sm:hover:scale-105 hover:shadow-xl sm:hover:shadow-2xl hover:shadow-purple-500/30 active:scale-95 duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : isAccountLocked() ? (
                  <span className="text-xs sm:text-sm">{`Account Locked ${getRemainingLockoutTimeDisplay()}`}</span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Footer Text */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-xs sm:text-sm text-gray-400">
                Don't have an account?{' '}
                <button className="text-purple-400 hover:text-purple-300 transition-colors duration-300 font-medium">
                  Contact Admin
                </button>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-500 px-4">
              Secure admin access for portfolio management
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-4 sm:py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 hover:text-gray-300 transition-colors duration-300">
          <p className="text-xs sm:text-sm">&copy; 2025. Crafted with passion and code.</p>
        </div>
      </footer>
    </div>
  )
}