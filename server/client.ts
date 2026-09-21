import { AppType } from "./";
import { hc } from "hono/client";

const baseUrl =
  typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");

const client = hc<AppType>(baseUrl);
export default client;
