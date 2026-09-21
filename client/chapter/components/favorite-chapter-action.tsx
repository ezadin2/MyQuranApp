"use client";

import { Heart, HeartOff } from "lucide-react";
import { cn } from "@/lib/utils";
import useToggleFavoriteChapter from "../api/use-toggle-favorite-chapter";
import useGetFavoriteChaptersIds from "../api/use-get-favorite-chapters-ids";
import Spinner from "@/components/spinner";

type props = {
  chapterId: number;
};

export default function FavoriteChapter({ chapterId }: props) {
  const favoriteChapterMutation = useToggleFavoriteChapter();
  const favoriteChaptersQuery = useGetFavoriteChaptersIds();

  if (favoriteChaptersQuery.isLoading || favoriteChaptersQuery.isPending) return <Spinner />;
  if (favoriteChaptersQuery.isError) return <HeartOff className="text-muted-foreground cursor-not-allowed" />;

  const isFavorite = (favoriteChaptersQuery.data ?? []).some((chapter) => chapterId === chapter.chapterId);

  const toggleFavorite = () => {
    favoriteChapterMutation.mutate({ chapterId });
  };

  return (
    <button disabled={favoriteChapterMutation.isPending} onClick={toggleFavorite}>
      <Heart className={cn("text-muted-foreground cursor-pointer", isFavorite && "fill-rose-500 text-rose-500")} />
    </button>
  );
}
