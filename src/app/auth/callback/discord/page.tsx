import { OAuthCallbackPage } from "@/components/auth/oauth-callback-page";

export default function DiscordCallbackPage() {
  return (
    <OAuthCallbackPage
      providerLabel="Discord"
      endpoint="/auth/discord-callback"
    />
  );
}
