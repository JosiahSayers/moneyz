import { json } from "@remix-run/node";
import { db } from "~/utils/database.server";

async function isDbConnected() {
  try {
    return !!(await db.$queryRaw`SELECT 1`);
  } catch (e) {
    console.error(`DB connection error on /health`, e);
    return false;
  }
}

export async function loader() {
  const dbConnected = await isDbConnected();
  const status = dbConnected ? "ok" : "error";
  return json(
    {
      dbConnected,
      status,
      version: process.env.APP_VERSION || "unknown",
      currentTime: new Date().toISOString(),
    },
    status === "ok" ? 200 : 500
  );
}
