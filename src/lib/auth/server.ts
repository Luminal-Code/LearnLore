import { NextResponse, type NextRequest } from 'next/server';

import { getUserBySession, getSessionTokenFromRequest } from '@/lib/auth/session';
import type { ApiResponse, UserOnClient } from '@/lib/auth/types';

export function apiData<T>(data: T): ApiResponse<T> {
  return { data };
}

export function apiError<T>(error: string): ApiResponse<T> {
  return { error };
}

export function jsonResponse<T>(status: number, body: ApiResponse<T>): NextResponse<ApiResponse<T>> {
  return NextResponse.json(body, { status });
}

export function userToClient(user: {
  id: string;
  displayName: string;
  role: string;
}): UserOnClient {
  return {
    id: user.id,
    display_name: user.displayName,
    role: user.role,
  };
}

export async function getAuthenticatedUser(
  request: NextRequest,
): Promise<
  | { type: 'Ok'; user: { id: string; displayName: string; role: string } }
  | { type: 'Err'; response: NextResponse }
> {
  const sessionTokenResult = getSessionTokenFromRequest(request);
  if (sessionTokenResult.type === 'Err') {
    return {
      type: 'Err',
      response: jsonResponse(sessionTokenResult.error.status, apiError(sessionTokenResult.error.error)),
    };
  }

  const userResult = await getUserBySession(sessionTokenResult.value);
  if (userResult.type === 'Err') {
    return {
      type: 'Err',
      response: jsonResponse(401, apiError('Invalid or expired session')),
    };
  }

  return {
    type: 'Ok',
    user: userResult.value,
  };
}
