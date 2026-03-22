"use client"

import { createContext, useContext, type ReactNode } from "react"

// Define the AuthUser type
type AuthUser = {
  id: string
  name: string
  email: string
  picture?: string
}

// Define the context type
type AuthContextType = {
  user: AuthUser | null
  isLoading: boolean
  signIn: () => Promise<{ success: boolean; error?: string }>
  signUp: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  cancelAuth: () => void
  handleRedirectCallback: () => Promise<boolean>
  updateUserProfile: (data: any) => void
}

// Create a stub context with empty values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  cancelAuth: () => {},
  handleRedirectCallback: async () => false,
  updateUserProfile: () => {},
})

// Export the useAuth hook that returns the stub context
export const useAuth = () => useContext(AuthContext)

// Export a stub AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
