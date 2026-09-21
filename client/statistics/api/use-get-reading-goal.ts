import { useQuery } from "@tanstack/react-query";
import { getDailyReadingGoal } from "@/lib/app-storage";

export default function useGetReadingGoal() {
  return useQuery({
    queryKey: ["reading_goal"],
    queryFn: getDailyReadingGoal,
  });
}
