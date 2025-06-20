import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  pathnames: {
    "/": "/",
    "/auth/login": {
      tr: "/auth/login",
      en: "/auth/login",
    },
    "/auth/register": {
      tr: "/auth/register",
      en: "/auth/register",
    },
  },
});
