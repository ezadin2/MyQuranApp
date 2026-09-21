import { useQuery } from "@tanstack/react-query";
import { getBookmarkVerses } from "@/lib/app-storage";

export default function useGetBookmarkVersesIds(enabled = true) {
  return useQuery({
    queryKey: ["booked_verses_ids"],
    queryFn: getBookmarkVerses,
    enabled,
  });
}
