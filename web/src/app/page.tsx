'use client'

import { useToast } from '@/components/ui/toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [code, setCode] = useState('')
  const [problemStatement, setProblemStatement] = useState('')
  const [thinkingLevel, setThinkingLevel] = useState('standard')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fetch current user data

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        console.log('Fetching current user...')
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/user/getCurrentUser`,
          {
            withCredentials: true,
          }
        )

        console.log('User response:', response.data)

        if (response.status === 200 && response.data) {
          setUser(() => response.data.data)
          console.log('User set:', response.data.data)
        } else {
          console.log('No user data found, redirecting to signin')
          router.push('/signin')
        }
      } catch (error: any) {
        console.error('Failed to fetch user:', error)

        if (error.response?.status === 401) {
          toast({
            title: 'Session Expired',
            description: 'Please sign in again',
            variant: 'destructive'
          })
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          toast({
            title: 'Server Error',
            description: 'Cannot connect to server. Please make sure the backend is running.',
            variant: 'destructive'
          })
        }

        router.push('/signin')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    fetchCurrentUser()
  }, [router, toast])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true, // Important: Include cookies in the request
        }
      )

      if (response.status === 200) {
        toast({
          title: 'Success',
          description: 'You have been successfully logged out',
          variant: 'default'
        })

        // Clear user state and redirect
        setUser(null)
        router.push('/signin')
      }
    } catch (error: any) {
      console.error('Logout error:', error)

      // Even if API call fails, still redirect (cookie might be expired)
      toast({
        title: 'Logged out',
        description: 'You have been logged out',
        variant: 'default'
      })

      setUser(null)
      router.push('/signin')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your code',
        variant: 'destructive'
      })
      return
    }

    if (!problemStatement.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter the problem statement',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    setResult('')

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getTestCase`, {
        code: code.trim(),
        problemStatement: problemStatement.trim(),
        thinkingLevel
      })

      if (response.data.testCase) {
        setResult(response.data.testCase)
        toast({
          title: 'Success',
          description: 'Test case generated successfully!',
          variant: 'success'
        })
      } else if (response.data.message) {
        setResult(response.data.message)
        toast({
          title: 'Info',
          description: response.data.message,
          variant: 'default'
        })
      } else if (response.data.error) {
        toast({
          title: 'Error',
          description: 'Failed to generate test case',
          variant: 'destructive'
        })
        setResult(`Error: ${JSON.stringify(response.data.error)}`)
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to connect to server',
        variant: 'destructive'
      })
      setResult('Failed to connect to server. Please make sure the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const clearAll = () => {
    setCode('')
    setProblemStatement('')
    setResult('')
    setThinkingLevel('standard')
  }

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Only render main content if user is authenticated
  if (!user) {
    return null // This should not happen due to redirect, but just in case
  }
  console.log(user);
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Avatar */}
        <div className="relative mb-8">
          {/* User Avatar in top right */}
          <div className="absolute top-0 right-0">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 bg-white rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-shadow border border-emerald-200"
              >
                <img
                  src={user.picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-emerald-800">{user.name || 'User'}</p>
                  {/* <p className="text-xs text-emerald-600">{user.email}</p> */}
                </div>
                <svg
                  className={`w-4 h-4 text-emerald-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-emerald-200 py-2 z-10">
                  {/* <div className="px-4 py-2 border-b border-emerald-100">
                    <p className="text-sm font-medium text-emerald-800">{user.name || 'User'}</p>
                    <p className="text-xs text-emerald-600">{user.email}</p>
                  </div> */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push('/profile')
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    Profile Settings
                  </button>

                  <hr className="my-1 border-emerald-100" />
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      handleLogout()
                    }}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                        Signing Out...
                      </>
                    ) : (
                      'Sign Out'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Header Content */}
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-emerald-800 mb-4">
              Test Case Generator
            </h1>
            <p className="text-lg text-emerald-600 max-w-2xl mx-auto">
              Generate stress test cases for your C++ code solutions. Input your code and problem statement to find potential edge cases.
            </p>
          </div>
        </div>

        {/* Rest of your existing form JSX remains the same */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
              <label htmlFor="problemStatement" className="block text-sm font-semibold text-emerald-800 mb-3">
                Problem Statement
              </label>
              <textarea
                id="problemStatement"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Describe the problem you're trying to solve..."
                className="w-full h-32 px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-gray-700 placeholder-gray-400"
                disabled={isLoading}
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
              <label htmlFor="code" className="block text-sm font-semibold text-emerald-800 mb-3">
                Your C++ Solution
              </label>
              <textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your C++ code here..."
                className="w-full h-80 px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none font-mono text-sm text-gray-700 placeholder-gray-400"
                disabled={isLoading}
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
              <label htmlFor="thinkingLevel" className="block text-sm font-semibold text-emerald-800 mb-3">
                Thinking Level
              </label>
              <select
                id="thinkingLevel"
                value={thinkingLevel}
                onChange={(e) => setThinkingLevel(e.target.value)}
                className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-700"
                disabled={isLoading}
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Generating...
                  </div>
                ) : (
                  'Generate Test Case'
                )}
              </button>

              <button
                type="button"
                onClick={clearAll}
                disabled={isLoading}
                className="px-6 py-4 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white disabled:border-emerald-400 disabled:text-emerald-400 font-semibold rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Right Column - Result */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
            <h3 className="text-lg font-semibold text-emerald-800 mb-4">Generated Test Case</h3>

            {result ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 overflow-auto max-h-96">
                    {result}
                  </pre>
                </div>

                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium py-2 px-4 rounded-lg transition-colors border border-emerald-300"
                >
                  Copy to Clipboard
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">🧪</div>
                  <p className="text-lg">Test case will appear here</p>
                  <p className="text-sm mt-2">Fill in your code and problem statement, then click generate</p>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}