import { NextRequest } from 'next/server';

import { Ok } from '@/lib/result';

jest.mock('@/lib/auth/server', () => {
  const actual = jest.requireActual('@/lib/auth/server');

  return {
    ...actual,
    getAuthenticatedUser: jest.fn(),
  };
});

jest.mock('@/lib/auth/custom-auth', () => ({
  authenticate: jest.fn(),
  registerUser: jest.fn(),
  validateRegistrationUniqueness: jest.fn(),
}));

jest.mock('@/lib/auth/session', () => {
  const actual = jest.requireActual('@/lib/auth/session');

  return {
    ...actual,
    createSession: jest.fn(),
    deleteSession: jest.fn(),
    getSessionTokenFromRequest: jest.fn(),
  };
});

import { POST as registerPost } from '@/app/auth/register/route';
import { POST as loginPost } from '@/app/auth/login/route';
import { DELETE as logoutDelete } from '@/app/auth/logout/route';
import { GET as meGet } from '@/app/auth/me/route';
import { authenticate, registerUser, validateRegistrationUniqueness } from '@/lib/auth/custom-auth';
import { getAuthenticatedUser } from '@/lib/auth/server';
import { createSession, deleteSession, getSessionTokenFromRequest } from '@/lib/auth/session';

const mockedGetAuthenticatedUser = getAuthenticatedUser as jest.MockedFunction<typeof getAuthenticatedUser>;
const mockedValidateRegistrationUniqueness =
  validateRegistrationUniqueness as jest.MockedFunction<typeof validateRegistrationUniqueness>;
const mockedRegisterUser = registerUser as jest.MockedFunction<typeof registerUser>;
const mockedAuthenticate = authenticate as jest.MockedFunction<typeof authenticate>;
const mockedCreateSession = createSession as jest.MockedFunction<typeof createSession>;
const mockedDeleteSession = deleteSession as jest.MockedFunction<typeof deleteSession>;
const mockedGetSessionTokenFromRequest =
  getSessionTokenFromRequest as jest.MockedFunction<typeof getSessionTokenFromRequest>;

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

describe('Authentication routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('register', () => {
    it('successfully registers a web user and sets a session cookie', async () => {
      mockedValidateRegistrationUniqueness.mockResolvedValue(Ok(undefined));
      mockedRegisterUser.mockResolvedValue(Ok('user-1'));
      mockedCreateSession.mockResolvedValue(Ok('abcdefghijklmnopqrstuvwxyz1234567890ABCD'));

      const request = makeJsonRequest('http://localhost:3133/auth/register', 'POST', {
        name: 'Armaan Ali',
        identifier: {
          identifier_type: 'email',
          identifier_value: 'armaanali@gmail.com',
        },
        password: 'thisisasecret',
        platform: 'web',
      });

      const response = await registerPost(request);
      const json = await readJson<{ data?: string; error?: string }>(response);

      expect(response.status).toBe(200);
      expect(json).toEqual({
        data: 'The user has been registered successfully',
      });
      expect(response.headers.get('set-cookie')).toContain('__Host-session=');
      expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    });

    it('successfully registers a mobile user and returns a session token without cookies', async () => {
      mockedValidateRegistrationUniqueness.mockResolvedValue(Ok(undefined));
      mockedRegisterUser.mockResolvedValue(Ok('user-1'));
      mockedCreateSession.mockResolvedValue(Ok('abcdefghijklmnopqrstuvwxyz1234567890ABCD'));

      const request = makeJsonRequest('http://localhost:3133/auth/register', 'POST', {
        name: 'Armaan Ali',
        identifier: {
          identifier_type: 'mobile',
          identifier_value: '+91 1234567890',
        },
        password: 'thisisasecret',
        platform: 'mobile',
      });

      const response = await registerPost(request);
      const json = await readJson<{ data?: string; error?: string }>(response);

      expect(response.status).toBe(200);
      expect(json).toEqual({
        data: 'abcdefghijklmnopqrstuvwxyz1234567890ABCD',
      });
      expect(response.headers.get('set-cookie')).toBeNull();
    });
  });

  describe('logout', () => {
    it('successfully logs out a user authenticated by cookie', async () => {
      mockedGetSessionTokenFromRequest.mockReturnValue(Ok('abcdefghijklmnopqrstuvwxyz1234567890ABCD'));
      mockedDeleteSession.mockResolvedValue(Ok(undefined));

      const request = makeJsonRequest(
        'http://localhost:3133/auth/logout',
        'DELETE',
        {},
        { cookie: '__Host-session=abcdefghijklmnopqrstuvwxyz1234567890ABCD' },
      );

      const response = await logoutDelete(request);
      const json = await readJson<{ data?: string; error?: string }>(response);

      expect(response.status).toBe(200);
      expect(json).toEqual({
        data: 'Successfully logged out the user',
      });
      expect(response.headers.get('set-cookie')).toContain('__Host-session=');
      expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
    });

    it('successfully logs out a user authenticated by bearer token', async () => {
      mockedGetSessionTokenFromRequest.mockReturnValue(Ok('abcdefghijklmnopqrstuvwxyz1234567890ABCD'));
      mockedDeleteSession.mockResolvedValue(Ok(undefined));

      const request = makeJsonRequest(
        'http://localhost:3133/auth/logout',
        'DELETE',
        {},
        { authorization: 'Bearer abcdefghijklmnopqrstuvwxyz1234567890ABCD' },
      );

      const response = await logoutDelete(request);
      const json = await readJson<{ data?: string; error?: string }>(response);

      expect(response.status).toBe(200);
      expect(json).toEqual({
        data: 'Successfully logged out the user',
      });
      expect(response.headers.get('set-cookie')).toBeNull();
    });
  });

  describe('login', () => {
    it('successfully logs in a web user and sets a session cookie', async () => {
      mockedAuthenticate.mockResolvedValue(Ok('user-1'));
      mockedCreateSession.mockResolvedValue(Ok('abcdefghijklmnopqrstuvwxyz1234567890ABCD'));

      const request = makeJsonRequest('http://localhost:3133/auth/login', 'POST', {
        identifier: {
          identifier_type: 'email',
          identifier_value: 'login_test@example.com',
        },
        password: 'password123',
        platform: 'web',
      });

      const response = await loginPost(request);
      const json = await readJson<{ data?: string; error?: string }>(response);

      expect(response.status).toBe(200);
      expect(json).toEqual({
        data: 'The user has been logged in successfully',
      });
      expect(response.headers.get('set-cookie')).toContain('__Host-session=');
    });

    it('supports the mobile auth flow by returning a new session token without cookies', async () => {
      mockedValidateRegistrationUniqueness.mockResolvedValue(Ok(undefined));
      mockedRegisterUser.mockResolvedValue(Ok('user-1'));
      mockedCreateSession
        .mockResolvedValueOnce(Ok('abcdefghijklmnopqrstuvwxyz1234567890ABCD'))
        .mockResolvedValueOnce(Ok('zyxwvutsrqponmlkjihgfedcba1234567890ABCD'));
      mockedGetSessionTokenFromRequest.mockReturnValue(Ok('abcdefghijklmnopqrstuvwxyz1234567890ABCD'));
      mockedDeleteSession.mockResolvedValue(Ok(undefined));
      mockedAuthenticate.mockResolvedValue(Ok('user-1'));

      const registerRequest = makeJsonRequest('http://localhost:3133/auth/register', 'POST', {
        name: 'Mobile User',
        identifier: {
          identifier_type: 'email',
          identifier_value: 'mobile@example.com',
        },
        password: 'password123',
        platform: 'mobile',
      });

      const registerResponse = await registerPost(registerRequest);
      const registerJson = await readJson<{ data?: string }>(registerResponse);

      expect(registerResponse.status).toBe(200);
      expect(registerResponse.headers.get('set-cookie')).toBeNull();
      expect(registerJson.data).toBe('abcdefghijklmnopqrstuvwxyz1234567890ABCD');

      const logoutRequest = makeJsonRequest(
        'http://localhost:3133/auth/logout',
        'DELETE',
        {},
        { authorization: 'Bearer abcdefghijklmnopqrstuvwxyz1234567890ABCD' },
      );

      const logoutResponse = await logoutDelete(logoutRequest);
      expect(logoutResponse.status).toBe(200);

      const loginRequest = makeJsonRequest('http://localhost:3133/auth/login', 'POST', {
        identifier: {
          identifier_type: 'email',
          identifier_value: 'mobile@example.com',
        },
        password: 'password123',
        platform: 'mobile',
      });

      const loginResponse = await loginPost(loginRequest);
      const loginJson = await readJson<{ data?: string }>(loginResponse);

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.headers.get('set-cookie')).toBeNull();
      expect(loginJson.data).toBe('zyxwvutsrqponmlkjihgfedcba1234567890ABCD');
      expect(loginJson.data).not.toBe(registerJson.data);
    });
  });

  describe('me', () => {
    it('returns the authenticated user in the client shape', async () => {
      mockedGetAuthenticatedUser.mockResolvedValue({
        type: 'Ok',
        user: {
          id: 'user-42',
          displayName: 'Display Name',
          role: 'user',
        },
      });

      const request = new NextRequest('http://localhost:3133/auth/me');
      const response = await meGet(request);
      const json = await readJson<{
        data?: { id: string; display_name: string; role: string };
        error?: string;
      }>(response);

      expect(response.status).toBe(200);
      expect(json).toEqual({
        data: {
          id: 'user-42',
          display_name: 'Display Name',
          role: 'user',
        },
      });
    });
  });

  describe('public auth endpoints', () => {
    it('allows register without an existing authenticated session', async () => {
      mockedValidateRegistrationUniqueness.mockResolvedValue(Ok(undefined));
      mockedRegisterUser.mockResolvedValue(Ok('user-1'));
      mockedCreateSession.mockResolvedValue(Ok('abcdefghijklmnopqrstuvwxyz1234567890ABCD'));

      const request = makeJsonRequest('http://localhost:3133/auth/register', 'POST', {
        name: 'Public User',
        identifier: {
          identifier_type: 'email',
          identifier_value: 'public-register@example.com',
        },
        password: 'password123',
        platform: 'web',
      });

      const response = await registerPost(request);
      const json = await readJson<{ data?: string; error?: string }>(response);

      expect(response.status).toBe(200);
      expect(json).toEqual({
        data: 'The user has been registered successfully',
      });
    });

    it('allows login without an existing authenticated session', async () => {
      mockedAuthenticate.mockResolvedValue(Ok('user-1'));
      mockedCreateSession.mockResolvedValue(Ok('abcdefghijklmnopqrstuvwxyz1234567890ABCD'));

      const request = makeJsonRequest('http://localhost:3133/auth/login', 'POST', {
        identifier: {
          identifier_type: 'email',
          identifier_value: 'public-login@example.com',
        },
        password: 'password123',
        platform: 'web',
      });

      const response = await loginPost(request);
      const json = await readJson<{ data?: string; error?: string }>(response);

      expect(response.status).toBe(200);
      expect(json).toEqual({
        data: 'The user has been logged in successfully',
      });
    });
  });
});
