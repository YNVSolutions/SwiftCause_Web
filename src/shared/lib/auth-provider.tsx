'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getAuth, onAuthStateChanged, User as FirebaseAuthUser } from 'firebase/auth'
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
  handleSignup: (signupData: SignupFormData) => Promise<void>
  hasPermission: (permission: Permission) => boolean
  refreshCurrentKioskSession: (kioskIdToRefresh?: string) => Promise<void>
  handleOrganizationSwitch: (organizationId: string) => void
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

  useEffect(() => {
    console.log('AuthProvider: onAuthStateChanged listener set up.')
    
    // Set a timeout to prevent infinite loading if Firebase is not configured
    const timeout = setTimeout(() => {
      console.log('AuthProvider: Timeout reached, setting loading to false')
      setIsLoadingAuth(false)
    }, 1000) // Reduced timeout for faster loading

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout) // Clear timeout when auth state changes
      
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as User
          setUserRole(userData.role)
          setCurrentAdminSession({
            user: userData,
            loginTime: new Date().toISOString(),
          })
        } else {
          console.warn('AuthProvider: User document not found for UID:', firebaseUser.uid)
          handleLogout()
        }
      } else {
        console.log('AuthProvider: Firebase user is signed out.')
        handleLogout()
      }
      setIsLoadingAuth(false)
    })

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
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
  }

  const refreshCurrentKioskSession = async (kioskIdToRefresh?: string) => {
    const targetKioskId = kioskIdToRefresh || currentKioskSession?.kioskId
    if (targetKioskId) {
      try {
        const kioskRef = doc(db, 'kiosks', targetKioskId)
        const kioskSnap = await getDoc(kioskRef)
        if (kioskSnap.exists()) {
          setCurrentKioskSession((prev) => ({
            ...prev!,
            ...(kioskSnap.data() as any),
          }))
        } else {
          console.warn('Kiosk document not found during refresh:', targetKioskId)
        }
      } catch (error) {
        console.error('Error refreshing kiosk session:', error)
      }
    }
  }

  const handleSignup = async (signupData: SignupFormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupData.email,
        signupData.password
      )
      const userId = userCredential.user.uid

      await setDoc(doc(firestore, 'users', userId), {
        username: `${signupData.firstName} ${signupData.lastName}`,
        email: signupData.email,
        role: 'admin',
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
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        organizationId: signupData.organizationId,
      })

      await setDoc(doc(firestore, 'organizations', signupData.organizationId), {
        name: signupData.organizationName,
        type: signupData.organizationType,
        size: signupData.organizationSize,
        website: signupData.website,
        currency: signupData.currency,
        tags: [],
        createdAt: new Date().toISOString(),
      })
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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
