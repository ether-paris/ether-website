import { executeQuery } from "$lib/server/db";
import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ether-admin";
const COOKIE_NAME = "ether_admin_auth";

export const load: PageServerLoad = async ({ cookies }) => {
  const authCookie = cookies.get(COOKIE_NAME);
  const authenticated = authCookie === "true";

  let initialResult = null;
  if (authenticated) {
    try {
      initialResult = await executeQuery(
        "SELECT * FROM visitors ORDER BY timestamp DESC LIMIT 50;",
      );
    } catch (e) {
      console.error("Failed to load default query", e);
    }
  }

  return {
    authenticated,
    initialResult,
  };
};

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const formData = await request.formData();
    const password = formData.get("password")?.toString();

    if (password === ADMIN_PASSWORD) {
      cookies.set(COOKIE_NAME, "true", {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
      });
      return { success: true };
    }

    return fail(401, { error: "Incorrect password" });
  },

  query: async ({ request, cookies }) => {
    const authCookie = cookies.get(COOKIE_NAME);
    if (authCookie !== "true") {
      return fail(401, { error: "Unauthorized" });
    }

    const formData = await request.formData();
    const query = formData.get("query")?.toString();

    if (!query) {
      return fail(400, { error: "Query is required" });
    }

    try {
      const result = await executeQuery(query);
      return { success: true, result, query };
    } catch (e: any) {
      return fail(500, { error: e.message, query });
    }
  },

  logout: async ({ cookies }) => {
    cookies.delete(COOKIE_NAME, { path: "/" });
    return { success: true };
  },
};
