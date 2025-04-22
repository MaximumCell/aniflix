import axios from 'axios'
import toast from 'react-hot-toast'
import {create} from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  isSigningup: false,
  isCheckingAuth: true,
  isLoggingIn: false,
  isLoggingOut: false,
  signup: async (credentials) => {
      set({ isSigningup: true })
    try {
        const response = await axios.post('/api/v1/auth/signup', credentials)
        set({ user: response.data.user })
        toast.success('Account created successfully')
    } catch (error) {
        toast.error(error.response.data.message || 'Something went wrong');
        set({ isSigningup: false, user: null})
    } finally {
        set({ isSigningup: false })
    }
  },
    login: async (credentials) => {
      set({ isLoggingIn: true })
      try {
        const response = await axios.post('/api/v1/auth/login', credentials)
        set({ user: response.data.user })
        toast.success('Logged in successfully')
      } catch (error) {
        console.error(error)
        toast.error(error.response.data.message || 'Something went wrong')
      } finally {
        set({ isLoggingIn: false })
      }
    },
    logout: async () => {
      set({ isLoggingOut: true })
      try {
        const response = await axios.post('/api/v1/auth/logout')
        set({ user: null })
        toast.success(response.data.message)
      } catch (error) {
        toast.error(error.response.data.message || 'Something went wrong')
      } finally {
        set({ isLoggingOut: false })
      }
    },
    authCheck: async () => {
      set({ isCheckingAuth: true })
      try {
        const response = await axios.get('/api/v1/auth/authCheck')
        set({ user: response.data.user })
      } catch (error) {
        set({ isCheckingAuth: false, user: null })
      } finally {
        set({ isCheckingAuth: false })
      }
    }
}))