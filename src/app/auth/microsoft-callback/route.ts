import type { NextRequest } from 'next/server';

import { apiData, apiError, jsonResponse } from '@/lib/auth/server';
import {
  createMicrosoftProvider,
  handleProviderCallback,
  oauthErrorToString,
  oauthErrorToDebugString,
} from '@/lib/auth/oauth';
import { setSessionCookieForOAuthCallback } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') ?? '';
  const state = request.nextUrl.searchParams.get('state') ?? '';
  const storedState = request.cookies.get('microsoft_oauth_state')?.value ?? '';

  const result = await handleProviderCallback(createMicrosoftProvider(), code, state, storedState);
  if (result.type === 'Err') {
    if (result.error.type === 'ValidationFailed') {
      return jsonResponse(400, apiError('Invalid authentication state'));
    }

    if (result.error.type === 'InvalidResponse' || result.error.type === 'HttpError' || result.error.type === 'ParseError' || result.error.type === 'MissingEnvVar') {
      return jsonResponse(400, apiError(`Failed to exchange authorization code: ${oauthErrorToString(result.error)}`));
    }

    if (result.error.type === 'UserNotFound' || result.error.type === 'DatabaseError') {
      return jsonResponse(500, apiError(`Failed to authenticate user: ${oauthErrorToDebugString(result.error)}`));
    }
    return jsonResponse(500, apiError('Internal server error'));
  }

  const response = jsonResponse(200, apiData(`Successfully authenticated with ${result.value.providerName}`));
  setSessionCookieForOAuthCallback(response, result.value.sessionToken);
  response.cookies.set('microsoft_oauth_state', '', {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
  });

  return response;
}
