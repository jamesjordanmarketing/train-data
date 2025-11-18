import { getSupabaseClient } from './supabase-client'

/**
 * Client-side Auth Service
 * Use this for client-side authentication operations
 */
export class AuthService {
  static async getCurrentUser() {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  static async getSession() {
    const supabase = getSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      const session = await this.getSession()
      return session?.access_token || null
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return null
    }
  }

  static async signOut() {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}
