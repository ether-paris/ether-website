import { error } from "@sveltejs/kit";
import { isLocale } from "$lib/i18n/config";
import { logVisitor } from "$lib/server/db";
import { getDictionary } from "$lib/i18n/dictionaries";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({
  params,
  request,
  getClientAddress,
}) => {
  const locale = params.locale;

  if (!isLocale(locale)) {
    throw error(404, "Not found");
  }

  // Log visitor
  try {
    const ip = request.headers.get("x-forwarded-for") || getClientAddress();
    const userAgent = request.headers.get("user-agent") || "unknown";
    const path = `/${locale}`;
    logVisitor(ip, userAgent, path);
  } catch (e) {
    // ignore
  }

  return {
    locale,
    dictionary: getDictionary(locale),
  };
};

// Actions remain the same...
import { fail } from "@sveltejs/kit";
import { z } from "zod";
import { defaultLocale } from "$lib/i18n/config";
import { sendContactEmail } from "$lib/server/email";

const contactSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(12),
  locale: z.string().optional(),
});

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const payload = Object.fromEntries(formData.entries());

    const parsed = contactSchema.safeParse({
      name: payload.name,
      email: payload.email,
      company: payload.company,
      message: payload.message,
      locale: payload.locale,
    });

    const locale =
      parsed.success &&
      parsed.data.locale &&
      isLocale(parsed.data.locale as string)
        ? (parsed.data.locale as import("$lib/i18n/config").Locale)
        : defaultLocale;
    const dictionary = getDictionary(locale);

    if (!parsed.success) {
      return fail(400, {
        success: false,
        message: dictionary.contactForm.error,
        errors: parsed.error.flatten(),
      });
    }

    try {
      await sendContactEmail({
        name: parsed.data.name,
        email: parsed.data.email,
        company: parsed.data.company,
        message: parsed.data.message,
      });
      return {
        success: true,
        message: dictionary.contactForm.success,
      };
    } catch (e) {
      console.error(e);
      return fail(500, {
        success: false,
        message: dictionary.contactForm.error,
      });
    }
  },
};
