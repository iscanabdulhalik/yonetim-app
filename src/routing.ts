import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  localePrefix: "always",
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
    "/admin/dashboard": {
      tr: "/admin/dashboard",
      en: "/admin/dashboard",
    },
    "/admin/sites": {
      tr: "/admin/sites",
      en: "/admin/sites",
    },
    "/admin/users": {
      tr: "/admin/users",
      en: "/admin/users",
    },
    "/admin/settings": {
      tr: "/admin/settings",
      en: "/admin/settings",
    },
  },
});
