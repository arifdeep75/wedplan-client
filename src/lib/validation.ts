const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) return "Full name is required";
  if (trimmed.length < 2) return "Name must be at least 2 characters";

  return null;
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) return "Email is required";
  if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email address";

  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Password is required";
  if (value.length < 6) return "Password must be at least 6 characters";
  if (!/[A-Z]/.test(value)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(value)) {
    return "Password must contain at least one lowercase letter";
  }

  return null;
}
