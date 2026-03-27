import { apiData, apiError, jsonResponse } from '@/lib/auth/server';
import { createDiscordProvider, getProviderAuthorizationUrl, oauthErrorToString, stateErrorToString } from '@/lib/auth/oauth';

export const runtime = 'nodejs';

export async function POST() {
  const result = await getProviderAuthorizationUrl(createDiscordProvider());
  if (result.type === 'Err') {
    const error = 'name' in result.error || 'message' in result.error || 'cause' in result.error || result.error.type === 'InvalidResponse' || result.error.type === 'UserNotFound'
      ? oauthErrorToString(result.error)
      : stateErrorToString(result.error);

    if (result.error.type === 'GenerationError') {
      return jsonResponse(500, apiError('Failed to generate authentication state'));
    }

    return jsonResponse(500, apiError(`Failed to create authorization URL: ${error}`));
  }

  const response = jsonResponse(200, apiData(result.value.url));
  response.cookies.set('discord_oauth_state', result.value.state, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 10 * 60,
  });

  return response;
}

export const GET = POST;
