// UMD-only sign-in. The server enforces the same rule (supabase/migrations/0001_umd_only_signups.sql).

const UMD_EMAIL = /^[^\s@]+@(?:terpmail\.)?umd\.edu$/i;

export function isUmdEmail(email: string): boolean {
  return UMD_EMAIL.test(email.trim());
}

export function emailProblem(email: string): string | null {
  return isUmdEmail(email) ? null : "Use your @umd.edu or @terpmail.umd.edu address.";
}
