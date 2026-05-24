import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|png|svg|ico)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};