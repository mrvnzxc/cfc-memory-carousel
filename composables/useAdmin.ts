export function useAdmin() {
  const password = useState<string>("admin-password", () => "");

  if (import.meta.client && !password.value) {
    password.value = sessionStorage.getItem("admin-password") || "";
  }

  function setPassword(value: string) {
    password.value = value;
    if (import.meta.client) {
      sessionStorage.setItem("admin-password", value);
    }
  }

  function clearPassword() {
    password.value = "";
    if (import.meta.client) {
      sessionStorage.removeItem("admin-password");
    }
  }

  return {
    password,
    setPassword,
    clearPassword
  };
}
