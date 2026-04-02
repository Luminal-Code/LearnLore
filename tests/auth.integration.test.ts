import argon2 from 'argon2';
import { randomUUID } from 'node:crypto';

import { NextRequest } from 'next/server';

import { POST as registerPost } from '@/app/auth/register/route';
import { POST as loginPost } from '@/app/auth/login/route';
import { DELETE as logoutDelete } from '@/app/auth/logout/route';
import { GET as meGet } from '@/app/auth/me/route';
import { createSession } from '@/lib/auth/session';
import type { ApiResponse, UserOnClient } from '@/lib/auth/types';
import { db } from '@/lib/db';

const TEST_PREFIX = 'jest-auth';
const describeIntegration =
  process.env.RUN_AUTH_INTEGRATION_TESTS === '1' ? describe : describe.skip;

jest.setTimeout(30000);

function uniqueEmail(label: string): string {
  return `${TEST_PREFIX}-${label}-${randomUUID()}@example.com`;
}

function makeJsonRequest(url: string, method: string, body?: unknown, headers?: HeadersInit): NextRequest {
  return new NextRequest(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function createUserWithEmail(
  displayName: string,
  email: string,
  password = 'password123',
  role = 'user',
): Promise<{ id: string }> {
  const passwordHash = await argon2.hash(password);

  const user = await db.user.create({
    data: {
      displayName,
      passwordHash,
      role,
      identifiers: {
        create: {
          identifierType: 'email',
          identifierValue: email,
        },
      },
    },
    select: {
      id: true,
    },
  });

  return user;
}

async function cleanupTestUsers() {
  const identifiers = await db.userIdentifier.findMany({
    where: {
      identifierValue: {
        startsWith: TEST_PREFIX,
      },
    },
    select: {
      userId: true,
    },
  });

  const userIds = [...new Set(identifiers.map((identifier) => identifier.userId))];

  if (userIds.length === 0) {
    return;
  }

  await db.session.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  await db.userIdentifier.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  await db.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });
}

describeIntegration('Authentication integration', () => {
  beforeEach(async () => {
    await cleanupTestUsers();
  });

  afterEach(async () => {
    await cleanupTestUsers();
  });

  afterAll(async () => {
    await cleanupTestUsers();
    await db.$disconnect();
  });

  it('registers a web user, persists the identifier, and creates a session', async () => {
    const email = uniqueEmail('register-web');

    const request = makeJsonRequest('http://localhost:3133/auth/register', 'POST', {
      name: 'Armaan Ali',
      identifier: {
        identifier_type: 'email',
        identifier_value: email,
      },
      password: 'thisisasecret',
      platform: 'web',
    });

    const response = await registerPost(request);
    const json = await readJson<ApiResponse<string>>(response);

    expect(response.status).toBe(200);
    expect(json.data).toBe('The user has been registered successfully');
    expect(json.error).toBeUndefined();

    const createdIdentifier = await db.userIdentifier.findUnique({
      where: {
        identifierType_identifierValue: {
          identifierType: 'email',
          identifierValue: email,
        },
      },
      include: {
        user: true,
      },
    });

    expect(createdIdentifier).not.toBeNull();
    expect(createdIdentifier?.user.displayName).toBe('Armaan Ali');

    const sessions = await db.session.findMany({
      where: {
        userId: createdIdentifier!.userId,
      },
    });

    expect(sessions).toHaveLength(1);
    expect(response.headers.get('set-cookie')).toContain('__Host-session=');
  });

  it('logs out a web user and deletes the persisted session', async () => {
    const user = await createUserWithEmail('Logout User', uniqueEmail('logout-web'));
    const sessionResult = await createSession(user.id);

    if (sessionResult.type === 'Err') {
      throw new Error(`Failed to create logout test session: ${JSON.stringify(sessionResult.error)}`);
    }

    const request = makeJsonRequest(
      'http://localhost:3133/auth/logout',
      'DELETE',
      {},
      {
        cookie: `__Host-session=${sessionResult.value}`,
      },
    );

    const response = await logoutDelete(request);
    const json = await readJson<ApiResponse<string>>(response);

    expect(response.status).toBe(200);
    expect(json.data).toBe('Successfully logged out the user');
    expect(json.error).toBeUndefined();

    const session = await db.session.findUnique({
      where: {
        sessionToken: sessionResult.value,
      },
    });

    expect(session).toBeNull();
  });

  it('logs in a web user and creates a new session row', async () => {
    const email = uniqueEmail('login-web');
    const user = await createUserWithEmail('Login Test User', email, 'password123');

    const request = makeJsonRequest('http://localhost:3133/auth/login', 'POST', {
      identifier: {
        identifier_type: 'email',
        identifier_value: email,
      },
      password: 'password123',
      platform: 'web',
    });

    const response = await loginPost(request);
    const json = await readJson<ApiResponse<string>>(response);

    expect(response.status).toBe(200);
    expect(json.data).toBe('The user has been logged in successfully');
    expect(json.error).toBeUndefined();

    const sessions = await db.session.findMany({
      where: {
        userId: user.id,
      },
    });

    expect(sessions).toHaveLength(1);
    expect(response.headers.get('set-cookie')).toContain('__Host-session=');
  });

  it('runs the mobile auth flow with bearer logout and token-based login', async () => {
    const email = uniqueEmail('mobile');

    const registerRequest = makeJsonRequest('http://localhost:3133/auth/register', 'POST', {
      name: 'Mobile User',
      identifier: {
        identifier_type: 'email',
        identifier_value: email,
      },
      password: 'password123',
      platform: 'mobile',
    });

    const registerResponse = await registerPost(registerRequest);
    const registerJson = await readJson<ApiResponse<string>>(registerResponse);

    expect(registerResponse.status).toBe(200);
    expect(registerResponse.headers.get('set-cookie')).toBeNull();
    expect(registerJson.data).toBeTruthy();

    const logoutRequest = makeJsonRequest(
      'http://localhost:3133/auth/logout',
      'DELETE',
      {},
      {
        authorization: `Bearer ${registerJson.data}`,
      },
    );

    const logoutResponse = await logoutDelete(logoutRequest);
    expect(logoutResponse.status).toBe(200);

    const loginRequest = makeJsonRequest('http://localhost:3133/auth/login', 'POST', {
      identifier: {
        identifier_type: 'email',
        identifier_value: email,
      },
      password: 'password123',
      platform: 'mobile',
    });

    const loginResponse = await loginPost(loginRequest);
    const loginJson = await readJson<ApiResponse<string>>(loginResponse);

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers.get('set-cookie')).toBeNull();
    expect(loginJson.data).toBeTruthy();
    expect(loginJson.data).not.toBe(registerJson.data);

    const newSession = await db.session.findUnique({
      where: {
        sessionToken: loginJson.data!,
      },
    });

    expect(newSession).not.toBeNull();
  });

  it('returns the authenticated user from /auth/me', async () => {
    const user = await createUserWithEmail('Me User', uniqueEmail('me'));
    const sessionResult = await createSession(user.id);

    if (sessionResult.type === 'Err') {
      throw new Error(`Failed to create me test session: ${JSON.stringify(sessionResult.error)}`);
    }

    const request = new NextRequest('http://localhost:3133/auth/me', {
      headers: {
        cookie: `__Host-session=${sessionResult.value}`,
      },
    });

    const response = await meGet(request);
    const json = await readJson<ApiResponse<UserOnClient>>(response);

    expect(response.status).toBe(200);
    expect(json.data).toEqual({
      id: user.id,
      display_name: 'Me User',
      role: 'user',
    });
    expect(json.error).toBeUndefined();
  });

  it('can logout with either cookie auth or bearer auth', async () => {
    const webUser = await createUserWithEmail('Cookie Logout User', uniqueEmail('logout-cookie'));
    const webSession = await createSession(webUser.id);
    const mobileUser = await createUserWithEmail('Bearer Logout User', uniqueEmail('logout-bearer'));
    const mobileSession = await createSession(mobileUser.id);

    if (webSession.type === 'Err' || mobileSession.type === 'Err') {
      throw new Error('Failed to create logout sessions');
    }

    const cookieRequest = makeJsonRequest(
      'http://localhost:3133/auth/logout',
      'DELETE',
      {},
      {
        cookie: `__Host-session=${webSession.value}`,
      },
    );

    const cookieResponse = await logoutDelete(cookieRequest);
    expect(cookieResponse.status).toBe(200);
    expect(cookieResponse.headers.get('set-cookie')).toContain('__Host-session=');

    const bearerRequest = makeJsonRequest(
      'http://localhost:3133/auth/logout',
      'DELETE',
      {},
      {
        authorization: `Bearer ${mobileSession.value}`,
      },
    );

    const bearerResponse = await logoutDelete(bearerRequest);
    expect(bearerResponse.status).toBe(200);
    expect(bearerResponse.headers.get('set-cookie')).toBeNull();
  });
});
