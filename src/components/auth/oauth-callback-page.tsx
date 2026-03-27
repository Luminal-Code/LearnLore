"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { dmSerif, nunito } from "./fonts";

type OAuthCallbackPageProps = {
  providerLabel: string;
  endpoint: string;
  redirectTo?: string;
};

type ApiResponse<T = string> = {
  data?: T;
  error?: string;
};

export function OAuthCallbackPage({
  providerLabel,
  endpoint,
  redirectTo = "/",
}: OAuthCallbackPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const state = searchParams.get("state") ?? "";
  const missingCode = !code;
  const hasStarted = useRef(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasStarted.current || missingCode) {
      return;
    }

    hasStarted.current = true;

    async function run() {
      try {
        const query = new URLSearchParams({ code, state });
        const response = await fetch(`${endpoint}?${query.toString()}`, {
          method: "GET",
          credentials: "same-origin",
        });

        const contentType = response.headers.get("content-type") ?? "";
        let payload: ApiResponse<string> | null = null;

        if (contentType.includes("application/json")) {
          payload = (await response.json()) as ApiResponse<string>;
        } else {
          const text = await response.text();
          throw new Error(text || `Failed to authenticate with ${providerLabel}.`);
        }

        if (!response.ok || payload?.error) {
          setError(payload?.error ?? `Failed to authenticate with ${providerLabel}.`);
          setLoading(false);
          return;
        }

        setSuccess(true);
        setLoading(false);
        window.setTimeout(() => {
          router.replace(redirectTo);
        }, 400);
      } catch (callbackError) {
        if (callbackError instanceof Error) {
          setError(callbackError.message);
        } else {
          setError(`Failed to authenticate with ${providerLabel}.`);
        }
        setLoading(false);
      }
    }

    void run();
  }, [code, endpoint, missingCode, providerLabel, redirectTo, router, state]);

  return (
    <main
      className={`${nunito.className} flex min-h-svh items-center justify-center bg-[#f7f3ed] px-6 text-[#3d3929] dark:bg-[#171910] dark:text-[#ece6d9]`}
    >
      <div className="w-full max-w-lg rounded-[2rem] border border-stone-200/70 bg-[#fefcf8]/95 px-8 py-10 text-center shadow-[0_30px_80px_rgba(61,57,41,0.12)] backdrop-blur dark:border-[#2b3022] dark:bg-[#1f2117]/95 dark:shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        {missingCode ? (
          <div className="space-y-4">
            <h1 className={`${dmSerif.className} text-4xl text-rose-500 dark:text-rose-400`}>
              Authentication Failed
            </h1>
            <p className="text-stone-700 dark:text-stone-300">No authorization code found.</p>
            <Link
              href="/login"
              className="inline-flex rounded-2xl border-2 border-[#8db580] px-5 py-2 font-bold text-[#5b7a4a] transition-colors duration-300 hover:bg-[#8db580]/15 dark:text-[#b8d6a5] dark:hover:bg-[#8db580]/10"
            >
              Try again
            </Link>
          </div>
        ) : null}

        {!missingCode && loading ? (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#d7e7ca] border-t-[#6d9360] dark:border-[#31442a] dark:border-t-[#b8d6a5]" />
            <h1 className={`${dmSerif.className} text-4xl`}>Authenticating</h1>
            <p className="text-stone-600 dark:text-stone-400">
              Authenticating with {providerLabel}...
            </p>
          </div>
        ) : null}

        {!missingCode && !loading && error ? (
          <div className="space-y-4">
            <h1 className={`${dmSerif.className} text-4xl text-rose-500 dark:text-rose-400`}>
              Authentication Failed
            </h1>
            <p className="text-stone-700 dark:text-stone-300">{error}</p>
            <Link
              href="/login"
              className="inline-flex rounded-2xl border-2 border-[#8db580] px-5 py-2 font-bold text-[#5b7a4a] transition-colors duration-300 hover:bg-[#8db580]/15 dark:text-[#b8d6a5] dark:hover:bg-[#8db580]/10"
            >
              Try again
            </Link>
          </div>
        ) : null}

        {!missingCode && !loading && !error && success ? (
          <div className="space-y-4">
            <h1 className={`${dmSerif.className} text-4xl text-[#5b7a4a] dark:text-[#b8d6a5]`}>
              Success
            </h1>
            <p className="text-stone-700 dark:text-stone-300">
              Successfully authenticated with {providerLabel}. Redirecting...
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
