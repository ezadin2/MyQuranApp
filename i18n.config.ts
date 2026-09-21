export type Locale = (typeof locales)[number];

export const locales = ["ar", "en", "fr", "tr", "ru", "am", "om"] as const;
export const defaultLocale: Locale = "en";
