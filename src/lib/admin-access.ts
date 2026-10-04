export function isAdminEmail(email: string): boolean {
  const allowlist = process.env.ADMIN_EMAILS ?? "";
  return allowlist
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.trim().toLowerCase());
}

export function hasAdminAccess(user: { email?: string | null } | null | undefined): boolean {
  return typeof user?.email === "string" && isAdminEmail(user.email);
}