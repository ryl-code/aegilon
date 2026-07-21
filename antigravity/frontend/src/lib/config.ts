/**
 * Preview / auth-bypass flag.
 *
 * When NEXT_PUBLIC_AUTH_BYPASS === "true" the app skips the login gate so the
 * dashboard UI can be browsed without authenticating. This is a DEV PREVIEW
 * switch only — leave it unset (or "false") for real deployments so JWT auth
 * is enforced normally.
 */
export const AUTH_BYPASS = true;
