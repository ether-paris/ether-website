import { getDictionary } from "$lib/i18n/dictionaries";
import type { Locale } from "$lib/i18n/config";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ data }) => {
  return {
    ...data,
    dictionary: getDictionary(data.locale as Locale),
  };
};
