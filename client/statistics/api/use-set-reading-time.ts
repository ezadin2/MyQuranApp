import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addReadingTimeMs } from "@/lib/app-storage";

type reqT = { time: number };

export default function useSetReadingTime() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, reqT>({
    mutationFn: async ({ time }) => {
      await addReadingTimeMs(time);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reading_time"] });
    },
  });
}
