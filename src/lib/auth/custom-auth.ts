import argon2 from 'argon2';

import { db } from '@/lib/db';
import { Err, Ok, type Result } from '@/lib/result';
import type { AuthError } from '@/lib/auth/errors';
import type { Identifier, LoginFormData, RegistrationFormData } from '@/lib/auth/types';

const MOBILE_PATTERN = /^[+]?[(]?[0-9]{1,4}[)]?[- .]?[(]?[0-9]{1,4}[)]?[- .]?[0-9]{4,10}$/;

function validateIdentifier(identifier: Identifier): string[] {
  switch (identifier.identifier_type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.identifier_value)
        ? []
        : ['identifier, not a valid email'];
    case 'mobile':
      return MOBILE_PATTERN.test(identifier.identifier_value)
        ? []
        : ['identifier, does not match the required pattern'];
    case 'google':
    case 'meta':
    case 'instagram':
    case 'discord':
    case 'microsoft':
      return [];
    default:
      return ['identifier, invalid identifier'];
  }
}

function validateRegistrationForm(form: RegistrationFormData): string[] {
  const errors: string[] = [];

  if (form.name.length < 2 || form.name.length > 100) {
    errors.push('name, length must be between 2 and 100');
  }

  errors.push(...validateIdentifier(form.identifier));

  if (form.password.length < 8) {
    errors.push('password, length must be at least 8');
  }

  return errors;
}

function validateLoginForm(form: LoginFormData): string[] {
  const errors = validateIdentifier(form.identifier);

  if (form.password.length < 8) {
    errors.push('password, length must be at least 8');
  }

  return errors;
}

export async function validateRegistrationUniqueness(
  form: RegistrationFormData,
): Promise<Result<void, AuthError>> {
  const { identifier_type, identifier_value } = form.identifier;

  if (
    identifier_type === 'google' ||
    identifier_type === 'meta' ||
    identifier_type === 'instagram' ||
    identifier_type === 'discord' ||
    identifier_type === 'microsoft'
  ) {
    return Err({ type: 'NotUniqueError', identifierType: 'OAuth identifiers cannot be manually registered' });
  }

  try {
    const existing = await db.userIdentifier.findUnique({
      where: {
        identifierType_identifierValue: {
          identifierType: identifier_type,
          identifierValue: identifier_value,
        },
      },
    });

    if (existing) {
      return Err({ type: 'NotUniqueError', identifierType: identifier_type });
    }

    return Ok(undefined);
  } catch (cause) {
    return Err({ type: 'DatabaseError', cause });
  }
}

export async function registerUser(form: RegistrationFormData): Promise<Result<string, AuthError>> {
  const validationErrors = validateRegistrationForm(form);
  if (validationErrors.length > 0) {
    return Err({ type: 'InvalidData', errors: validationErrors });
  }

  const uniquenessResult = await validateRegistrationUniqueness(form);
  if (uniquenessResult.type === 'Err') {
    return uniquenessResult;
  }

  try {
    const passwordHash = await argon2.hash(form.password);

    const createdUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          displayName: form.name,
          passwordHash,
        },
      });

      await tx.userIdentifier.create({
        data: {
          userId: user.id,
          identifierType: form.identifier.identifier_type,
          identifierValue: form.identifier.identifier_value,
        },
      });

      return user;
    });

    return Ok(createdUser.id);
  } catch (cause) {
    if (cause instanceof Error && cause.name.toLowerCase().includes('argon')) {
      return Err({ type: 'PasswordHashError', cause });
    }

    return Err({ type: 'DatabaseError', cause });
  }
}

export async function authenticate(form: LoginFormData): Promise<Result<string, AuthError>> {
  const validationErrors = validateLoginForm(form);
  if (validationErrors.length > 0) {
    return Err({ type: 'InvalidData', errors: validationErrors });
  }

  const { identifier_type, identifier_value } = form.identifier;

  if (
    identifier_type === 'google' ||
    identifier_type === 'meta' ||
    identifier_type === 'instagram'
  ) {
    return Err({ type: 'UserNotFound' });
  }

  try {
    const userIdentifierWithUser = await db.userIdentifier.findFirst({
      where: {
        identifierValue: identifier_value,
      },
      include: {
        user: true,
      },
    });

    if (!userIdentifierWithUser) {
      return Err({ type: 'UserNotFound' });
    }

    const verified = await argon2.verify(userIdentifierWithUser.user.passwordHash, form.password);

    if (!verified) {
      return Err({ type: 'PasswordVerificationError', cause: new Error('Password verification failed') });
    }

    return Ok(userIdentifierWithUser.user.id);
  } catch (cause) {
    if (cause instanceof Error && cause.name.toLowerCase().includes('argon')) {
      return Err({ type: 'PasswordHashError', cause });
    }

    return Err({ type: 'DatabaseError', cause });
  }
}
