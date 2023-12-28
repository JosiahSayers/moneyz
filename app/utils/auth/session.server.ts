// app/services/session.server.ts
import { createCookieSessionStorage } from "@remix-run/node";

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET variable not set');
}

interface SessionData {
  accessToken: string;
  id: string;
}

// export the whole sessionStorage object
export let sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export let { getSession, commitSession, destroySession } = sessionStorage;
