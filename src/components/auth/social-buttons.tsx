type SocialButtonsProps = {
  onGoogle: () => void;
  onDiscord: () => void;
  onMicrosoft: () => void;
};

export function SocialButtons({
  onGoogle,
  onDiscord,
  onMicrosoft,
}: SocialButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onGoogle}
        aria-label="Continue with Google"
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-2 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#FFC107"
            d="M43.61 20.08H42V20H24v8h11.3C33.65 32.66 29.2 36 24 36c-6.63 0-12-5.37-12-12S17.37 12 24 12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.05 6.05 29.27 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.65-.39-3.92Z"
          />
          <path
            fill="#FF3D00"
            d="M6.31 14.69l6.57 4.82C14.66 15.11 18.96 12 24 12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.05 6.05 29.27 4 24 4c-7.68 0-14.41 4.34-17.69 10.69Z"
          />
          <path
            fill="#4CAF50"
            d="M24 44c5.17 0 9.86-1.98 13.41-5.2l-6.19-5.24C29.15 35.09 26.69 36 24 36c-5.18 0-9.62-3.32-11.28-7.94l-6.52 5.02C9.44 39.56 16.17 44 24 44Z"
          />
          <path
            fill="#1976D2"
            d="M43.61 20.08H42V20H24v8h11.3c-.79 2.24-2.23 4.17-4.08 5.56l.01-.01 6.19 5.24C37 38.52 44 33 44 24c0-1.34-.14-2.65-.39-3.92Z"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={onDiscord}
        aria-label="Continue with Discord"
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#5865F2] bg-[#5865F2] px-2 py-2 font-semibold text-white transition-colors hover:bg-[#4752C4]"
      >
        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onMicrosoft}
        aria-label="Continue with Microsoft"
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#00A4EF] bg-[#00A4EF] px-2 py-2 font-semibold text-white transition-colors hover:bg-[#0088CC]"
      >
        <svg className="h-5 w-5 text-white" viewBox="0 0 23 23" aria-hidden="true">
          <path fill="white" d="M1 1h10v10H1z" />
          <path fill="white" d="M1 12h10v10H1z" />
          <path fill="white" d="M12 1h10v10H12z" />
          <path fill="white" d="M12 12h10v10H12z" />
        </svg>
      </button>
    </div>
  );
}
