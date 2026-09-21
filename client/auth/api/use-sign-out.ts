import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import client from "@/server/client";
import { InferRequestType, InferResponseType } from "hono";
import { handleErrors } from "@/lib/errors";
import { DEFAULT_SIGN_OUT_REDIRECT } from "@/routes";
import { AUTH_SESSION_QUERY_KEY } from "@/hooks/use-session";

const $post = client.api.v1["auth"]["sign-out"].$post;

type resT = InferResponseType<typeof $post>;
type reqT = InferRequestType<typeof $post>;

export default function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation<resT, Error, reqT>({
    mutationFn: async () => {
      const res = await $post();

      // handle throw the error response
      if (!res.ok) {
        throw await handleErrors(res);
      }

      return await res.json();
    },
    onSuccess: async ({ message }) => {
      toast.success(message);
      await queryClient.invalidateQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
      router.refresh();
      router.push(DEFAULT_SIGN_OUT_REDIRECT);
    },
    onError: (error) => {
      console.log(error);

      toast.error(error.message);
    },
  });

  return mutation;
}
