import { randomBytes } from 'node:crypto';

import { Err, Ok, type Result } from '@/lib/result';
import type { StateError } from '@/lib/auth/errors';

export function generateState(): Result<string, StateError> {
  const encoded = randomBytes(32).toString('base64url');

  if (!encoded) {
    return Err({ type: 'GenerationError' });
  }

  return Ok(encoded);
}

export function validateState(state: string, storedState: string): boolean {
  return Boolean(state) && Boolean(storedState) && state === storedState;
}
