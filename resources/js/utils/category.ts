export type LocalizedCategory = {
  name: string;
  name_en?: string | null;
  name_ru?: string | null;
  name_ka?: string | null;
};

export type SupportedLang = "ka" | "en" | "ru";

export function getCategoryLabel(category: LocalizedCategory, lang: SupportedLang): string {
  const localized =
    lang === "ru"
      ? category.name_ru
      : lang === "ka"
      ? category.name_ka
      : category.name_en;

  return (localized || category.name_en || category.name).trim();
}
