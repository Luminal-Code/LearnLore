"use client";

import Link from "next/link";
import { useState } from "react";

import { Brand } from "./brand";
import { getAuthContent } from "./content";
import { Field } from "./field";
import { dmSerif, nunito } from "./fonts";
import {
  buildLoginIdentifier,
  buildRegisterIdentifier,
  isValidEmail,
  isValidMobile,
  startOauth,
} from "./helpers";
import { SocialButtons } from "./social-buttons";
import type { ApiResponse, AuthPageProps } from "./types";

export function AuthPage({ mode }: AuthPageProps) {
  const isRegister = mode === "register";
  const content = getAuthContent(mode);
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setNameError("");
    setIdentifierError("");
    setPasswordError("");
    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedIdentifier = identifier.trim();

    if (isRegister && (trimmedName.length < 2 || trimmedName.length > 100)) {
      setNameError("The length must be between 2 and 100");
      return;
    }

    if (!isValidEmail(trimmedIdentifier) && !isValidMobile(trimmedIdentifier)) {
      setIdentifierError("A valid email or mobile number is required");
      return;
    }

    if (password.length < 8) {
      setPasswordError("The length must be at least 8");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        isRegister ? "/auth/register" : "/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isRegister
              ? {
                  name: trimmedName,
                  identifier: buildRegisterIdentifier(trimmedIdentifier),
                  password,
                  platform: "web",
                }
              : {
                  identifier: buildLoginIdentifier(trimmedIdentifier),
                  password,
                  platform: "web",
                },
          ),
        },
      );

      const payload = (await response.json()) as ApiResponse<string>;

      if (!response.ok) {
        setError(
          isRegister
            ? `Registration Error: ${payload.error ?? "Request failed"}`
            : `Error: ${payload.error ?? "Request failed"}`,
        );
        return;
      }

      setSuccess("Successful");
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(
          isRegister
            ? `Registration Error: ${submitError.message}`
            : `Error: ${submitError.message}`,
        );
        return;
      }

      setError(
        isRegister
          ? "Registration Error: Request failed"
          : "Error: Request failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className={`${nunito.className} min-h-svh overflow-y-auto bg-[#f7f3ed] text-[#3d3929] dark:bg-[#171910] dark:text-[#ece6d9]`}
    >
      <div className="flex min-h-svh pl-24 max-[863px]:items-center max-[863px]:justify-center max-[863px]:px-0 max-[863px]:py-6 [@media(min-width:863px)_and_(max-width:1060px)]:pl-8 max-sm:p-0 [@media(min-width:600px)_and_(max-width:640px)]:py-4">
        <section className="content-center grid gap-16 max-[863px]:hidden">
          <Brand />

          <div className="grid w-[45%] gap-16">
            <p
              className={`${dmSerif.className} text-4xl font-normal leading-tight text-[#3d3929] dark:text-[#ece6d9] [@media(min-width:767px)_and_(max-width:1060px)]:font-light`}
            >
              {content.hero}
            </p>

            <p className="text-stone-600 dark:text-stone-400">{content.copy}</p>
          </div>
        </section>

        <section className="fixed top-1/2 right-32 w-[30%] -translate-y-1/2 rounded-[2rem] border border-stone-200/70 bg-[#fefcf8]/95 px-10 py-8 text-[#3d3929] shadow-[0_30px_80px_rgba(61,57,41,0.12)] backdrop-blur max-xl:right-8 max-xl:w-[40%] max-[863px]:static max-[863px]:w-[65%] max-[863px]:translate-y-0 max-[768px]:w-[70%] max-sm:min-h-svh max-sm:w-full max-sm:rounded-none max-sm:px-6 max-sm:py-10 [@media(min-width:600px)_and_(max-width:767px)]:w-[70%] [@media(min-width:600px)_and_(max-width:640px)]:h-auto [@media(min-width:600px)_and_(max-width:640px)]:py-8 [@media(min-width:600px)_and_(max-width:640px)]:px-10 [@media(min-width:600px)_and_(max-width:640px)]:rounded-[2rem] [@media(min-width:767px)_and_(max-width:863px)]:w-[65%] [@media(min-width:863px)_and_(max-width:897px)]:right-4 [@media(min-width:863px)_and_(max-width:900px)]:w-[50%] [@media(min-width:900px)_and_(max-width:1000px)]:w-[45%] [@media(min-width:1145px)_and_(max-width:1286px)]:right-12 [@media(min-width:1145px)_and_(max-width:1286px)]:w-[35%] dark:border-[#2b3022] dark:bg-[#1f2117]/95 dark:text-[#ece6d9] dark:shadow-[0_30px_80px_rgba(0,0,0,0.35)] max-[600px]:grid max-sm:place-items-center">
          <div className="mb-4 hidden max-[863px]:block w-full">
            <Brand />
          </div>

          <form onSubmit={onSubmit} className="mb-2 grid gap-3 w-full">
            <div>
              <h1 className={`${dmSerif.className} text-3xl leading-none`}>
                {content.title}
              </h1>
              <h2 className="mt-1 text-stone-500 dark:text-stone-400">
                {content.subtitle}
              </h2>
            </div>

            {isRegister ? (
              <Field
                label="Full Name"
                name="name"
                placeholder="Armaan Ali"
                type="text"
                value={name}
                onChange={setName}
                error={nameError}
                hint="Enter your full name"
              />
            ) : null}

            <Field
              label="Email or Mobile"
              name="contact"
              placeholder="email@example.com or +91923XXXXX90"
              type="text"
              value={identifier}
              onChange={setIdentifier}
              error={identifierError}
              hint="Enter a valid email or mobile number"
            />

            <div>
              <Field
                label="Password"
                name="password"
                placeholder={
                  isRegister ? "Create a password" : "Enter your password"
                }
                type="password"
                value={password}
                onChange={setPassword}
                error={passwordError}
                hint="Password must contain 8 characters"
              />

              {!isRegister ? (
                <div>
                  <Link
                    href="/forgot-password"
                    className="font-bold text-[#5b7a4a] hover:text-[#4f6e40] dark:text-[#b8d6a5] dark:hover:text-[#cfe4c1]"
                  >
                    Forgot password?
                  </Link>
                </div>
              ) : null}
            </div>

            <button
              className="cursor-pointer rounded-2xl bg-[#8db580] py-2 font-bold text-white transition-colors duration-300 hover:bg-[#7ea56f] disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              {content.submitLabel}
            </button>
          </form>

          <div className="my-4 flex items-center gap-4 w-full">
            <div className="h-px flex-1 bg-gray-300 dark:bg-stone-700" />
            <span className="text-[0.8rem] text-stone-600 dark:text-stone-400">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-gray-300 dark:bg-stone-700" />
          </div>

          <SocialButtons
            onGoogle={() =>
              startOauth(
                "/auth/google-url",
                setError,
                "Failed to start Google login",
              )
            }
            onDiscord={() =>
              startOauth(
                "/auth/discord-url",
                setError,
                "Failed to start Discord login",
              )
            }
            onMicrosoft={() =>
              startOauth(
                "/auth/microsoft-url",
                setError,
                "Failed to start Microsoft login",
              )
            }
          />

          <p className="min-h-6 text-sm text-rose-500">{error}</p>
          <p className="-mt-4 min-h-6 text-sm text-[#5b7a4a] dark:text-[#b8d6a5]">
            {success}
          </p>

          <div
            className={`mt-6 w-full ${
              mode === "login"
                ? "max-[599px]:mt-0 max-[599px]:mb-11 [@media(min-width:600px)_and_(max-width:640px)]:mt-6"
                : "max-sm:mt-0 [@media(min-width:600px)_and_(max-width:640px)]:mt-6"
            }`}
          >
            <p className="mb-2 text-center text-[0.9rem] text-stone-600 dark:text-stone-400">
              {content.switchPrompt}
            </p>

            <Link
              href={content.switchHref}
              className="block w-full rounded-2xl border-2 border-[#8db580] py-2 text-center font-bold text-[#5b7a4a] transition-colors duration-300 hover:bg-[#8db580]/15 dark:border-[#8db580] dark:text-[#b8d6a5] dark:hover:bg-[#8db580]/10 "
            >
              {content.switchLabel}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
