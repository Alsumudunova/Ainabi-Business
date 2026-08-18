import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ky from "./locales/ky.json";
import ru from "./locales/ru.json";

export const SUPPORTED_LANGUAGES = ["ky", "ru"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = "ainabi_lang";
/** Sent to the backend on every request so error/validation messages come
 * back in the same language as the UI — see backend/src/i18n/messages.ts. */
export const LANGUAGE_HEADER = "X-App-Language";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ky: { translation: ky },
      ru: { translation: ru },
    },
    fallbackLng: "ky",
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
