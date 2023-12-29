import { getSession } from "~/utils/auth/session.server";
import { authRedirectUrl, introspectAccessToken } from '~/utils/auth/authelia.server';
import { redirect } from "@remix-run/node";
import { db } from "~/utils/database.server";

export async function requireUser(request: Request) {
  try {
    const session = await getSession(request.headers.get('cookie'));
    const accessToken = session.get('accessToken');
    if (!accessToken) {
      throw new Error('Access token not present in session');
    }
    const introspection = await introspectAccessToken(accessToken);
    if (!introspection.active) {
      throw new Error('Access token no longer valid');
    }
    const user = await db.user.findUnique({ where: { username: introspection.username } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (e) {
    console.log(e);
    throw redirect(authRedirectUrl());
  }
}
