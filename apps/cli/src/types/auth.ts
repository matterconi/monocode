export type AuthStatus = "loading" | "unauthenticated" | "authenticating" | "authenticated" | "error"

export type AuthUserInfo = {
  sub: string
  name: string | null
  givenName: string | null
  familyName: string | null
  nickname: string | null
  preferredUsername: string | null
  picture: string | null
  email: string | null
  emailVerified: boolean | null
}

export type AuthSession = {
  accessToken: string
  refreshToken: string | null
  idToken: string | null
  expiresAt: number
  tokenType: string
  scope: string | null
  userInfo: AuthUserInfo | null
}

export interface AuthContextValue {
  actions: {
    login: () => Promise<void>
    logout: () => Promise<void>
    refreshAccessToken: () => Promise<AuthSession>
  }
  state: {
    error: string | null
    session: AuthSession | null
    status: AuthStatus
  }
}
