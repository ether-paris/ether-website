import { redirect } from "@sveltejs/kit";
import { defaultLocale } from "$lib/i18n/config";

export function load() {
  redirect(307, `/${defaultLocale}`);
}
