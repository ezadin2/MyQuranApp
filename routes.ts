/**
 * Routes that do not require server authentication (app uses local device storage).
 */
export const publicRoutes = ["/", "/chapter", "/favorites", "/bookmarks", "/statistics"];

export const authRoutes = ["/sign-in", "/sign-up", "/auth/error", "/auth/reset", "/auth/new-password"];

export const apiAuthPrefix = ["/api"];

export const DEFAULT_SIGN_IN_REDIRECT = "/";
export const DEFAULT_SIGN_OUT_REDIRECT = "/";
export const DEFAULT_AUTH_ERROR_REDIRECT = "/";
