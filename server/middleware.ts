import { Hono } from "hono";
import { authRoutes } from "@/routes";
import { NextResponse } from "next/server";

const app = new Hono();

app.all("*", async (c) => {
  const pathname = new URL(c.req.url).pathname;
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    return Response.redirect(new URL("/", c.req.url));
  }

  return NextResponse.next();
});

export default app;
