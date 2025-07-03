// useAuth.ts - VERSIONE RESILIENTE COMPLETATA
import { useState, useEffect } from 'react'
import { AuthService } from '../backend/auth.ts'
import type { LoginResult } from '../backend/auth.ts'

interface AuthState {
  isAuthenticated: boolean
  user: any | null
  isLoading: boolean
  error: string | null
  isLocked: boolean
  remainingAttempts: number
}

// Cookie Manager - IDENTICO
class SecureCookieManager {
  static setCookie(name: string, value: string, days: number = 7): void {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    
    const isSecure = location.protocol === 'https:'
    const secureFlag = isSecure ? '; Secure' : ''
    const sameSite = isSecure ? '; SameSite=Strict' : '; SameSite=Lax'
    
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/${sameSite}${secureFlag}`
    //console.log(`🍪 Cookie impostato: ${name} (scadenza: ${expires.toLocaleDateString()})`)
  }

  static getCookie(name: string): string | null {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length)
      }
    }
    return null
  }

  static deleteCookie(name: string): void {
    const deleteCookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
    document.cookie = deleteCookieString
    document.cookie = deleteCookieString + '; SameSite=Lax'
    if (location.protocol === 'https:') {
      document.cookie = deleteCookieString + '; SameSite=Strict; Secure'
    }
    //console.log(`🍪 Cookie eliminato: ${name}`)
  }

  static deleteAllAuthCookies(): void {
    const cookiesToDelete = ['auth_token', 'session_id', 'user_id', 'user_email', 'remember_me', 'session_expires', 'last_activity']
    cookiesToDelete.forEach(cookie => this.deleteCookie(cookie))
    //console.log('🧹 Tutti i cookie di autenticazione eliminati')
  }

  static saveAuthToken(token: string, rememberMe: boolean): void {
    const days = rememberMe ? 30 : 7
    this.setCookie('auth_token', token, days)
  }

  static getAuthToken(): string | null {
    return this.getCookie('auth_token')
  }

  static updateLastActivity(): void {
    const now = Date.now().toString()
    this.setCookie('last_activity', now, 1) // Cookie di 1 giorno per l'attività
  }
}

// Session Manager - VERSIONE RESILIENTE COMPLETATA
class SessionManager {
  private static activityTimer: NodeJS.Timeout | null = null
  private static sessionCheckTimer: NodeJS.Timeout | null = null
  private static isInitialized = false

  // STRATEGIA: Prima salva nei cookie, poi tenta il DB
  static async createSession(userId: string, email: string, token: string, rememberMe: boolean = false): Promise<void> {
    try {
      //console.log('✅ Creo sessione locale (cookie)...')
      
      // 1. PRIMA: Salva SEMPRE nei cookie (essenziale)
      const cookieExpiry = rememberMe ? 30 : 7
      
      SecureCookieManager.saveAuthToken(token, rememberMe)
      SecureCookieManager.setCookie('user_id', userId, cookieExpiry)
      SecureCookieManager.setCookie('user_email', email, cookieExpiry)
      SecureCookieManager.setCookie('remember_me', rememberMe.toString(), cookieExpiry)
      
      // Calcola e salva la scadenza della sessione
      const now = Date.now()
      const sessionDuration = rememberMe ? (30 * 24 * 60 * 60 * 1000) : (8 * 60 * 60 * 1000)
      const expiresAt = now + sessionDuration
      SecureCookieManager.setCookie('session_expires', expiresAt.toString(), cookieExpiry)
      
      // Inizializza l'attività
      SecureCookieManager.updateLastActivity()

      // 2. POI: Tenta di salvare nel DB (non bloccante)
      try {
        await AuthService.createSession(userId, email, rememberMe)
        //console.log('✅ Sessione salvata anche nel database')
      } catch (dbError) {
        //console.warn('⚠️ Errore salvataggio sessione DB (ma continuo comunque):', dbError)
        // NON lanciare errore - la sessione locale è sufficiente
      }
      
      // 3. Avvia controlli
      this.startActivityCheck()

    } catch (error) {
      //console.error('❌ Errore nella creazione della sessione:', error)
      throw error
    }
  }

  // VERIFICA SESSIONE: Prima controlla i cookie, poi eventualmente il DB
  static async isSessionValid(): Promise<{ isValid: boolean; user?: any }> {
    try {
      //console.log('🔍 Verifico validità sessione...')
      
      // 1. Controlla i dati locali (cookie)
      const token = SecureCookieManager.getAuthToken()
      const userId = SecureCookieManager.getCookie('user_id')
      const userEmail = SecureCookieManager.getCookie('user_email')
      const rememberMe = SecureCookieManager.getCookie('remember_me') === 'true'
      const sessionExpires = SecureCookieManager.getCookie('session_expires')

      if (!token || !userId || !userEmail) {
        //console.log('❌ Dati sessione mancanti nei cookie')
        return { isValid: false }
      }

      // 2. Verifica il token JWT (locale, veloce)
      const tokenPayload = AuthService.verifyToken(token)
      if (!tokenPayload) {
        //console.log('❌ Token JWT non valido o scaduto')
        return { isValid: false }
      }

      // 3. Controlla scadenza sessione (locale)
      if (sessionExpires) {
        const expiresAt = parseInt(sessionExpires)
        const now = Date.now()
        
        if (now > expiresAt) {
          //console.log('⏰ Sessione scaduta (controllo locale)')
          return { isValid: false }
        }

        // Se non è "remember me", controlla anche inattività
        if (!rememberMe) {
          const lastActivity = parseInt(SecureCookieManager.getCookie('last_activity') || '0')
          const inactivityLimit = 2 * 60 * 60 * 1000 // 2 ore
          
          if (lastActivity && (now - lastActivity) > inactivityLimit) {
            //console.log('😴 Sessione scaduta per inattività')
            return { isValid: false }
          }
        }
      }

      // 4. OPZIONALE: Controlla anche il database (non bloccante)
      try {
        const isDbSessionValid = await AuthService.isSessionValid(userId, true)
        if (!isDbSessionValid) {
          //console.warn('⚠️ Sessione non valida nel database, ma token locale OK')
          // Decidi qui: vuoi invalidare anche se il token è OK?
          // Per ora proseguiamo con la sessione locale
        }
      } catch (dbError) {
        //console.warn('⚠️ Errore controllo DB (continuo con sessione locale):', dbError)
      }

      // 5. Aggiorna attività se tutto OK
      SecureCookieManager.updateLastActivity()

      //console.log('✅ Sessione locale valida confermata')
      return { 
        isValid: true, 
        user: { id: userId, email: userEmail } 
      }

    } catch (error) {
      //console.error('❌ Errore nella verifica della sessione:', error)
      return { isValid: false }
    }
  }

  // Aggiorna attività (locale + DB se possibile)
  static async updateActivity(userId: string): Promise<void> {
    try {
      // 1. SEMPRE aggiorna locale
      SecureCookieManager.updateLastActivity()
      
      // 2. Prova ad aggiornare il DB (non bloccante)
      try {
        await AuthService.updateLastActivity(userId)
        //console.log('🔄 Attività aggiornata (locale + DB)')
      } catch (dbError) {
        //console.warn('⚠️ Errore aggiornamento attività DB (locale OK):', dbError)
      }
    } catch (error) {
      //console.error('❌ Errore aggiornamento attività:', error)
    }
  }

  // Distrugge la sessione
  static async destroySession(userId?: string): Promise<void> {
    try {
      // 1. SEMPRE pulisci i cookie
      SecureCookieManager.deleteAllAuthCookies()
      
      // 2. Ferma i timer
      this.stopAllTimers()
      
      // 3. Prova logout DB (non bloccante)
      if (userId) {
        try {
          await AuthService.logout(userId)
          //console.log('🗑️ Logout DB completato')
        } catch (dbError) {
          //console.warn('⚠️ Errore logout DB (locale OK):', dbError)
        }
      }
      
      //console.log('🗑️ Sessione locale distrutta')
    } catch (error) {
      //console.error('❌ Errore distruzione sessione:', error)
    }
  }

  // Ottieni info sessione (principalmente dai cookie)
  static async getSessionInfo(): Promise<{
    expiresAt: number | null
    remainingTime: number
    rememberMe: boolean
    tokenExpiresIn: number
    lastActivity: number | null
  }> {
    try {
      const sessionExpires = SecureCookieManager.getCookie('session_expires')
      const rememberMe = SecureCookieManager.getCookie('remember_me') === 'true'
      const lastActivity = parseInt(SecureCookieManager.getCookie('last_activity') || '0')
      const token = SecureCookieManager.getAuthToken()
      
      let expiresAt: number | null = null
      let remainingTime = 0
      let tokenExpiresIn = 0

      if (sessionExpires) {
        expiresAt = parseInt(sessionExpires)
        remainingTime = Math.max(0, expiresAt - Date.now())
      }

      if (token) {
        const payload = AuthService.verifyToken(token)
        if (payload && payload.exp) {
          tokenExpiresIn = Math.max(0, (payload.exp * 1000) - Date.now())
        }
      }

      return {
        expiresAt,
        remainingTime,
        rememberMe,
        tokenExpiresIn,
        lastActivity: lastActivity || null
      }
    } catch (error) {
      //console.error('❌ Errore recupero info sessione:', error)
      return { 
        expiresAt: null, 
        remainingTime: 0, 
        rememberMe: false, 
        tokenExpiresIn: 0, 
        lastActivity: null 
      }
    }
  }

  // Rinnova il token se necessario
  static async refreshTokenIfNeeded(): Promise<boolean> {
    try {
      const token = SecureCookieManager.getAuthToken()
      if (!token) return false

      const refreshedToken = await AuthService.refreshToken(token)
      if (refreshedToken && refreshedToken !== token) {
        const rememberMe = SecureCookieManager.getCookie('remember_me') === 'true'
        SecureCookieManager.saveAuthToken(refreshedToken, rememberMe)
        //console.log('🔄 Token rinnovato automaticamente')
        return true
      }

      return false
    } catch (error) {
      //console.error('❌ Errore rinnovo token:', error)
      return false
    }
  }

  // CONTROLLI PERIODICI
  private static startActivityCheck(): void {
    if (this.activityTimer || this.isInitialized) return

    this.isInitialized = true
    //console.log('⏰ Avvio controllo attività periodico (ogni 5 minuti)')

    this.activityTimer = setInterval(async () => {
      const userId = SecureCookieManager.getCookie('user_id')
      if (userId) {
        await this.updateActivity(userId)
        await this.refreshTokenIfNeeded()
      }
    }, 5 * 60 * 1000) // Ogni 5 minuti

    this.setupActivityListeners()
  }

  private static setupActivityListeners(): void {
    // Aggiorna attività su interazioni utente
    const updateOnActivity = () => {
      SecureCookieManager.updateLastActivity()
    }

    // Debounce per evitare troppi aggiornamenti
    let activityTimeout: NodeJS.Timeout
    const debouncedUpdate = () => {
      clearTimeout(activityTimeout)
      activityTimeout = setTimeout(updateOnActivity, 2000)
    }

    // Eventi che indicano attività
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, debouncedUpdate, { passive: true })
    })

    // Aggiorna quando la finestra torna in focus
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        //console.log('👁️ Finestra tornata in focus')
        SecureCookieManager.updateLastActivity()
      }
    })
  }

  private static stopAllTimers(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer)
      this.activityTimer = null
    }
    
    if (this.sessionCheckTimer) {
      clearInterval(this.sessionCheckTimer)
      this.sessionCheckTimer = null
    }
    
    this.isInitialized = false
    //console.log('🛑 Tutti i timer fermati')
  }
}

// HOOK USEAUTH PRINCIPALE
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
    isLocked: false,
    remainingAttempts: 5
  })

  // Inizializzazione
  useEffect(() => {
    //console.log('🚀 Inizializzazione hook useAuth...')
    checkExistingSession()
  }, [])

  // Controllo periodico della sessione (solo se autenticato)
  useEffect(() => {
    if (!authState.isAuthenticated) return

    //console.log('⏰ Avvio controllo periodico validità sessione (ogni 2 minuti)')
    
    const sessionCheckInterval = setInterval(async () => {
      const { isValid, user } = await SessionManager.isSessionValid()
      
      if (!isValid) {
        //console.log('⚠️ Sessione non più valida, effettuo logout automatico')
        await logout()
      } else if (user) {
        await SessionManager.updateActivity(user.id)
      }
    }, 2 * 60 * 1000) // Ogni 2 minuti

    return () => {
      clearInterval(sessionCheckInterval)
      //console.log('🛑 Controllo periodico sessione fermato')
    }
  }, [authState.isAuthenticated])

  // Controlla se esiste una sessione valida
  const checkExistingSession = async () => {
    //console.log('🔍 Controllo sessione esistente...')
    
    try {
      const { isValid, user } = await SessionManager.isSessionValid()
      
      if (isValid && user) {
        //console.log('✅ Sessione esistente valida trovata')
        
        setAuthState({
          isAuthenticated: true,
          user: user,
          isLoading: false,
          error: null,
          isLocked: false,
          remainingAttempts: 5
        })

        // Mostra info sessione
        
        return
      }

      //console.log('❌ Nessuna sessione valida trovata')
      SecureCookieManager.deleteAllAuthCookies()
      setAuthState(prev => ({ ...prev, isLoading: false }))
      
    } catch (error) {
      //console.error('❌ Errore nel controllo della sessione:', error)
      SecureCookieManager.deleteAllAuthCookies()
      setAuthState(prev => ({ ...prev, isLoading: false, error: 'Errore nel caricamento della sessione' }))
    }
  }

  // LOGIN
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<LoginResult> => {
    //console.log('🔐 Inizio processo di login...', { email, rememberMe })
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await AuthService.login(email, password, rememberMe)
      //console.log('📊 Risultato login dal server:', { success: result.success, hasUser: !!result.user, hasToken: !!result.token })

      if (result.success && result.user && result.token) {
        //console.log('✅ Login riuscito, creo sessione persistente...')
        
        // Crea sessione con strategia resiliente
        await SessionManager.createSession(
          result.user.id, 
          result.user.email, 
          result.token,
          rememberMe
        )

        setAuthState({
          isAuthenticated: true,
          user: { id: result.user.id, email: result.user.email },
          isLoading: false,
          error: null,
          isLocked: false,
          remainingAttempts: 5
        })
      } else {
        //console.log('❌ Login fallito:', result.error)
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Login fallito',
          isLocked: result.isLocked || false,
          remainingAttempts: result.remainingAttempts || 0
        }))
      }

      return result
    } catch (error) {
      //console.error('❌ Errore durante il login:', error)
      const errorMessage = 'Errore di connessione al server'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // LOGOUT
  const logout = async () => {
    //console.log('👋 Inizio processo di logout...')
    const userId = SecureCookieManager.getCookie('user_id')
    
    await SessionManager.destroySession(userId || undefined)
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      isLocked: false,
      remainingAttempts: 5
    })

    //console.log('✅ Logout completato con successo')
  }

  // LOGOUT DA TUTTI I DISPOSITIVI
  const logoutFromAllDevices = async () => {
    //console.log('👋 Logout da tutti i dispositivi...')
    const userId = SecureCookieManager.getCookie('user_id')
    
    if (userId) {
      try {
        await AuthService.logoutFromAllDevices(userId)
        //console.log('✅ Logout DB da tutti i dispositivi completato')
      } catch (error) {
        //console.warn('⚠️ Errore logout DB da tutti i dispositivi:', error)
      }
    }
    
    await SessionManager.destroySession(userId || undefined)
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      isLocked: false,
      remainingAttempts: 5
    })

    //console.log('✅ Logout da tutti i dispositivi completato')
  }

  // UTILITÀ
  const getRemainingLockoutTime = async (email: string): Promise<number> => {
    try {
      return await AuthService.getRemainingLockoutTime(email)
    } catch (error) {
      //console.error('❌ Errore tempo lockout:', error)
      return 0
    }
  }

  const getSessionInfo = async () => {
    return await SessionManager.getSessionInfo()
  }

  // Cleanup
  useEffect(() => {
    return () => {
      // Non fermare i timer qui perché potrebbero essere necessari per altre istanze
      //console.log('🧹 Hook useAuth smontato')
    }
  }, [])

  return {
    ...authState,
    login,
    logout,
    logoutFromAllDevices,
    getRemainingLockoutTime,
    checkSession: checkExistingSession,
    getSessionInfo,
    refreshToken: SessionManager.refreshTokenIfNeeded
  }
}