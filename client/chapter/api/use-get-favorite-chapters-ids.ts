import { useQuery } from "@tanstack/react-query";
import { getFavoriteChapters } from "@/lib/app-storage";

export default function useGetFavoriteChaptersIds(enabled = true) {
  return useQuery({
    queryKey: ["favorite_chapters_ids"],
    queryFn: getFavoriteChapters,
    enabled,
  });
}
