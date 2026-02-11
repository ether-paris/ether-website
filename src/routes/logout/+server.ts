import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { deleteSession } from "$lib/server/db";

export const POST: RequestHandler = async ({ cookies }) => {
  const sessionToken = cookies.get("session");

  if (sessionToken) {
    // Delete session from database
    await deleteSession(sessionToken);

    // Clear session cookie
    cookies.delete("session", { path: "/" });
  }

  throw redirect(302, "/");
};

export const GET: RequestHandler = async () => {
  // GET requests also log out (for convenience)
  throw redirect(302, "/");
};
