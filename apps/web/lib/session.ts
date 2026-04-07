export const AUTH_EMAIL_KEY = "bitsio_magic_email";
export const GUEST_UID_KEY = "bitsio_guest_uid";

export function getOrCreateGuestId(): string {
  const existing = window.localStorage.getItem(GUEST_UID_KEY);
  if (existing) {
    return existing;
  }

  const created =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `guest-${Date.now()}`;

  window.localStorage.setItem(GUEST_UID_KEY, created);
  return created;
}
