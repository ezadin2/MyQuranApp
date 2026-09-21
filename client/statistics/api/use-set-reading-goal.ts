import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { setDailyReadingGoal } from "@/lib/app-storage";
import { useTranslations } from "next-intl";

type reqT = { readingGoal: number };

export default function useSetReadingGoal() {
  const queryClient = useQueryClient();
  const t = useTranslations("General");

  return useMutation<void, Error, reqT>({
    mutationFn: async ({ readingGoal }) => {
      await setDailyReadingGoal(readingGoal);
    },
    onSuccess: () => {
      toast.success(t("success"));
      queryClient.invalidateQueries({ queryKey: ["reading_goal"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
