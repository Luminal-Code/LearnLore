import type { AuthMode } from "./types";

export function getAuthContent(mode: AuthMode) {
  if (mode === "register") {
    return {
      hero:
        "Join LearnLore to turn heavy notes into short, memorable story beats you can actually retain.",
      copy:
        "Create your account to upload notes, extract core concepts, and study through narrative hooks instead of rereading the same pages.",
      title: "Register",
      subtitle: "Sign up to start turning notes into stories",
      switchPrompt: "Already have an account?",
      switchHref: "/login",
      switchLabel: "Login",
      submitLabel: "Create Account",
    };
  }

  return {
    hero:
      "Welcome back to your study space where concepts, stories, and memory hooks stay organized in one place.",
    copy:
      "Pick up where you left off, review generated stories, and keep building recall from your documents without losing your study flow.",
    title: "Login",
    subtitle: "Welcome back. Please enter your details.",
    switchPrompt: "Don't have an account?",
    switchHref: "/register",
    switchLabel: "Create Account",
    submitLabel: "Login",
  };
}
