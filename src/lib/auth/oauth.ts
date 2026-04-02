import { db } from '@/lib/db';
import { Err, Ok, type Result } from '@/lib/result';
import type { OAuthError, StateError } from '@/lib/auth/errors';
import { generateState, validateState } from '@/lib/auth/oauth-state';
import { createSession } from '@/lib/auth/session';
import { generateToken } from '@/lib/auth/token-generator';
import type { GoogleTokenResponse, GoogleUser, ProviderUser, TokenResponse } from '@/lib/auth/types';
import { Prisma } from '@prisma/client';
import { inspect } from 'node:util';

interface OAuthProvider {
  providerName(): string;
  identifierType(): string;
  clientId(): Result<string, OAuthError>;
  clientSecret(): Result<string, OAuthError>;
  redirectUri(): Result<string, OAuthError>;
  tenantId(): Result<string, OAuthError>;
  authorizationEndpoint(): string;
  tokenEndpoint(): string;
  userinfoEndpoint(): string;
  scopes(): string;
  getUserInfo(accessToken: string): Promise<Result<ProviderUser, OAuthError>>;
};

function env(name: string): Result<string, OAuthError> {
  const value = process.env[name];
  if (!value) {
    return Err({ type: 'MissingEnvVar', name });
  }

  return Ok(value);
}

function buildAuthorizationUrl(
  endpoint: string,
  clientId: string,
  redirectUri: string,
  scope: string,
  state: string,
): Result<string, OAuthError> {
  try {
    const url = new URL(endpoint);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scope);
    url.searchParams.set('state', state);
    return Ok(url.toString());
  } catch (error) {
    return Err({
      type: 'UrlBuildError',
      message: error instanceof Error ? error.message : 'Failed to build authorization URL',
    });
  }
}

async function exchangeCodeRequest(
  endpoint: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  code: string,
): Promise<Result<Response, OAuthError>> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return Err({ type: 'InvalidResponse' });
    }

    return Ok(response);
  } catch (cause) {
    return Err({ type: 'HttpError', cause });
  }
}

async function parseJson<T>(response: Response): Promise<Result<T, OAuthError>> {
  try {
    const json = (await response.json()) as T;
    return Ok(json);
  } catch (error) {
    return Err({
      type: 'ParseError',
      message: error instanceof Error ? error.message : 'Failed to parse JSON response',
    });
  }
}

export function oauthErrorToString(error: OAuthError): string {
  switch (error.type) {
    case 'MissingEnvVar':
      return `Missing required environment variable: ${error.name}`;
    case 'UrlBuildError':
      return `Failed to build authorization URL: ${error.message}`;
    case 'HttpError':
      return `HTTP request failed: ${String(error.cause)}`;
    case 'ParseError':
      return `Failed to parse JSON response: ${error.message}`;
    case 'UserNotFound':
      return 'User not found';
    case 'DatabaseError':
      return `Database error: ${String(error.cause)}`;
    case 'InvalidResponse':
      return 'Invalid response from OAuth provider';
  }
}

export function oauthErrorToDebugString(error: OAuthError): string {
  if (error.type !== 'DatabaseError') {
    return oauthErrorToString(error);
  }

  const cause = error.cause;

  if (cause instanceof Prisma.PrismaClientKnownRequestError) {
    return `Database error (${cause.code}): ${cause.message}`;
  }

  if (cause instanceof Prisma.PrismaClientValidationError) {
    return `Database validation error: ${cause.message}`;
  }

  if (cause instanceof Prisma.PrismaClientInitializationError) {
    return `Database initialization error: ${cause.message}`;
  }

  if (cause instanceof Prisma.PrismaClientRustPanicError) {
    return `Database panic: ${cause.message}`;
  }

  if (cause instanceof Error) {
    const details = Object.fromEntries(
      Object.getOwnPropertyNames(cause).map((key) => [key, Reflect.get(cause, key)]),
    );
    const inspected = inspect(details, { depth: 6, breakLength: Infinity });
    return `Database error: ${cause.message}${inspected === '{}' ? '' : ` | details: ${inspected}`}`;
  }

  return `Database error: ${inspect(cause, { depth: 6, breakLength: Infinity })}`;
}

export function stateErrorToString(error: StateError): string {
  switch (error.type) {
    case 'GenerationError':
      return 'Failed to generate state token';
    case 'ValidationFailed':
      return 'State validation failed';
  }
}

export function getGoogleAuthorizationUrl(state: string): Result<string, OAuthError> {
  const clientId = env('GOOGLE_CLIENT_ID');
  if (clientId.type === 'Err') return clientId;

  const redirectUri = env('GOOGLE_REDIRECT_URI');
  if (redirectUri.type === 'Err') return redirectUri;

  return buildAuthorizationUrl(
    'https://accounts.google.com/o/oauth2/v2/auth',
    clientId.value,
    redirectUri.value,
    'openid email profile',
    state,
  );
}

export async function exchangeGoogleCode(code: string): Promise<Result<GoogleTokenResponse, OAuthError>> {
  const clientId = env('GOOGLE_CLIENT_ID');
  if (clientId.type === 'Err') return clientId;

  const clientSecret = env('GOOGLE_CLIENT_SECRET');
  if (clientSecret.type === 'Err') return clientSecret;

  const redirectUri = env('GOOGLE_REDIRECT_URI');
  if (redirectUri.type === 'Err') return redirectUri;

  const response = await exchangeCodeRequest(
    'https://oauth2.googleapis.com/token',
    clientId.value,
    clientSecret.value,
    redirectUri.value,
    code,
  );

  if (response.type === 'Err') {
    return response;
  }

  return parseJson<GoogleTokenResponse>(response.value);
}

export async function getGoogleUserInfo(accessToken: string): Promise<Result<GoogleUser, OAuthError>> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return Err({ type: 'InvalidResponse' });
    }

    return parseJson<GoogleUser>(response);
  } catch (cause) {
    return Err({ type: 'HttpError', cause });
  }
}

export async function findOrCreateGoogleUser(profile: GoogleUser): Promise<Result<string, OAuthError>> {
  try {
    const existing = await db.userIdentifier.findUnique({
      where: {
        identifierType_identifierValue: {
          identifierType: 'google',
          identifierValue: profile.id,
        },
      },
    });

    if (existing) {
      return Ok(existing.userId);
    }

    const displayName = profile.name ?? profile.email.split('@')[0] ?? 'User';
    const placeholderPassword = `oauth_google_${generateToken()}`;

    const createdUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          displayName,
          passwordHash: placeholderPassword,
        },
      });

      await tx.userIdentifier.create({
        data: {
          userId: user.id,
          identifierType: 'google',
          identifierValue: profile.id,
        },
      });

      return user;
    });

    return Ok(createdUser.id);
  } catch (cause) {
    return Err({ type: 'DatabaseError', cause });
  }
}

class DiscordProvider implements OAuthProvider {
  providerName(): string {
    return 'discord';
  }

  identifierType(): string {
    return 'discord';
  }

  clientId(): Result<string, OAuthError> {
    return env('DISCORD_CLIENT_ID');
  }

  clientSecret(): Result<string, OAuthError> {
    return env('DISCORD_CLIENT_SECRET');
  }

  redirectUri(): Result<string, OAuthError> {
    return env('DISCORD_REDIRECT_URI');
  }

  tenantId(): Result<string, OAuthError> {
    return Ok('');
  }

  authorizationEndpoint(): string {
    return 'https://discord.com/oauth2/authorize';
  }

  tokenEndpoint(): string {
    return 'https://discord.com/api/oauth2/token';
  }

  userinfoEndpoint(): string {
    return 'https://discord.com/api/users/@me';
  }

  scopes(): string {
    return 'identify email';
  }

  async getUserInfo(accessToken: string): Promise<Result<ProviderUser, OAuthError>> {
    try {
      const response = await fetch(this.userinfoEndpoint(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        return Err({ type: 'InvalidResponse' });
      }

      const parsed = await parseJson<{
        id: string;
        username: string;
        email: string;
        avatar?: string;
      }>(response);

      if (parsed.type === 'Err') {
        return parsed;
      }

      const discordUser = parsed.value;
      const picture = discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : undefined;

      return Ok({
        id: discordUser.id,
        email: discordUser.email,
        name: discordUser.username,
        picture,
      });
    } catch (cause) {
      return Err({ type: 'HttpError', cause });
    }
  }
}

class MicrosoftProvider implements OAuthProvider {
  providerName(): string {
    return 'microsoft';
  }

  identifierType(): string {
    return 'microsoft';
  }

  clientId(): Result<string, OAuthError> {
    return env('MICROSOFT_CLIENT_ID');
  }

  clientSecret(): Result<string, OAuthError> {
    return env('MICROSOFT_CLIENT_SECRET');
  }

  redirectUri(): Result<string, OAuthError> {
    return env('MICROSOFT_REDIRECT_URI');
  }

  tenantId(): Result<string, OAuthError> {
    return Ok(process.env.MICROSOFT_TENANT_ID ?? 'common');
  }

  authorizationEndpoint(): string {
    return 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
  }

  tokenEndpoint(): string {
    return 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  }

  userinfoEndpoint(): string {
    return 'https://graph.microsoft.com/oidc/userinfo';
  }

  scopes(): string {
    return 'openid profile email';
  }

  async getUserInfo(accessToken: string): Promise<Result<ProviderUser, OAuthError>> {
    try {
      const response = await fetch(this.userinfoEndpoint(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        return Err({ type: 'InvalidResponse' });
      }

      const parsed = await parseJson<{
        sub: string;
        name?: string;
        given_name?: string;
        family_name?: string;
        email?: string;
        picture?: string;
      }>(response);

      if (parsed.type === 'Err') {
        return parsed;
      }

      const microsoftUser = parsed.value;
      if (!microsoftUser.email) {
        return Err({ type: 'InvalidResponse' });
      }

      const name =
        microsoftUser.name ??
        (microsoftUser.given_name && microsoftUser.family_name
          ? `${microsoftUser.given_name} ${microsoftUser.family_name}`
          : microsoftUser.given_name ?? microsoftUser.family_name);

      return Ok({
        id: microsoftUser.sub,
        email: microsoftUser.email,
        name,
        picture: microsoftUser.picture,
      });
    } catch (cause) {
      return Err({ type: 'HttpError', cause });
    }
  }
}

async function exchangeProviderCode(
  provider: OAuthProvider,
  code: string,
): Promise<Result<TokenResponse, OAuthError>> {
  const clientId = provider.clientId();
  if (clientId.type === 'Err') return clientId;

  const clientSecret = provider.clientSecret();
  if (clientSecret.type === 'Err') return clientSecret;

  const redirectUri = provider.redirectUri();
  if (redirectUri.type === 'Err') return redirectUri;

  const response = await exchangeCodeRequest(
    provider.tokenEndpoint(),
    clientId.value,
    clientSecret.value,
    redirectUri.value,
    code,
  );

  if (response.type === 'Err') {
    return response;
  }

  return parseJson<TokenResponse>(response.value);
}

async function findOrCreateProviderUser(
  provider: OAuthProvider,
  profile: ProviderUser,
): Promise<Result<string, OAuthError>> {
  const identifierType = provider.identifierType();

  try {
    const existing = await db.userIdentifier.findUnique({
      where: {
        identifierType_identifierValue: {
          identifierType,
          identifierValue: profile.id,
        },
      },
    });

    if (existing) {
      return Ok(existing.userId);
    }

    const displayName = profile.name ?? profile.email.split('@')[0] ?? 'User';
    const placeholderPassword = `oauth_${identifierType}_${generateToken()}`;

    const createdUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          displayName,
          passwordHash: placeholderPassword,
        },
      });

      await tx.userIdentifier.create({
        data: {
          userId: user.id,
          identifierType,
          identifierValue: profile.id,
        },
      });

      return user;
    });

    return Ok(createdUser.id);
  } catch (cause) {
    return Err({ type: 'DatabaseError', cause });
  }
}

export async function getProviderAuthorizationUrl(
  provider: OAuthProvider,
): Promise<Result<{ state: string; url: string }, OAuthError | StateError>> {
  const state = generateState();
  if (state.type === 'Err') {
    return state;
  }

  const clientId = provider.clientId();
  if (clientId.type === 'Err') return clientId;

  const redirectUri = provider.redirectUri();
  if (redirectUri.type === 'Err') return redirectUri;

  const url = buildAuthorizationUrl(
    provider.authorizationEndpoint(),
    clientId.value,
    redirectUri.value,
    provider.scopes(),
    state.value,
  );

  if (url.type === 'Err') {
    return url;
  }

  return Ok({ state: state.value, url: url.value });
}

export async function handleProviderCallback(
  provider: OAuthProvider,
  code: string,
  state: string,
  storedState: string,
): Promise<Result<{ sessionToken: string; providerName: string }, OAuthError | StateError>> {
  if (!validateState(state, storedState)) {
    return Err({ type: 'ValidationFailed' });
  }

  const tokenResponse = await exchangeProviderCode(provider, code);
  if (tokenResponse.type === 'Err') {
    return tokenResponse;
  }

  const userInfo = await provider.getUserInfo(tokenResponse.value.access_token);
  if (userInfo.type === 'Err') {
    return userInfo;
  }

  const userId = await findOrCreateProviderUser(provider, userInfo.value);
  if (userId.type === 'Err') {
    return userId;
  }

  const sessionToken = await createSession(userId.value);
  if (sessionToken.type === 'Err') {
    return Err({ type: 'DatabaseError', cause: sessionToken.error });
  }

  return Ok({
    sessionToken: sessionToken.value,
    providerName: provider.providerName(),
  });
}

export function createDiscordProvider(): OAuthProvider {
  return new DiscordProvider();
}

export function createMicrosoftProvider(): OAuthProvider {
  return new MicrosoftProvider();
}
