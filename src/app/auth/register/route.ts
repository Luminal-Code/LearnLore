import type { NextRequest } from 'next/server';

import { registerUser, validateRegistrationUniqueness } from '@/lib/auth/custom-auth';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { apiError, apiData, jsonResponse } from '@/lib/auth/server';
import type { RegistrationFormData } from '@/lib/auth/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const form = (await request.json()) as RegistrationFormData;

  const uniquenessResult = await validateRegistrationUniqueness(form);
  if (uniquenessResult.type === 'Err') {
    if (uniquenessResult.error.type === 'NotUniqueError') {
      if (uniquenessResult.error.identifierType === 'OAuth identifiers cannot be manually registered') {
        return jsonResponse(409, apiError(uniquenessResult.error.identifierType));
      }

      return jsonResponse(409, apiError(`${uniquenessResult.error.identifierType} already registered`));
    }
  }

  const registrationResult = await registerUser(form);

  if (registrationResult.type === 'Err') {
    if (registrationResult.error.type === 'InvalidData') {
      return jsonResponse(422, apiError(registrationResult.error.errors.join('\n')));
    }

    if (registrationResult.error.type === 'NotUniqueError') {
      if (registrationResult.error.identifierType === 'OAuth identifiers cannot be manually registered') {
        return jsonResponse(409, apiError(registrationResult.error.identifierType));
      }

      return jsonResponse(409, apiError(`${registrationResult.error.identifierType} already registered`));
    }

    return jsonResponse(500, apiError('Failed to register the user'));
  }

  const sessionCreationResult = await createSession(registrationResult.value);
  if (sessionCreationResult.type === 'Err') {
    return jsonResponse(500, apiError('Failed to generate session tokens for the registered user'));
  }

  if (form.platform === 'web') {
    const response = jsonResponse(200, apiData('The user has been registered successfully'));
    setSessionCookie(response, sessionCreationResult.value);
    return response;
  }

  return jsonResponse(200, apiData(sessionCreationResult.value));
}
