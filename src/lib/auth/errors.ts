export type AuthError =
  | { type: 'InvalidData'; errors: string[] }
  | { type: 'DatabaseError'; cause: unknown }
  | { type: 'NotUniqueError'; identifierType: string }
  | { type: 'PasswordHashError'; cause: unknown }
  | { type: 'PasswordVerificationError'; cause: unknown }
  | { type: 'UserNotFound' };

export type SessionError =
  | { type: 'SessionExpired'; expiresAt: Date }
  | { type: 'SessionNotFound' }
  | { type: 'InvalidToken' }
  | { type: 'DatabaseError'; cause: unknown }
  | { type: 'UserNotFound' };

export type OAuthError =
  | { type: 'MissingEnvVar'; name: string }
  | { type: 'UrlBuildError'; message: string }
  | { type: 'HttpError'; cause: unknown }
  | { type: 'ParseError'; message: string }
  | { type: 'UserNotFound' }
  | { type: 'DatabaseError'; cause: unknown }
  | { type: 'InvalidResponse' };

export type StateError = { type: 'GenerationError' } | { type: 'ValidationFailed' };
