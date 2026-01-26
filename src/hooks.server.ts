import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  // Fix protocol mismatch behind proxy (Cloudflare -> Ingress -> Pod)
  // This prevents SvelteKit from blocking POST requests due to CSRF origin mismatch
  // (Browser says Origin: https://... but Pod sees http://...)

  const proto = event.request.headers.get("x-forwarded-proto");

  if (proto && proto !== event.url.protocol.slice(0, -1)) {
    // We need to treat this request as HTTPS
    // event.url is derived, so we can't easily set it directly in some versions,
    // but let's try to override the property if possible, or use the SvelteKit recommended way.
    // Actually, simply relying on the fact that we trust the proxy:
    // We can allow the request to proceed.
  }

  // A more robust way in SvelteKit 2:
  if (proto === "https") {
    // Hack: redefine the url getter or property
    Object.defineProperty(event, "url", {
      value: new URL(event.url.toString().replace(/^http:/, "https:")),
      writable: false,
    });
  }

  return resolve(event);
};
