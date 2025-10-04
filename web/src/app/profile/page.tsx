'use client'

import { useToast } from '@/components/ui/toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface User {
    name: string;
    email: string;
    picture: string;
}

export default function Profile() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const [name, setName] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const { toast } = useToast()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Fetch current user data
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/user/getCurrentUser`,
                    {
                        withCredentials: true,
                    }
                )

                if (response.status === 200 && response.data && response.data.data) {
                    const userData = response.data.data
                    setUser(userData)
                    setName(userData.name || '')
                } else {
                    router.push('/signin')
                }
            } catch (error: any) {
                if (error.response?.status === 401) {
                    toast({
                        title: 'Session Expired',
                        description: 'Please sign in again',
                        variant: 'destructive'
                    })
                }

                router.push('/signin')
            } finally {
                setIsLoading(false)
                setIsCheckingAuth(false)
            }
        }

        fetchCurrentUser()
    }, [router, toast])

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Invalid File Type',
                    description: 'Please select an image file',
                    variant: 'destructive'
                })
                return
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File Too Large',
                    description: 'Please select an image smaller than 5MB',
                    variant: 'destructive'
                })
                return
            }

            setSelectedFile(file)

            // Create preview URL
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        setUploadProgress(0)

        try {
            // Check if there are changes to make
            if (!selectedFile && name === user?.name) {
                toast({
                    title: 'No Changes',
                    description: 'No changes detected to update',
                    variant: 'default'
                })
                setIsUpdating(false)
                return
            }

            // Create FormData for multipart/form-data request
            const formData = new FormData()

            // Add name if changed
            if (name !== user?.name) {
                formData.append('name', name)
            }

            // Add file if selected (send actual file, not base64)
            if (selectedFile) {
                formData.append('picture', selectedFile)
            }

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/user/updateUserDetails`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        if (selectedFile && progressEvent.total) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            )
                            setUploadProgress(progress)
                        }
                    }
                }
            )

            if (response.status === 200) {
                const updatedUser = response.data.data
                setUser(updatedUser)
                setSelectedFile(null)
                setPreviewUrl(null)

                // Reset form
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }

                toast({
                    title: 'Success',
                    description: 'Profile updated successfully!',
                    variant: 'default'
                })
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast({
                    title: 'Session Expired',
                    description: 'Please sign in again',
                    variant: 'destructive'
                })
                router.push('/signin')
            } else if (error.response?.status === 413) {
                toast({
                    title: 'File Too Large',
                    description: 'Please select a smaller image file',
                    variant: 'destructive'
                })
            } else {
                toast({
                    title: 'Error',
                    description: error.response?.data?.message || 'Failed to update profile',
                    variant: 'destructive'
                })
            }
        } finally {
            setIsUpdating(false)
            setUploadProgress(0)
        }
    }

    // Remove selected image
    const removeSelectedImage = () => {
        setSelectedFile(null)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Loading state
    if (isCheckingAuth || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-emerald-700 font-medium">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-emerald-800 mb-2">
                        Profile Settings
                    </h1>
                    <p className="text-emerald-600">
                        Update your profile information
                    </p>
                </div>

                {/* Profile Form */}
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-emerald-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Picture Section */}
                        <div className="text-center">
                            <label className="block text-sm font-semibold text-emerald-800 mb-4">
                                Profile Picture
                            </label>

                            {/* Current/Preview Image */}
                            <div className="relative inline-block mb-4">
                                <img
                                    src={previewUrl || user.picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200 shadow-lg"
                                />
                                {previewUrl && (
                                    <button
                                        type="button"
                                        onClick={removeSelectedImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            {/* Upload Progress */}
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="mb-4">
                                    <div className="bg-emerald-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-emerald-600 h-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-emerald-600 mt-1">{uploadProgress}% uploaded</p>
                                </div>
                            )}

                            {/* File Input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="picture-upload"
                            />

                            {/* Upload Button */}
                            <label
                                htmlFor="picture-upload"
                                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                {selectedFile ? 'Change Picture' : 'Upload Picture'}
                            </label>

                            <p className="text-xs text-gray-500 mt-2">
                                PNG, JPG, GIF up to 5MB
                            </p>
                        </div>

                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-emerald-800 mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-700"
                                placeholder="Enter your display name"
                                disabled={isUpdating}
                            />
                        </div>

                        {/* Email Field (Read-only) */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-emerald-800 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={user.email}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                disabled
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Email cannot be changed
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
                            >
                                {isUpdating ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </div>
                                ) : (
                                    'Update Profile'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold rounded-lg transition-colors"
                            >
                                Back to Home
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}