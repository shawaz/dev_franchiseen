import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher(["/server", "/(platform)(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (!req) {
    console.error("Request object is undefined");
    return;
  }
  
  try {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  } catch (error) {
    console.error("Error in middleware:", error);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
