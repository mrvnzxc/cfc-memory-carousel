const ADMIN_SESSION_TTL_MS = 30 * 60 * 1000;

interface AdminSessionPayload {
  password: string;
  expiresAt: number;
}

export function useAdmin() {
  const password = useState<string>("admin-password", () => "");
  const expiresAt = useState<number>("admin-password-expiry", () => 0);

  if (import.meta.client && !password.value) {
    hydrateSession();
  }

  function setPassword(value: string) {
    const nextExpiry = Date.now() + ADMIN_SESSION_TTL_MS;
    password.value = value;
    expiresAt.value = nextExpiry;
    if (import.meta.client) {
      const payload: AdminSessionPayload = {
        password: value,
        expiresAt: nextExpiry
      };
      sessionStorage.setItem("admin-session", JSON.stringify(payload));
    }
  }

  function clearPassword() {
    password.value = "";
    expiresAt.value = 0;
    if (import.meta.client) {
      sessionStorage.removeItem("admin-session");
    }
  }

  function hydrateSession() {
    if (!import.meta.client) {
      return;
    }
    const raw = sessionStorage.getItem("admin-session");
    if (!raw) {
      clearPassword();
      return;
    }

    try {
      const parsed = JSON.parse(raw) as AdminSessionPayload;
      if (!parsed.password || !parsed.expiresAt || Date.now() > parsed.expiresAt) {
        clearPassword();
        return;
      }
      password.value = parsed.password;
      expiresAt.value = parsed.expiresAt;
    } catch {
      clearPassword();
    }
  }

  function isSessionValid() {
    if (!password.value || !expiresAt.value) {
      return false;
    }
    if (Date.now() > expiresAt.value) {
      clearPassword();
      return false;
    }
    return true;
  }

  return {
    password,
    expiresAt,
    setPassword,
    clearPassword,
    isSessionValid
  };
}
