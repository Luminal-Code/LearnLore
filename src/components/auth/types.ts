export type AuthMode = "register" | "login";

export type AuthPageProps = {
  mode: AuthMode;
};

export type ApiResponse<T = string> = {
  data?: T;
  error?: string;
};
