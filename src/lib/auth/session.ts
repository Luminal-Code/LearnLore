import type { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { Err, Ok, type Result } from '@/lib/result';
import type { SessionError } from '@/lib/auth/errors';
import { generateToken } from '@/lib/auth/token-generator';

const SESSION_DURATION_IN_HOURS = 1;
export const SESSION_COOKIE_NAME = '__Host-session';

export async function createSession(userId: string): Promise<Result<string, SessionError>> {
  const sessionToken = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_IN_HOURS * 60 * 60 * 1000);

  try {
    await db.session.create({
      data: {
        userId,
        sessionToken,
        expiresAt,
      },
    });

    return Ok(sessionToken);
  } catch (cause) {
    return Err({ type: 'DatabaseError', cause });
  }
}

export async function getUserBySession(sessionToken: string): Promise<Result<{
  id: string;
  displayName: string;
  role: string;
}, SessionError>> {
  const tokenResult = validateSessionToken(sessionToken);
  if (tokenResult.type === 'Err') {
    return tokenResult;
  }

  try {
    const session = await db.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session) {
      return Err({ type: 'SessionNotFound' });
    }

    if (session.expiresAt <= new Date()) {
      return Err({ type: 'SessionExpired', expiresAt: session.expiresAt });
    }

    return Ok(session.user);
  } catch (cause) {
    return Err({ type: 'DatabaseError', cause });
  }
}

export async function deleteSession(sessionToken: string): Promise<Result<void, SessionError>> {
  const tokenResult = validateSessionToken(sessionToken);
  if (tokenResult.type === 'Err') {
    return tokenResult;
  }

  try {
    const session = await db.session.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      return Err({ type: 'SessionNotFound' });
    }

    if (session.expiresAt <= new Date()) {
      return Err({ type: 'SessionExpired', expiresAt: session.expiresAt });
    }

    await db.session.delete({
      where: { sessionToken },
    });

    return Ok(undefined);
  } catch (cause) {
    return Err({ type: 'DatabaseError', cause });
  }
}

export function setSessionCookie(response: NextResponse, sessionToken: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: SESSION_DURATION_IN_HOURS * 60 * 60,
  });
}

export function setSessionCookieForOAuthCallback(response: NextResponse, sessionToken: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60,
  });
}

export function removeSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
  });
}

export function getSessionTokenFromRequest(request: NextRequest): Result<string, { status: number; error: string }> {
  const cookieToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieToken) {
    return Ok(cookieToken);
  }

  const authorization = request.headers.get('authorization');
  if (!authorization) {
    return Err({ status: 401, error: 'You are not logged in' });
  }

  if (!authorization.startsWith('Bearer ')) {
    return Err({ status: 401, error: 'You are not logged in' });
  }

  return Ok(authorization.slice('Bearer '.length));
}

export function validateSessionToken(token: string): Result<void, SessionError> {
  if (!token) {
    return Err({ type: 'InvalidToken' });
  }

  if (token.length < 40 || token.length > 50) {
    return Err({ type: 'InvalidToken' });
  }

  if (!/^[A-Za-z0-9_-]+$/.test(token)) {
    return Err({ type: 'InvalidToken' });
  }

  return Ok(undefined);
}
