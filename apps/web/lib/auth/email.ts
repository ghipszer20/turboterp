// UMD-only sign-in. The server enforces the same rule (supabase/migrations/0001_umd_only_signups.sql).

const UMD_DOMAINS = ["umd.edu", "terpmail.umd.edu"];

export function isUmdEmail(email: string): boolean {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return false;
  const [name, domain] = parts;
  return name !== "" && !/\s/.test(name) && UMD_DOMAINS.includes(domain);
}

export function emailProblem(email: string): string | null {
  return isUmdEmail(email) ? null : "Use your @umd.edu or @terpmail.umd.edu address.";
}
