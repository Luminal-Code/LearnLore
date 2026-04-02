export type ApiResponse<T = string> = {
  data?: T;
  error?: string;
};

export type Platform = 'web' | 'mobile';

export type IdentifierType = 'email' | 'mobile' | 'google' | 'meta' | 'instagram' | 'discord' | 'microsoft';

export type Identifier = {
  identifier_type: IdentifierType;
  identifier_value: string;
};

export type RegistrationFormData = {
  name: string;
  identifier: Identifier;
  password: string;
  platform: Platform;
};

export type LoginFormData = {
  identifier: Identifier;
  password: string;
  platform: Platform;
};

export type UserOnClient = {
  id: string;
  display_name: string;
  role: string;
};

export type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

export type GoogleUser = {
  id: string;
  email: string;
  name?: string;
  picture?: string;
};

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
};

export type ProviderUser = {
  id: string;
  email: string;
  name?: string;
  picture?: string;
};
