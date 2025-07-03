// src/backend/auth.ts - VERSIONE CORRETTA
import supabase from './supabase.ts'
import bcrypt from 'bcryptjs'

// Funzione JWT semplificata
function createSimpleJWT(payload: any, secret: string, expirationHours: number = 24): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '')
  
  const jwtPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (expirationHours * 60 * 60)
  }
  
  const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '')
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`).replace(/=/g, '')
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

function verifySimpleJWT(token: string, secret: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      //console.log('🕒 Token JWT scaduto')
      return null
    }
    
    const expectedSignature = btoa(`${parts[0]}.${parts[1]}.${secret}`).replace(/=/g, '')
    if (parts[2] !== expectedSignature) {
      //console.log('🔑 Firma JWT non valida')
      return null
    }
    
    return payload
  } catch (error) {
    //console.error('❌ Errore verifica JWT:', error)
    return null
  }
}

export interface User {
  id: string
  email: string
  password_hash: string
  attempts: number
  is_locked: boolean
  lockout_time: number | null
  created_at?: string
}

export interface LoginResult {
  success: boolean
  user?: User
  error?: string
  isLocked?: boolean
  remainingAttempts?: number
  token?: string
}

export interface LogoutResult {
  success: boolean
  error?: string
}

export interface SessionInfo {
  userId: string
  email: string
  loginTime: number
  lastActivity: number
  sessionToken?: string
  rememberMe: boolean
  expiresAt: number
}

export class AuthService {
  private static readonly MAX_ATTEMPTS = 5
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minuti
  
  private static readonly SESSION_DURATIONS = {
    NORMAL_SESSION: 8 * 60 * 60 * 1000,      // 8 ore
    REMEMBER_ME_SESSION: 30 * 24 * 60 * 60 * 1000, // 30 giorni
    TOKEN_NORMAL: 8,                          // 8 ore
    TOKEN_REMEMBER_ME: 24 * 30               // 30 giorni
  }

  // LOGIN PRINCIPALE - SEMPLIFICATO
  static async login(email: string, password: string, rememberMe: boolean = false): Promise<LoginResult> {
    try {
      //console.log('🔐 Tentativo login per:', email)

      if (!email || !password) {
        return { success: false, error: 'Email e password sono richiesti' }
      }

      // 1. Controlla lockout
      const isLocked = await this.checkUserLockout(email)
      if (isLocked) {
        const remainingTime = await this.getRemainingLockoutTime(email)
        return {
          success: false,
          isLocked: true,
          error: `Account bloccato. Riprova tra ${remainingTime} minuti.`
        }
      }

      // 2. Ottieni utente - QUERY CORRETTA
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      //console.log('📊 Query utente:', { user: !!user, error: fetchError })

      if (fetchError || !user) {
        //console.log('❌ Utente non trovato')
        return { success: false, error: 'Email o password non validi' }
      }

      // 3. Verifica password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash)

      if (!isPasswordValid) {
        const attempts = await this.incrementFailedAttempts(email)
        const remainingAttempts = this.MAX_ATTEMPTS - attempts
        return {
          success: false,
          error: remainingAttempts > 0 
            ? `Password non valida. Rimangono ${remainingAttempts} tentativi.`
            : 'Account bloccato per troppi tentativi falliti.',
          remainingAttempts: Math.max(0, remainingAttempts)
        }
      }

      // 4. Reset tentativi e genera token
      await this.resetAttempts(email)

      const tokenHours = rememberMe 
        ? this.SESSION_DURATIONS.TOKEN_REMEMBER_ME 
        : this.SESSION_DURATIONS.TOKEN_NORMAL
      
      const payload = {
        userId: user.id,
        email: user.email,
        rememberMe: rememberMe,
        loginTime: Date.now()
      }

      const secret = import.meta.env.VITE_JWT_SECRET || 'tuo_segreto_sicuro'
      const token = createSimpleJWT(payload, secret, tokenHours)

      //console.log(`🔐 Token generato con scadenza: ${tokenHours} ore (Remember me: ${rememberMe})`)

      return {
        success: true,
        user: user,
        token: token
      }

    } catch (error) {
      //console.error('❌ Errore durante il login:', error)
      return {
        success: false,
        error: 'Errore interno del server'
      }
    }
  }

  // GESTIONE LOCKOUT
  private static async checkUserLockout(email: string): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('is_locked, lockout_time')
        .eq('email', email)
        .single()

      if (error || !user) return false

      if (user.is_locked && user.lockout_time) {
        const now = Date.now()
        if (now < user.lockout_time) {
          return true // Ancora bloccato
        } else {
          // Sblocca automaticamente
          await this.unlockUser(email)
          return false
        }
      }

      return user.is_locked || false
    } catch (error) {
      //console.error('❌ Errore controllo lockout:', error)
      return false
    }
  }

  private static async unlockUser(email: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_locked: false,
          lockout_time: null,
          attempts: 0
        })
        .eq('email', email)

      if (error) console.error('❌ Errore sblocco utente:', error)
    } catch (error) {
      console.error('❌ Errore sblocco utente:', error)
    }
  }

  private static async lockUser(email: string): Promise<void> {
    try {
      const lockoutTime = Date.now() + this.LOCKOUT_DURATION

      const { error } = await supabase
        .from('users')
        .update({
          is_locked: true,
          lockout_time: lockoutTime,
          attempts: this.MAX_ATTEMPTS
        })
        .eq('email', email)

      if (error) console.error('❌ Errore blocco utente:', error)
    } catch (error) {
      console.error('❌ Errore blocco utente:', error)
    }
  }

  private static async incrementFailedAttempts(email: string): Promise<number> {
    try {
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('attempts')
        .eq('email', email)
        .single()

      if (fetchError || !user) return 0

      const newAttempts = user.attempts + 1

      const { error: updateError } = await supabase
        .from('users')
        .update({ attempts: newAttempts })
        .eq('email', email)

      if (updateError) {
        //console.error('❌ Errore aggiornamento tentativi:', updateError)
        return user.attempts
      }

      if (newAttempts >= this.MAX_ATTEMPTS) {
        await this.lockUser(email)
      }

      return newAttempts
    } catch (error) {
      //console.error('❌ Errore incremento tentativi:', error)
      return 0
    }
  }

  private static async resetAttempts(email: string): Promise<void> {
  try {
    // Metodo più specifico che evita trigger automatici
    const { error } = await supabase
      .from('users')
      .update({ 
        attempts: 0,
        // Aggiungi esplicitamente updated_at se il campo esiste
        // updated_at: new Date().toISOString() // Decommenta se hai il campo
      })
      .eq('email', email)

    if (error) {
      //console.error('❌ Errore reset tentativi:', error)
      
      // FALLBACK: Prova con query diretta se l'update normale fallisce
      const { error: fallbackError } = await supabase.rpc('reset_user_attempts', {
        user_email: email
      })
      
      if (fallbackError) {
        //console.error('❌ Anche il fallback è fallito:', fallbackError)
      }
    } else {
      //console.log('✅ Tentativi resettati con successo')
    }
  } catch (error) {
    //console.error('❌ Errore reset tentativi:', error)
  }
}

  // GESTIONE TOKEN
  static verifyToken(token: string): any {
    const secret = import.meta.env.VITE_JWT_SECRET || 'tuo_segreto_sicuro'
    return verifySimpleJWT(token, secret)
  }

  static async refreshToken(currentToken: string): Promise<string | null> {
    const payload = this.verifyToken(currentToken)
    if (!payload) return null

    // Rinnova se scade tra meno di 1 ora
    const expiresIn = (payload.exp * 1000) - Date.now()
    const oneHour = 60 * 60 * 1000

    if (expiresIn < oneHour) {
      const secret = import.meta.env.VITE_JWT_SECRET || 'tuo_segreto_sicuro'
      const tokenHours = payload.rememberMe 
        ? this.SESSION_DURATIONS.TOKEN_REMEMBER_ME 
        : this.SESSION_DURATIONS.TOKEN_NORMAL

      const newPayload = {
        userId: payload.userId,
        email: payload.email,
        rememberMe: payload.rememberMe,
        loginTime: payload.loginTime
      }

      //console.log('🔄 Token rinnovato automaticamente')
      return createSimpleJWT(newPayload, secret, tokenHours)
    }

    return currentToken
  }

  // GESTIONE SESSIONI - SEMPLIFICATE
  static async createSession(userId: string, email: string, rememberMe: boolean = false): Promise<SessionInfo> {
    try {
      const now = Date.now()
      const sessionDuration = rememberMe 
        ? this.SESSION_DURATIONS.REMEMBER_ME_SESSION 
        : this.SESSION_DURATIONS.NORMAL_SESSION

      const sessionInfo: SessionInfo = {
        userId,
        email,
        loginTime: now,
        lastActivity: now,
        rememberMe,
        expiresAt: now + sessionDuration
      }

      // QUERY CORRETTA - Inserimento semplificato
      const { error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          email: email,
          login_time: sessionInfo.loginTime,
          last_activity: sessionInfo.lastActivity,
          expires_at: sessionInfo.expiresAt,
          is_active: true,
          remember_me: rememberMe,
          user_agent: navigator?.userAgent || 'Unknown',
          ip_address: 'Unknown'
        })

      if (error) {
        //console.error('❌ Errore creazione sessione DB:', error)
        // Non bloccare il login se la sessione DB fallisce
      } else {
        //console.log(`📅 Sessione creata con scadenza: ${new Date(sessionInfo.expiresAt).toLocaleString()}`)
      }
      
      return sessionInfo
    } catch (error) {
      //console.error('❌ Errore nella creazione della sessione:', error)
      // Ritorna comunque le info della sessione anche se il DB fallisce
      const now = Date.now()
      const sessionDuration = rememberMe 
        ? this.SESSION_DURATIONS.REMEMBER_ME_SESSION 
        : this.SESSION_DURATIONS.NORMAL_SESSION

      return {
        userId,
        email,
        loginTime: now,
        lastActivity: now,
        rememberMe,
        expiresAt: now + sessionDuration
      }
    }
  }

  static async updateLastActivity(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ last_activity: Date.now() })
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) {
        //console.error('❌ Errore aggiornamento attività:', error)
      }
    } catch (error) {
      //console.error('❌ Errore aggiornamento attività:', error)
    }
  }

  static async isSessionValid(userId: string, checkExpiration: boolean = true): Promise<boolean> {
    try {
      const { data: session, error } = await supabase
        .from('user_sessions')
        .select('last_activity, expires_at, remember_me')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error || !session) {
        //console.log('❌ Nessuna sessione attiva trovata nel DB')
        return false
      }

      const now = Date.now()

      // Controlla scadenza assoluta
      if (checkExpiration && session.expires_at && now > session.expires_at) {
        //console.log('⏰ Sessione scaduta per limite temporale')
        return false
      }

      // Controlla inattività solo per sessioni normali
      if (!session.remember_me) {
        const inactivityLimit = 2 * 60 * 60 * 1000 // 2 ore
        if ((now - session.last_activity) > inactivityLimit) {
          //console.log('😴 Sessione scaduta per inattività')
          return false
        }
      }

      return true
    } catch (error) {
      //console.error('❌ Errore verifica sessione:', error)
      return false
    }
  }

  static async getSessionExpirationInfo(userId: string): Promise<{
    expiresAt: number | null,
    remainingTime: number,
    rememberMe: boolean
  }> {
    try {
      const { data: session, error } = await supabase
        .from('user_sessions')
        .select('expires_at, remember_me')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error || !session) {
        //console.log('❌ Nessuna info sessione trovata')
        return { expiresAt: null, remainingTime: 0, rememberMe: false }
      }

      const remainingTime = session.expires_at ? Math.max(0, session.expires_at - Date.now()) : 0

      return {
        expiresAt: session.expires_at,
        remainingTime,
        rememberMe: session.remember_me || false
      }
    } catch (error) {
      //console.error('❌ Errore recupero info scadenza:', error)
      return { expiresAt: null, remainingTime: 0, rememberMe: false }
    }
  }

  // LOGOUT
  static async logout(userId?: string): Promise<LogoutResult> {
    try {
      if (userId) {
        const { error } = await supabase
          .from('user_sessions')
          .update({
            is_active: false,
            logout_time: Date.now()
          })
          .eq('user_id', userId)
          .eq('is_active', true)

        if (error) {
          //console.error('❌ Errore logout DB:', error)
        }
      }

      return { success: true }
    } catch (error) {
      //console.error('❌ Errore durante il logout:', error)
      return { success: true } // Non bloccare il logout per errori DB
    }
  }

  static async logoutFromAllDevices(userId: string): Promise<LogoutResult> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          logout_time: Date.now()
        })
        .eq('user_id', userId)

      if (error) {
        //console.error('❌ Errore logout tutti dispositivi:', error)
      }

      return { success: true }
    } catch (error) {
      //console.error('❌ Errore logout tutti dispositivi:', error)
      return { success: true }
    }
  }

  // UTILITÀ
  static async getRemainingLockoutTime(email: string): Promise<number> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('lockout_time, is_locked')
        .eq('email', email)
        .single()

      if (error || !user || !user.is_locked || !user.lockout_time) {
        return 0
      }

      const remaining = Math.ceil((user.lockout_time - Date.now()) / 60000)
      return Math.max(0, remaining)
    } catch (error) {
      //console.error('❌ Errore tempo lockout:', error)
      return 0
    }
  }

  static async createUser(email: string, password: string): Promise<boolean> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10)

      const { error } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: hashedPassword,
          attempts: 0,
          is_locked: false,
          lockout_time: null
        })

      return !error
    } catch (error) {
      //console.error('❌ Errore creazione utente:', error)
      return false
    }
  }
}