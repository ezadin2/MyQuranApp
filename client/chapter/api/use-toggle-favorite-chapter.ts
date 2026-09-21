import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleFavoriteChapter, type ChapterFavorite } from "@/lib/app-storage";
import { useTranslations } from "next-intl";

type reqT = { chapterId: number };

type mutationContext = {
  prevQuery?: ChapterFavorite[];
};

export default function useToggleFavoriteChapter() {
  const queryClient = useQueryClient();
  const t = useTranslations("General");

  return useMutation<ChapterFavorite[], Error, reqT, mutationContext>({
    mutationFn: async ({ chapterId }) => toggleFavoriteChapter(chapterId),
    onMutate: async (newQuery) => {
      await queryClient.cancelQueries({ queryKey: ["favorite_chapters_ids"] });
      const prevQuery = queryClient.getQueryData<ChapterFavorite[]>(["favorite_chapters_ids"]);
      const isExist = prevQuery?.find((q) => q.chapterId === newQuery.chapterId);
      if (isExist) {
        queryClient.setQueryData<ChapterFavorite[]>(["favorite_chapters_ids"], (old = []) =>
          old.filter((query) => query.chapterId !== newQuery.chapterId)
        );
      } else {
        queryClient.setQueryData<ChapterFavorite[]>(["favorite_chapters_ids"], (old = []) => [...old, newQuery]);
      }
      return { prevQuery };
    },
    onSuccess: () => {
      toast.success(t("success"));
    },
    onError: (error, _newQuery, context) => {
      queryClient.setQueryData(["favorite_chapters_ids"], context?.prevQuery);
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite_chapters_ids"] });
    },
  });
}
