import type { NextRequest } from 'next/server';

import { apiData, apiError, jsonResponse } from '@/lib/auth/server';
import {
  exchangeGoogleCode,
  findOrCreateGoogleUser,
  getGoogleUserInfo,
} from '@/lib/auth/oauth';
import { validateState } from '@/lib/auth/oauth-state';
import { createSession, setSessionCookieForOAuthCallback } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') ?? '';
  const state = request.nextUrl.searchParams.get('state') ?? '';
  const storedState = request.cookies.get('google_oauth_state')?.value ?? '';

  if (!validateState(state, storedState)) {
    return jsonResponse(400, apiError('Invalid authentication state'));
  }

  const tokenResponse = await exchangeGoogleCode(code);
  if (tokenResponse.type === 'Err') {
    return jsonResponse(400, apiError('Failed to exchange authorization code'));
  }

  const userInfo = await getGoogleUserInfo(tokenResponse.value.access_token);
  if (userInfo.type === 'Err') {
    return jsonResponse(400, apiError('Failed to get user information'));
  }

  const userId = await findOrCreateGoogleUser(userInfo.value);
  if (userId.type === 'Err') {
    return jsonResponse(500, apiError(`Failed to authenticate user: ${JSON.stringify(userId.error)}`));
  }

  const sessionToken = await createSession(userId.value);
  if (sessionToken.type === 'Err') {
    return jsonResponse(500, apiError('Failed to create session'));
  }

  const response = jsonResponse(200, apiData('Successfully authenticated with Google'));
  setSessionCookieForOAuthCallback(response, sessionToken.value);
  response.cookies.set('google_oauth_state', '', {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
  });

  return response;
}
