'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from './supabase-client'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  isLoading: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ 
  children,
  redirectTo = '/dashboard'
}: { 
  children: React.ReactNode
  redirectTo?: string 
}) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    // Get initial session with timeout
    const getSession = async () => {
      try {
        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        )
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise])
        
        if (error) {
          console.error('Error getting session:', error)
          // Clear any stale session data
          setSession(null)
          setUser(null)
          setProfile(null)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user) {
            // Load profile but don't block on it
            loadUserProfile(session.user.id).catch(err => {
              console.error('Profile loading failed:', err)
            })
          }
        }
      } catch (error) {
        console.error('Session initialization failed:', error)
        // Clear any stale data
        setSession(null)
        setUser(null)
        setProfile(null)
      } finally {
        // Always set loading to false
        setIsLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Load profile but don't block the loading state on it
          loadUserProfile(session.user.id).catch(err => {
            console.error('Profile loading failed during auth change:', err)
          })
        } else {
          setProfile(null)
        }
        
        // Always set loading to false
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, []) // Empty dependency array is correct - we want this to run once

  const loadUserProfile = async (userId: string) => {
    const supabase = getSupabaseClient();
    try {
      // Add timeout to profile loading to prevent hanging
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
        
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), 5000)
      )
      
      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise])

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - this is normal for new users
          console.log('No user profile found, user may need to complete setup')
          setProfile(null)
        } else {
          console.error('Error loading user profile:', error)
          setProfile(null)
        }
      } else {
        setProfile(profile)
      }
    } catch (error) {
      console.error('Profile loading failed:', error)
      setProfile(null)
    }
  }

  const signUp = async (email: string, password: string, metadata: any = {}) => {
    const supabase = getSupabaseClient();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        return { error: error.message }
      }

      // Create user profile if signup successful
      if (data.user) {
        try {
          await supabase.from('user_profiles').insert({
            id: data.user.id,
            email: data.user.email,
            full_name: metadata.full_name || '',
            organization: metadata.organization || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        } catch (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }

      return { data }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: error.message }
      }

      return { data }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const signOut = async () => {
    const supabase = getSupabaseClient();
    try {
      // Set loading to true during signout
      setIsLoading(true)
      
      await supabase.auth.signOut()
      
      // Clear all state immediately
      setSession(null)
      setUser(null)
      setProfile(null)
      
    } catch (error) {
      console.error('Error signing out:', error)
      // Still clear state even if signOut fails
      setSession(null)
      setUser(null)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: any) => {
    if (!user) throw new Error('No user logged in')
    
    const supabase = getSupabaseClient();
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const value = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
