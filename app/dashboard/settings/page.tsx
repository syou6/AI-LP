'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface TwitterStatus {
  connected: boolean
  twitter_user_id?: string
  twitter_username?: string
  expired?: boolean
  error?: string
}

export default function SettingsPage() {
  const [twitterStatus, setTwitterStatus] = useState<TwitterStatus>({ connected: false })
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  
  const searchParams = useSearchParams()

  useEffect(() => {
    checkTwitterStatus()
    
    // Check for URL parameters (from OAuth callback)
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'twitter_connected') {
      setMessage('Twitter account connected successfully!')
      setMessageType('success')
    } else if (error) {
      const errorMessages = {
        oauth_denied: 'Twitter connection was cancelled.',
        missing_parameters: 'Invalid OAuth response from Twitter.',
        invalid_state: 'Security validation failed. Please try again.',
        database_error: 'Failed to save Twitter connection.',
        oauth_failed: 'Twitter connection failed. Please try again.',
      }
      setMessage(errorMessages[error as keyof typeof errorMessages] || 'An error occurred connecting to Twitter.')
      setMessageType('error')
    }

    // Clear URL parameters after showing message
    if (success || error) {
      const timer = setTimeout(() => {
        setMessage('')
        setMessageType('')
        window.history.replaceState({}, '', '/dashboard/settings')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  const checkTwitterStatus = async () => {
    try {
      const response = await fetch('/api/auth/twitter/verify')
      const data = await response.json()
      setTwitterStatus(data)
    } catch (error) {
      console.error('Error checking Twitter status:', error)
      setTwitterStatus({ connected: false, error: 'Failed to check connection status' })
    } finally {
      setLoading(false)
    }
  }

  const connectTwitter = async () => {
    setConnecting(true)
    setMessage('')
    setMessageType('')

    try {
      const response = await fetch('/api/auth/twitter')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate Twitter connection')
      }

      // Redirect to Twitter OAuth
      window.location.href = data.url
    } catch (error: any) {
      setMessage(error.message)
      setMessageType('error')
      setConnecting(false)
    }
  }

  const disconnectTwitter = async () => {
    setDisconnecting(true)
    setMessage('')
    setMessageType('')

    try {
      const response = await fetch('/api/auth/twitter/verify', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to disconnect Twitter')
      }

      setTwitterStatus({ connected: false })
      setMessage('Twitter account disconnected successfully.')
      setMessageType('success')
    } catch (error: any) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and integrations
        </p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-md ${
          messageType === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Twitter Integration */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Twitter Integration</h2>
            <p className="card-description">
              Connect your Twitter account to publish posts and track analytics
            </p>
          </div>
          <div className="card-content">
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Checking connection status...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Twitter</h3>
                      {twitterStatus.connected ? (
                        <div className="space-y-1">
                          <p className="text-sm text-green-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Connected
                          </p>
                          {twitterStatus.twitter_username && (
                            <p className="text-sm text-gray-600">
                              @{twitterStatus.twitter_username}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Not connected
                          </p>
                          {twitterStatus.error && (
                            <p className="text-sm text-red-600">{twitterStatus.error}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {twitterStatus.connected ? (
                      <button
                        onClick={disconnectTwitter}
                        disabled={disconnecting}
                        className="btn-destructive"
                      >
                        {disconnecting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Disconnecting...
                          </div>
                        ) : (
                          'Disconnect'
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={connectTwitter}
                        disabled={connecting}
                        className="btn-primary"
                      >
                        {connecting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Connecting...
                          </div>
                        ) : (
                          'Connect Twitter'
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {twitterStatus.expired && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Connection Expired
                        </h3>
                        <div className="mt-1 text-sm text-yellow-700">
                          <p>Your Twitter connection has expired. Please reconnect to continue posting.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!twitterStatus.connected && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Why connect Twitter?
                        </h3>
                        <div className="mt-1 text-sm text-blue-700">
                          <ul className="list-disc list-inside space-y-1">
                            <li>Post directly to your Twitter account</li>
                            <li>Schedule posts for optimal engagement</li>
                            <li>Track detailed analytics and metrics</li>
                            <li>Monitor your account performance</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Account Settings</h2>
            <p className="card-description">
              Manage your account preferences
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications about your posts and analytics</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Analytics Reports</h3>
                  <p className="text-sm text-gray-500">Weekly summary of your post performance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Subscription</h2>
            <p className="card-description">
              Your current plan and billing information
            </p>
          </div>
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Free Plan</h3>
                <p className="text-sm text-gray-500">
                  • Up to 50 posts per month<br />
                  • Basic analytics<br />
                  • Twitter integration
                </p>
              </div>
              <div>
                <button className="btn-outline">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-red-200">
          <div className="card-header">
            <h2 className="card-title text-red-700">Danger Zone</h2>
            <p className="card-description">
              Irreversible and destructive actions
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-500">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <button className="btn-destructive">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}