import type { NextRequest } from 'next/server';

import { deleteSession, getSessionTokenFromRequest, removeSessionCookie } from '@/lib/auth/session';
import { apiData, apiError, jsonResponse } from '@/lib/auth/server';

export const runtime = 'nodejs';

export async function DELETE(request: NextRequest) {
  const sessionToken = getSessionTokenFromRequest(request);
  if (sessionToken.type === 'Err') {
    return jsonResponse(sessionToken.error.status, apiError(sessionToken.error.error));
  }

  const deletionResult = await deleteSession(sessionToken.value);
  if (deletionResult.type === 'Err') {
    switch (deletionResult.error.type) {
      case 'SessionExpired':
        return jsonResponse(401, apiError('Your session has expired'));
      case 'SessionNotFound':
        return jsonResponse(401, apiError('Session not found'));
      case 'InvalidToken':
        return jsonResponse(401, apiError('Invalid session token'));
      case 'UserNotFound':
        return jsonResponse(401, apiError('User not found for this session'));
      case 'DatabaseError':
        return jsonResponse(500, apiError(`Database error occurred: ${String(deletionResult.error.cause)}`));
    }
  }

  const response = jsonResponse(200, apiData('Successfully logged out the user'));

  if (request.cookies.get('__Host-session')) {
    removeSessionCookie(response);
  }

  return response;
}
