import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: {
      home: (await import(`../messages/home/${locale}.json`)).default,
      header: (await import(`../messages/header/${locale}.json`)).default,
      faq: (await import(`../messages/home/FAQ/${locale}.json`)).default,
      footer: (await import(`../messages/footer/${locale}.json`)).default,

    },
  };
});
