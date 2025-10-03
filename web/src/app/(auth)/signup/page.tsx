'use client'
import { useToast } from "@/components/ui/toast"
import axios from 'axios'
import { useRouter } from "next/navigation"
import { useState } from 'react'

function SignupPage() {
    const { toast } = useToast()
    const router = useRouter();
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showOtpForm, setShowOtpForm] = useState(false)
    const [otp, setOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        if (password !== confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: "Passwords do not match. Please try again.",
                variant: "destructive",
            })
            setIsLoading(false)
            return
        }

        console.log('Signup attempted with:', { email, name, password })
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`, {
                email, name, password
            })
            // after here otp is sent 
            console.log('Signup successful:', response.data)

            toast({
                title: "OTP Sent!",
                description: "Please check your email for the verification code.",
                variant: "success",
            })

            setShowOtpForm(true) // Show OTP form after successful signup
        } catch (error) {
            console.log('Signup error:', error);
            console.log(error.response.data.message)
            toast({
                title: "Signup Failed",
                description: error?.response.data.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        if (!otp || otp.length !== 5) {
            toast({
                title: "Invalid OTP",
                description: "Please enter a valid 5-digit OTP.",
                variant: "destructive",
            })
            setIsLoading(false)
            return
        }

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verifyOTP`, {
                email, name, password, otp
            })

            console.log('OTP verification successful:', response.data)

            toast({
                title: "Account Created!",
                description: "Your account has been created successfully.",
                variant: "success",
            })

            // Redirect to dashboard or home page
            router.push('/')
        } catch (error) {
            console.log('OTP verification error:', error);

            toast({
                title: "Verification Failed",
                description: "Invalid OTP. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleAuth = () => {
        console.log('Google authentication initiated')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join us today and get started
                    </p>
                </div>

                {/* Signup Form */}
                <div className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={showOtpForm ? handleOtpSubmit : handleSubmit}>
                        {!showOtpForm ? (
                            <>
                                {/* Name Input */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            autoComplete="name"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>

                                {/* Email Input */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email address
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                            placeholder="Create a password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Input */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="flex items-center">
                                    <input
                                        id="agree-terms"
                                        name="agree-terms"
                                        type="checkbox"
                                        required
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                                        I agree to the{' '}
                                        <a href="#" className="text-emerald-600 hover:text-emerald-500">
                                            Terms and Conditions
                                        </a>
                                    </label>
                                </div>

                                {/* Sign up button */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50"
                                    >
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                {/* Google Sign up */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={handleGoogleAuth}
                                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-150 ease-in-out"
                                    >
                                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Continue with Google
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* OTP Verification Form */}
                                <div className="text-center mb-6">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100">
                                        <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-2 text-lg font-medium text-gray-900">Check your email</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        We've sent a 5-digit verification code to <span className="font-medium">{email}</span>
                                    </p>
                                </div>

                                {/* OTP Input */}
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                        Verification Code
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="otp"
                                            name="otp"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={5}
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-center text-2xl tracking-widest"
                                            placeholder="12345"
                                        />
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Enter the 5-digit code sent to your email
                                    </p>
                                </div>

                                {/* Verify button */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading || otp.length !== 5}
                                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50"
                                    >
                                        {isLoading ? 'Verifying...' : 'Verify Account'}
                                    </button>
                                </div>

                                {/* Back to signup link */}
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowOtpForm(false)}
                                        className="text-sm text-emerald-600 hover:text-emerald-500"
                                    >
                                        ← Back to signup form
                                    </button>
                                </div>

                                {/* Resend OTP */}
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">
                                        Didn't receive the code?{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowOtpForm(false);
                                                handleSubmit({ preventDefault: () => { } } as React.FormEvent);
                                            }}
                                            className="font-medium text-emerald-600 hover:text-emerald-500"
                                        >
                                            Resend
                                        </button>
                                    </p>
                                </div>
                            </>
                        )}
                    </form>

                    {/* Sign in link */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <a href="/signin" className="font-medium text-emerald-600 hover:text-emerald-500">
                                    Sign in here
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignupPage
