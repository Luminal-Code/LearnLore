import type { NextRequest } from 'next/server';

import { authenticate } from '@/lib/auth/custom-auth';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { apiError, apiData, jsonResponse } from '@/lib/auth/server';
import type { LoginFormData } from '@/lib/auth/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const form = (await request.json()) as LoginFormData;

  const userId = await authenticate(form);
  if (userId.type === 'Err') {
    switch (userId.error.type) {
      case 'UserNotFound':
      case 'PasswordVerificationError':
        return jsonResponse(401, apiError('Invalid username or password.'));
      case 'DatabaseError':
      case 'PasswordHashError':
        return jsonResponse(500, apiError('An internal error occurred.'));
      default:
        return jsonResponse(500, apiError('An internal error occurred.'));
    }
  }

  const sessionCreationResult = await createSession(userId.value);
  if (sessionCreationResult.type === 'Err') {
    return jsonResponse(500, apiError('Failed to create user session.'));
  }

  if (form.platform === 'web') {
    const response = jsonResponse(200, apiData('The user has been logged in successfully'));
    setSessionCookie(response, sessionCreationResult.value);
    return response;
  }

  return jsonResponse(200, apiData(sessionCreationResult.value));
}
