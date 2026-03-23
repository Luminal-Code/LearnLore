import { apiData, apiError, jsonResponse } from '@/lib/auth/server';
import { generateState } from '@/lib/auth/oauth-state';
import { getGoogleAuthorizationUrl } from '@/lib/auth/oauth';

export const runtime = 'nodejs';

export async function POST() {
  const state = generateState();
  if (state.type === 'Err') {
    return jsonResponse(500, apiError('Failed to generate authentication state'));
  }

  const url = getGoogleAuthorizationUrl(state.value);
  if (url.type === 'Err') {
    return jsonResponse(500, apiError('Failed to create authorization URL'));
  }

  const response = jsonResponse(200, apiData(url.value));
  response.cookies.set('google_oauth_state', state.value, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 10 * 60,
  });

  return response;
}
