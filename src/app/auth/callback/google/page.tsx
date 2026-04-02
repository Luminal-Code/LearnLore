import { OAuthCallbackPage } from "@/components/auth/oauth-callback-page";

export default function GoogleCallbackPage() {
  return (
    <OAuthCallbackPage
      providerLabel="Google"
      endpoint="/auth/google-callback"
    />
  );
}
