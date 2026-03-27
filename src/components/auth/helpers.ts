import type { ApiResponse } from "./types";

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidMobile(value: string) {
  return /^[+]?[(]?[0-9]{1,4}[)]?[- .]?[(]?[0-9]{1,4}[)]?[- .]?[0-9]{4,10}$/.test(
    value,
  );
}

export function buildRegisterIdentifier(value: string) {
  if (value.includes("@")) {
    return {
      identifier_type: "email",
      identifier_value: value,
    } as const;
  }

  return {
    identifier_type: "mobile",
    identifier_value: value,
  } as const;
}

export function buildLoginIdentifier(value: string) {
  const isMobile = [...value].every((character) =>
    /\d/.test(character) || ["+", " ", "-", ".", "(", ")"].includes(character),
  );

  if (isMobile) {
    return {
      identifier_type: "mobile",
      identifier_value: value,
    } as const;
  }

  return {
    identifier_type: "email",
    identifier_value: value,
  } as const;
}

export async function startOauth(
  endpoint: string,
  setError: (value: string) => void,
  failureMessage: string,
) {
  setError("");

  try {
    const response = await fetch(endpoint);
    const contentType = response.headers.get("content-type") ?? "";
    let payload: ApiResponse<string> | null = null;

    if (contentType.includes("application/json")) {
      payload = (await response.json()) as ApiResponse<string>;
    } else {
      const text = await response.text();
      throw new Error(text || failureMessage);
    }

    if (!response.ok || !payload?.data) {
      throw new Error(payload.error ?? failureMessage);
    }

    window.location.href = payload.data;
  } catch (error) {
    if (error instanceof Error) {
      setError(`${failureMessage}: ${error.message}`);
      return;
    }

    setError(failureMessage);
  }
}
