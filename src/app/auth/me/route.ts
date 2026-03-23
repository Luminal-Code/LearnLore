import type { NextRequest } from 'next/server';

import { apiData, getAuthenticatedUser, jsonResponse, userToClient } from '@/lib/auth/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const authContext = await getAuthenticatedUser(request);
  if (authContext.type === 'Err') {
    return authContext.response;
  }

  return jsonResponse(200, apiData(userToClient(authContext.user)));
}
