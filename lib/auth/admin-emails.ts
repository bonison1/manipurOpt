// Path: lib/auth/admin-emails.ts
// Owner/bootstrap admins from env. Pure helper (no server-only imports), safe for middleware.
// ADMIN_EMAILS="a@gmail.com,b@gmail.com" in .env

export function bootstrapAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isBootstrapAdmin(email?: string | null) {
  return !!email && bootstrapAdminEmails().includes(email.toLowerCase());
}