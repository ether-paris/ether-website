import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getGitHubOAuthUrl, generateState } from "$lib/server/auth";

export const GET: RequestHandler = async ({ cookies }) => {
  try {
    // Generate state parameter for CSRF protection
    const state = generateState();

    // Store state in cookie (valid for 10 minutes)
    cookies.set("oauth_state", state, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax",
    });

    // Redirect to GitHub OAuth
    const authUrl = getGitHubOAuthUrl(state);
    throw redirect(302, authUrl);
  } catch (error: any) {
    if (error.status === 302) {
      throw error;
    }
    console.error("OAuth init error:", error);
    throw redirect(302, "/login?error=oauth_init_failed");
  }
};
