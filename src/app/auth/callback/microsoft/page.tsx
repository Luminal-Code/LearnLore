import { OAuthCallbackPage } from "@/components/auth/oauth-callback-page";

export default function MicrosoftCallbackPage() {
  return (
    <OAuthCallbackPage
      providerLabel="Microsoft"
      endpoint="/auth/microsoft-callback"
    />
  );
}
