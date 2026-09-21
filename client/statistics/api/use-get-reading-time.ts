import { useQuery } from "@tanstack/react-query";
import { getReadingTimeEntries } from "@/lib/app-storage";

export default function useGetReadingTime() {
  return useQuery({
    queryKey: ["reading_time"],
    queryFn: getReadingTimeEntries,
  });
}
