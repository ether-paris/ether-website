import type { Handle } from "@sveltejs/kit";
import { getSessionByToken, cleanupExpiredSessions } from "$lib/server/db";

// Clean up expired sessions periodically
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

export const handle: Handle = async ({ event, resolve }) => {
  // Cleanup expired sessions every hour
  if (Date.now() - lastCleanup > CLEANUP_INTERVAL) {
    await cleanupExpiredSessions();
    lastCleanup = Date.now();
  }

  // Get session from cookie
  const sessionToken = event.cookies.get("session");

  if (sessionToken) {
    const session = await getSessionByToken(sessionToken);

    if (session) {
      // Attach user to locals
      event.locals.user = {
        id: session.user_id,
        github_id: session.github_id,
        github_username: session.github_username,
        github_email: session.github_email,
        github_access_token: session.github_access_token,
        avatar_url: session.avatar_url,
      };
    } else {
      // Invalid session, clear cookie
      event.cookies.delete("session", { path: "/" });
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  const response = await resolve(event);
  return response;
};
