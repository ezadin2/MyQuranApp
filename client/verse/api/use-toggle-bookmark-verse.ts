import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleBookmarkVerse, type VerseBookmark } from "@/lib/app-storage";
import { useTranslations } from "next-intl";

type reqT = { chapterId: number; verseId: number };

type mutationContext = {
  prevQuery?: VerseBookmark[];
};

export default function useToggleBookmarkVerse() {
  const queryClient = useQueryClient();
  const t = useTranslations("General");

  return useMutation<VerseBookmark[], Error, reqT, mutationContext>({
    mutationFn: async ({ chapterId, verseId }) => toggleBookmarkVerse(chapterId, verseId),
    onMutate: async (newQuery) => {
      await queryClient.cancelQueries({ queryKey: ["booked_verses_ids"] });
      const prevQuery = queryClient.getQueryData<VerseBookmark[]>(["booked_verses_ids"]);
      const isExist = prevQuery?.findIndex(
        (q) => q.chapterId === newQuery.chapterId && q.verseId === newQuery.verseId
      );
      if (isExist !== undefined && isExist !== -1) {
        queryClient.setQueryData<VerseBookmark[]>(["booked_verses_ids"], (old = []) =>
          old.filter((_, i) => i !== isExist)
        );
      } else {
        queryClient.setQueryData<VerseBookmark[]>(["booked_verses_ids"], (old = []) => [...old, newQuery]);
      }
      return { prevQuery };
    },
    onSuccess: () => {
      toast.success(t("success"));
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(["booked_verses_ids"], context?.prevQuery);
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["booked_verses_ids"] });
    },
  });
}
