import { useQuery, useQueryClient } from "@tanstack/react-query";

import { handleErrors } from "@/lib/errors";
import { fetchAmharicChapter } from "@/lib/quran/amharic";
import { fetchOromoChapter } from "@/lib/quran/oromo";
import { QURAN_JSON_API_URL } from "@/constants";
import { Locale } from "@/i18n.config";
import { Chapter } from "@/types";
import { useLocale } from "next-intl";
import { useEffect } from "react";

export default function useGetChapter(id: string) {
  const locale = useLocale() as Locale;
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["chapter", id],
    queryFn: async () => {
      if (locale === "am") {
        return fetchAmharicChapter(id);
      }

      if (locale === "om") {
        return fetchOromoChapter(id);
      }

      const apiUrl = locale === "ar" ? `${QURAN_JSON_API_URL}/chapters/${id}.json` : `${QURAN_JSON_API_URL}/chapters/${locale}/${id}.json`;
      const res = await fetch(apiUrl);

      // handle throw the error response
      if (!res.ok) {
        throw await handleErrors(res);
      }
      const data = (await res.json()) as Chapter;

      return data;
    },
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["chapter", id] });
  }, [locale, id, queryClient]);

  return query;
}
