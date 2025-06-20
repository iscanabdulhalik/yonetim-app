import { useTranslations } from "next-intl";

export function useClientTranslations() {
  const t = useTranslations();
  return t;
}
