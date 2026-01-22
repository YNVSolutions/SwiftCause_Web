'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getAuth, onAuthStateChanged, User as FirebaseAuthUser, sendEmailVerification } from 'firebase/auth'
import { doc, getDoc, db } from './firebase'
import {
  UserRole,
  User,
  KioskSession,
  AdminSession,
  SignupFormData,
  Permission,
} from '@/shared/types'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { setDoc } from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'

const auth = getAuth()
const firestore = getFirestore()

interface AuthContextType {
  userRole: UserRole | null
  currentKioskSession: KioskSession | null
  currentAdminSession: AdminSession | null
  isLoadingAuth: boolean
  handleLogin: (role: UserRole, sessionData?: KioskSession | AdminSession) => Promise<void>
  handleLogout: () => void
  handleSignup: (signupData: SignupFormData) => Promise<string>
  hasPermission: (permission: Permission) => boolean
  refreshCurrentKioskSession: (kioskIdToRefresh?: string) => Promise<void>
  handleOrganizationSwitch: (organizationId: string) => void
  resendVerificationEmail: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [currentKioskSession, setCurrentKioskSession] = useState<KioskSession | null>(null)
  const [currentAdminSession, setCurrentAdminSession] = useState<AdminSession | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // Define refreshCurrentKioskSession function first
  const refreshCurrentKioskSession = async (kioskIdToRefresh?: string) => {
    const targetKioskId = kioskIdToRefresh || currentKioskSession?.kioskId
    
    if (targetKioskId) {
      try {
        const kioskRef = doc(db, 'kiosks', targetKioskId)
        const kioskSnap = await getDoc(kioskRef)
        if (kioskSnap.exists()) {
          const kioskData = kioskSnap.data() as any
          
          setCurrentKioskSession((prev) => ({
            ...prev!,
            ...kioskData,
          }))
        } else {
          console.warn('Kiosk document not found during refresh:', targetKioskId)
        }
      } catch (error) {
        console.error('Error refreshing kiosk session:', error)
      }
    }
  }

  // Load persisted kiosk session on mount
  useEffect(() => {
    const loadPersistedSession = async () => {
      try {
        const persistedKioskSession = localStorage.getItem('kioskSession')
        const persistedUserRole = localStorage.getItem('userRole')

        if (persistedKioskSession && persistedUserRole === 'kiosk') {
          const kioskSession = JSON.parse(persistedKioskSession) as KioskSession
          
          setUserRole('kiosk')
          setCurrentKioskSession(kioskSession)
          // Refresh the session to get latest data
          await refreshCurrentKioskSession(kioskSession.kioskId)
        }
      } catch (error) {
        console.error('Error loading persisted session:', error)
        // Clear corrupted data
        localStorage.removeItem('kioskSession')
        localStorage.removeItem('userRole')
      }
    }

    loadPersistedSession()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist kiosk session changes to localStorage
  useEffect(() => {
    if (currentKioskSession) {
      try {
        localStorage.setItem('kioskSession', JSON.stringify(currentKioskSession))
        localStorage.setItem('userRole', 'kiosk')
      } catch (error) {
        console.error('Error persisting kiosk session:', error)
      }
    }
  }, [currentKioskSession])

  useEffect(() => {
    // Set a timeout to prevent infinite loading if Firebase is not configured
    const timeout = setTimeout(() => {
      setIsLoadingAuth(false)
    }, 1000) // Reduced timeout for faster loading

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout) // Clear timeout when auth state changes
      
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as User
          
          // Only establish session if email is verified
          if (userData.emailVerified !== false) {
            setUserRole(userData.role)
            setCurrentAdminSession({
              user: userData,
              loginTime: new Date().toISOString(),
              permissions: userData.permissions || []
            })
          } else {
            // User exists but email not verified - don't establish session
            // This allows them to resend verification email
            console.warn('AuthProvider: User email not verified:', firebaseUser.email)
          }
        } else {
          console.warn('AuthProvider: User document not found for UID:', firebaseUser.uid)
          // Only logout if we don't have a kiosk session
          if (userRole !== 'kiosk') {
            handleLogout()
          }
        }
      } else {
        // Only logout if we don't have a kiosk session
        if (userRole !== 'kiosk' && !currentKioskSession) {
          handleLogout()
        }
      }
      setIsLoadingAuth(false)
    })

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = async (role: UserRole, sessionData?: KioskSession | AdminSession) => {
    setUserRole(role)
    if (
      role === 'admin' ||
      role === 'super_admin' ||
      role === 'manager' ||
      role === 'operator' ||
      role === 'viewer'
    ) {
      setCurrentAdminSession(sessionData as AdminSession)
    } else if (role === 'kiosk') {
      setCurrentKioskSession(sessionData as KioskSession)
      await refreshCurrentKioskSession((sessionData as KioskSession).kioskId)
    }
  }

  const handleLogout = () => {
    setUserRole(null)
    setCurrentKioskSession(null)
    setCurrentAdminSession(null)
    
    // Clear persisted session data
    try {
      localStorage.removeItem('kioskSession')
      localStorage.removeItem('userRole')
    } catch (error) {
      console.error('Error clearing persisted session:', error)
    }
  }

  const handleSignup = async (signupData: SignupFormData): Promise<string> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupData.email,
        signupData.password
      )
      const userId = userCredential.user.uid

      const userData = {
        username: `${signupData.firstName} ${signupData.lastName}`,
        email: signupData.email,
        role: 'admin' as UserRole,
        permissions: [
          'view_dashboard',
          'view_campaigns',
          'create_campaign',
          'edit_campaign',
          'delete_campaign',
          'view_kiosks',
          'create_kiosk',
          'edit_kiosk',
          'delete_kiosk',
          'assign_campaigns',
          'view_donations',
          'export_donations',
          'view_users',
          'create_user',
          'edit_user',
          'delete_user',
          'manage_permissions',
        ] as Permission[],
        isActive: true,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        organizationId: signupData.organizationId,
      }

      await setDoc(doc(firestore, 'users', userId), userData)

      await setDoc(doc(firestore, 'organizations', signupData.organizationId), {
        name: signupData.organizationName,
        type: signupData.organizationType,
        size: signupData.organizationSize,
        website: signupData.website,
        currency: signupData.currency,
        tags: [],
        createdAt: new Date().toISOString(),
      })

      // Send verification email
      await sendEmailVerification(userCredential.user)

      // DON'T sign out - keep user authenticated so they can resend verification
      // But DON'T establish a session in our app (don't call handleLogin)

      // Return email for redirect
      return signupData.email
    } catch (error) {
      if (error instanceof Error) {
        console.error('Signup error:', error)
        throw error
      } else {
        console.error('Unknown signup error:', error)
        throw new Error('Signup failed due to an unknown error.')
      }
    }
  }

  const resendVerificationEmail = async (email: string): Promise<void> => {
    try {
      // Check if there's a current user
      const user = auth.currentUser
      
      // If no current user, they need to sign up again
      if (!user) {
        throw new Error('Session expired. Please sign up again.')
      }
      
      // Verify the email matches
      if (user.email !== email) {
        throw new Error('Email does not match current user')
      }
      
      // Send verification email
      await sendEmailVerification(user)
    } catch (error) {
      console.error('Error resending verification email:', error)
      throw error
    }
  }

  const hasPermission = (permission: Permission): boolean => {
    if (
      !currentAdminSession ||
      !Array.isArray(currentAdminSession.user.permissions)
    ) {
      return false
    }
    return (
      currentAdminSession.user.permissions.includes(permission) ||
      currentAdminSession.user.permissions.includes('system_admin')
    )
  }

  const handleOrganizationSwitch = (organizationId: string) => {
    if (currentAdminSession) {
      setCurrentAdminSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          user: {
            ...prev.user,
            organizationId: organizationId,
          },
        }
      })
    }
  }

  const value: AuthContextType = {
    userRole,
    currentKioskSession,
    currentAdminSession,
    isLoadingAuth,
    handleLogin,
    handleLogout,
    handleSignup,
    hasPermission,
    refreshCurrentKioskSession,
    handleOrganizationSwitch,
    resendVerificationEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
