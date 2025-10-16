import { handleApiError } from '@/lib/errorMessage'
import axios from 'axios'
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://albion-backend-4exf.onrender.com"
export const API_PREFIX = "/api"

export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const apiError = handleApiError(error)
    return Promise.reject(apiError)
  }
)

export const createApiUrl = (endpoint: string) => {
  const baseUrl = API_BASE_URL.replace(/\/$/, "")
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  return `${baseUrl}${API_PREFIX}${path}`
}