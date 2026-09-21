import { useQuery } from "@tanstack/react-query";

import { handleErrors } from "@/lib/errors";
import { fetchAmharicVerseTranslation } from "@/lib/quran/amharic";
import { fetchOromoVerseTranslation } from "@/lib/quran/oromo";
import { QURAN_JSON_API_URL } from "@/constants";

import { Chapter, Verse } from "@/types";
import { Locale } from "@/i18n.config";
import { useLocale } from "next-intl";

export default function useGetRandomVerse(verseNumber?: number) {
  const locale = useLocale() as Locale;
  const query = useQuery({
    queryKey: ["random_verse", verseNumber, locale],
    queryFn: async () => {
      const res = await fetch(`${QURAN_JSON_API_URL}/verses/${verseNumber}.json`);

      // handle throw the error response
      if (!res.ok) {
        throw await handleErrors(res);
      }
      const data = (await res.json()) as Verse & { chapter: Chapter };

      if (locale === "am") {
        const amTranslation = await fetchAmharicVerseTranslation(data.chapter.id, data.number);
        if (amTranslation) {
          data.translations = { ...data.translations, am: amTranslation };
        }
      }

      if (locale === "om") {
        const omTranslation = await fetchOromoVerseTranslation(data.chapter.id, data.number);
        if (omTranslation) {
          data.translations = { ...data.translations, om: omTranslation };
        }
      }

      return data;
    },
    enabled: !!verseNumber,
  });

  return query;
}
